const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const apiNode = require('./routes/events');


app.use(express.json());
app.use('/events', apiNode);

app.get('/test-connection', async (req, res) => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    res.json({
      message: 'Conexão com o banco de dados bem-sucedida!',
      collections: collections.map(col => col.name)
    });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao conectar ao banco de dados', error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Porta ${port} já está em uso. Não foi possível iniciar o servidor.`);
    process.exit(1);
  } else {
    console.error('Erro ao iniciar o servidor:', err);
  }
});