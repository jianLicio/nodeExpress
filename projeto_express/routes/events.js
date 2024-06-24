const express = require('express');
const router = express.Router();
const Event = require('../models/event');
const app = express();
const authenticateToken = require('../middleware/auth');
const axios = require('axios');
const urlNode = process.env.API_NODE;

router.use(express.json());
router.use(authenticateToken);

 


router.get('/', async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Evento não encontrado' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  const event = new Event({
    type: req.body.type,
    timestamp: req.body.timestamp,
    device: req.body.device,
    details: req.body.details,
    status: req.body.status,
    personId: req.body.personId,
    gatewayId: req.body.gatewayId,
    sensorId: req.body.sensorId,
    actuatorId: req.body.actuatorId,
    readingId: req.body.readingId,
  });

  try {
    console.log('Recebendo evento:', req.body);
    const newEvent = await event.save();
    console.log('Evento salvo:', newEvent);

    const response = await axios.post(`${urlNode}/events`, req.body);
    res.status(response.status).send(response.data);

    res.status(201).json(newEvent);

  } catch (err) {

    console.error('Erro ao salvar evento:', err);
    res.status(400).json({ message: err.message });

  }
});

router.put('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Evento não encontrado' });

    event.type = req.body.type || event.type;
    event.timestamp = req.body.timestamp || event.timestamp;
    event.device = req.body.device || event.device;
    event.details = req.body.details || event.details;
    event.status = req.body.status || event.status;
    event.personId = req.body.personId || event.personId;
    event.gatewayId = req.body.gatewayId || event.gatewayId;
    event.sensorId = req.body.sensorId || event.sensorId;
    event.actuatorId = req.body.actuatorId || event.actuatorId;
    event.readingId = req.body.readingId || event.readingId;

    const updatedEvent = await event.save();
    res.json(updatedEvent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Evento não encontrado' });

    await event.remove();
    res.json({ message: 'Evento deletado' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/external-data', async (req, res) => {
  try {
    const response = await axios.get(urlNode);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
