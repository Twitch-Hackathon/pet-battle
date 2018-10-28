const Pet = require('../models/pet.js');

var app = require('express')();



module.exports = (app) => {
    app.post('/pet', (req, res) => {
        const userId = req.body.userId;
        Pet.findOne({userId: userId})
            .then((pet) => {
                if(pet) {
                    res.status(200).json({level: pet.level})
                }
                else {
                    const pet = new Pet({
                        userId: userId
                    })
                    pet.save().then((pet) => {
                        res.status(200).json({level: pet.level})
                    })
                }
            })
    });

    app.post('/boss', (req, res) => {
        const userId = req.body.channelId;
        Pet.findOne({userId: userId})
            .then((pet) => {
                if(pet) {
                    res.send({health: pet.health})
                } else {
                    const pet = new Pet({
                        userId: userId,
                        health: 100,
                        broadcaster: true
                    })
                    pet.save().then((pet) => {
                        res.status(200).json({health: pet.health})
                    })
                }
            })
    });
}
