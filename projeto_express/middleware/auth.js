const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const app = express();
const mongoUri = process.env.MONGO_URI;

app.use(bodyParser.json());

const connectWithRetry = () => {
  console.log('Tentando conectar ao MongoDB...');
  mongoose.connect(mongoUri)
    .then(() => {
      console.log('Conectado ao MongoDB com sucesso!');
    })
    .catch((err) => {
      console.error('Erro ao conectar ao MongoDB:', err);
      console.log('Tentando reconectar em 5 segundos...');
      setTimeout(connectWithRetry, 5000);
    });
};

connectWithRetry();

const eventSchema = new mongoose.Schema({
  method: String,
  path: String,
  body: mongoose.Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now }
});

const Event = mongoose.model('Evento', eventSchema);

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    console.error('Acesso negado. TOKEN não fornecido.');
    return res.status(401).send('Acesso negado. TOKEN não fornecido.');
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    console.error('Acesso negado. TOKEN inválido.');
    return res.status(401).send('Acesso negado. TOKEN inválido.');
  }

  try {
    console.log('Verificando token:', token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    req.user = decoded;
    console.log('Token verificado com sucesso:', decoded);
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      console.error('Token expirado:', err.message);
      return res.status(401).send('Token expirado.');
    } else if (err.name === 'JsonWebTokenError') {
      console.error('Token malformado ou assinatura inválida:', err.message);
      return res.status(400).send('Token malformado ou assinatura inválida.');
    } else if (err.name === 'NotBeforeError') {
      console.error('Token usado antes de estar válido:', err.message);
      return res.status(400).send('Token usado antes de estar válido.');
    } else {
      console.error('Erro desconhecido na verificação do token:', err.message);
      return res.status(400).send('Token Invalido.');
    }
  }

}

app.post('/events', authenticateToken, async (req, res) => {

  try {
    const event = new Event(req.body);
    await event.save();
    res.status(201).send(event);

  } catch (err) {
    res.status(500).send('Erro ao salvar evento: ' + err.message);
  }

});

module.exports = authenticateToken;