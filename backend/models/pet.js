const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const petSchema = Schema({
    level: {
        type: Number,
        default: 0,
        required: true
    },
    userId: {
        type: Number,
        required: true
    },
    health: {
        type: Number,
        require: false
    },
    broadcaster: {
        type: Boolean,
        default: false
    }
})
