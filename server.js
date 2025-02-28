const express = require('express');
const app = express();
const port = 8082; // Yeni port numarası

app.get('/', (req, res) => {
  res.send('Yoklama 2 Programı Çalışıyor!');
});

app.listen(port, () => {
  console.log(`Sunucu http://localhost:${port} adresinde çalışıyor`);
});