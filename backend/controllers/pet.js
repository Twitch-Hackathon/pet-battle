const Pet = require('../models/pet.js');
const https = require('https');
const io = require('socket.io')(https);

io.on('connection', (socket) => {
    socket.on('attack', (userId, channelId) => {
        Pet.findOne({userId: userId})
            .then((userPet) => {
                Pet.findOne({userId: channelId})
                    .then((broadcasterPet) => {
                        broadcasterPet.set({
                            health: broadcasterPet - (userPet.level * 10)
                        });
                        broadcasterPet.save().then((pet) => {
                            io.emit('attack', pet);
                        })
                    });
            });
    });
});

module.exports = (app) => {
    app.get('/pet', (req, res) => {
        const userId = req.body.userId;
        Pet.findOne({userId: userId})
            .then((pet) => {
                if(pet) {
                    res.send({level: pet.level})
                }
                else {
                    const pet = new Pet({
                        userId: req.userId
                    })
                    pet.save().then((pet) => {
                        res.status(200).send({level: pet.level})
                    })
                }
            })
    });

    app.get('/boss', (req, res) => {
        const userId = req.body.channelId;
        Pet.findOne({userId: channelId})
            .then((pet) => {
                if(pet) {
                    res.send({health: pet.health})
                } else {
                    const pet = new Pet({
                        userId: userId,
                        health: 500,
                        broadcaster: true
                    })
                    pet.save().then((pet) => {
                        res.status(200).send({health: pet.health})
                    })
                }
            })
    });
}
