const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    method: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    body: {
        type: mongoose.Schema.Types.Mixed,
        required: false
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Event', eventSchema);
