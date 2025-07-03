const ws = new WebSocket(location.origin.replace(/^http/, 'ws'));
let feedbacks = [];

// Palet warna rating 1-5: 1=merah, 2=oranye, 3=kuning, 4=hijau, 5=biru
const ratingColors = [
  '#e53935', // 1 merah
  '#fb8c00', // 2 oranye
  '#fbc02d', // 3 kuning
  '#43a047', // 4 hijau
  '#1976d2'  // 5 biru
];

function getRatingColor(rating) {
  return ratingColors[rating-1] || '#888';
}

function updateChart() {
  const ctx = document.getElementById('chart').getContext('2d');
  const ratings = [1,2,3,4,5];
  const counts = ratings.map(r => feedbacks.filter(fb => fb.rating === r).length);
  if(window.ratingChart) window.ratingChart.destroy();
  window.ratingChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ratings.map(String),
      datasets: [{
        label: 'Jumlah',
        data: counts,
        backgroundColor: ratings.map(r => getRatingColor(r))
      }]
    },
    options: { scales: { y: { beginAtZero: true, precision:0 } } }
  });
}

function updateWordCloud() {
  // Buat mapping kata -> rating tertinggi yang mengandung kata tsb
  const wordRating = {};
  feedbacks.forEach(fb => {
    if (!fb.comment) return;
    const words = fb.comment.split(/\s+/).map(w => w.replace(/[^\w\u00C0-\u024F\u1E00-\u1EFF]+/g, '').toLowerCase()).filter(w => w);
    words.forEach(word => {
      if (!wordRating[word] || fb.rating > wordRating[word]) {
        wordRating[word] = fb.rating;
      }
    });
  });
  // Hitung frekuensi kata
  const freq = {};
  Object.keys(wordRating).forEach(w => freq[w] = 0);
  feedbacks.forEach(fb => {
    if (!fb.comment) return;
    const words = fb.comment.split(/\s+/).map(w => w.replace(/[^\w\u00C0-\u024F\u1E00-\u1EFF]+/g, '').toLowerCase()).filter(w => w);
    words.forEach(word => { freq[word] = (freq[word]||0)+1; });
  });
  const list = Object.entries(freq).map(([text, weight]) => [text, weight]);
  const el = document.getElementById('wordcloud');
  if (list.length === 0) {
    el.innerHTML = '<span style="color:#888">Belum ada komentar atau kata tidak valid</span>';
  } else if (typeof WordCloud !== 'function') {
    el.innerHTML = '<span style="color:red">WordCloud library tidak ditemukan!</span>';
    console.error('WordCloud library tidak ditemukan!');
  } else {
    try {
      WordCloud(el, {
        list,
        weightFactor: function (size) { return 18 + size * 18; },
        gridSize: 8,
        backgroundColor: '#fff',
        color: function(word) { return getRatingColor(wordRating[word]||1); },
        rotateRatio: 0.1,
        minSize: 14,
        drawOutOfBound: false,
        shrinkToFit: true,
        origin: [el.offsetWidth/2, el.offsetHeight/2],
        fontFamily: 'Arial, sans-serif',
      });
    } catch (err) {
      el.innerHTML = '<span style="color:red">Gagal menampilkan word cloud: ' + err + '</span>';
      console.error('WordCloud error:', err);
    }
  }
}

function refresh() {
  updateChart();
  updateWordCloud();
}

ws.onopen = () => {
  console.log('WebSocket connected');
};
ws.onmessage = (event) => {
  console.log('WebSocket message:', event.data);
  const msg = JSON.parse(event.data);
  if(msg.type === 'init') {
    feedbacks = msg.feedbacks;
    refresh();
  } else if(msg.type === 'new') {
    feedbacks.push(msg.feedback);
    refresh();
  }
};
ws.onerror = (e) => {
  console.error('WebSocket error:', e);
};
ws.onclose = () => {
  console.warn('WebSocket closed');
};

// Tambahkan validasi agar komentar tidak mengandung kata kasar (contoh sederhana)
function isCleanComment(comment) {
  const blacklist = ['kasar1', 'kasar2', 'bodoh', 'anjing']; // tambahkan kata yang ingin diblokir
  return !blacklist.some(word => comment.toLowerCase().includes(word));
}

document.getElementById('feedbackForm').onsubmit = async (e) => {
  e.preventDefault();
  const rating = parseInt(document.getElementById('rating').value);
  const comment = document.getElementById('comment').value.trim();
  const anonymous = document.getElementById('anonymous').checked;
  const submitBtn = document.querySelector('#feedbackForm button[type="submit"]');
  if(!rating || !comment) return;
  if(!isCleanComment(comment)) {
    alert('Komentar mengandung kata yang tidak diperbolehkan!');
    return;
  }
  submitBtn.disabled = true;
  try {
    const res = await fetch('/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, comment, anonymous })
    });
    console.log('Fetch /feedback response:', res.status);
    if (res.ok) {
      alert('Feedback berhasil dikirim!');
      // Tidak perlu push ke feedbacks, biarkan update dari WebSocket
    } else {
      let errMsg = 'Gagal mengirim feedback: ' + res.status;
      try {
        const err = await res.json();
        if (err && err.error) errMsg = 'Gagal mengirim feedback: ' + err.error;
      } catch {}
      alert(errMsg);
    }
  } catch (err) {
    alert('Gagal mengirim feedback: ' + err);
  }
  document.getElementById('feedbackForm').reset();
  submitBtn.disabled = false;
};

// Deteksi mobile device untuk UX lebih baik
function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}
