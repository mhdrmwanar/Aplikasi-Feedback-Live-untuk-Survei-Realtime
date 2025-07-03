# Aplikasi-Feedback-Live-untuk-Survei-Realtime

Aplikasi web untuk mengumpulkan feedback secara realtime, dengan visualisasi statistik rating, word cloud, dan fitur hapus feedback (satu/satu per satu/semua).

## Fitur
- Kirim feedback (rating, komentar, anonim)
- Statistik rating (Chart.js)
- Word cloud komentar (wordcloud2.js)
- Daftar feedback dengan hapus satu/semua
- Tampilan modern dan responsif
- Real-time update via WebSocket

## Instalasi & Menjalankan

### 1. Clone repository
```bash
git clone <repo-anda>
cd Aplikasi-Feedback-Live-untuk-Survei-Realtime
```

### 2. Install dependensi backend
```bash
cd backend
npm install
```

### 3. Jalankan backend (Express + WebSocket)
```bash
npm start
```
Secara default server berjalan di port 3000.

### 4. Akses aplikasi
Buka browser dan akses:
```
http://localhost:3000/
```

### 5. Struktur Folder
- `backend/` : kode server (Express, WebSocket)
- `frontend/` : file HTML, JS, CSS

## Dependensi
- express
- ws
- cors
- chart.js (CDN)
- wordcloud2.js (CDN)

## Catatan
- Tidak perlu build khusus untuk frontend, cukup buka `index.html` via server backend.
- Untuk fitur real-time, pastikan backend berjalan dan browser mendukung WebSocket.
- Untuk reset data, gunakan tombol "Hapus Semua" di halaman utama.

## Pengembangan
- Semua endpoint API dapat diakses dari browser (lihat di file `server.js`).
- Untuk menambah/mengubah fitur, edit file di folder `frontend/` dan `backend/`.

---

Jika ada pertanyaan atau kendala, silakan hubungi pengembang.
