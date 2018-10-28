const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PetSchema = Schema({
    level: {
        type: Number,
        default: 1,
        required: true
    },
    userId: {
        type: String,
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

PetSchema.pre('save', function(next) {
    if(!this.isModified('health')) {
        return next();
    }

    if(this.health <= 0) {
        this.level = this.level + 1;
        this.health = this.level * 100;
    }
    next();
});

module.exports = mongoose.model('Pet', PetSchema);
