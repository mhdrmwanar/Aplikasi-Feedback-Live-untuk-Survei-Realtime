// Simple Express + WebSocket server for live feedback
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let feedbacks = [];
let feedbackId = 1;

wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ type: 'init', feedbacks }));
});

app.post('/feedback', (req, res) => {
  const { rating, comment, anonymous } = req.body;
  console.log('Feedback received:', { rating, comment, anonymous }); // log feedback masuk
  if (typeof rating !== 'number' || !comment) {
    return res.status(400).json({ error: 'Invalid input' });
  }
  const fb = { id: feedbackId++, rating, comment, anonymous: !!anonymous };
  feedbacks.push(fb);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'new', feedback: fb }));
    }
  });
  res.json({ success: true });
});

app.get('/feedbacks', (req, res) => {
  res.json(feedbacks);
});

// Hapus satu feedback berdasarkan id
app.delete('/feedback/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const idx = feedbacks.findIndex(fb => fb.id === id);
  if (idx === -1) {
    return res.status(400).json({ error: 'Invalid id' });
  }
  feedbacks.splice(idx, 1);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'init', feedbacks }));
    }
  });
  res.json({ success: true });
});

// Hapus semua feedback
app.delete('/feedbacks', (req, res) => {
  feedbacks = [];
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'init', feedbacks }));
    }
  });
  res.json({ success: true });
});

app.get('/health', (req, res) => res.send('OK'));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log('Server running on port', PORT);
});
