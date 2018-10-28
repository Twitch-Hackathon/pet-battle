const Pet = require('../models/pet.js');
const io = require('socket.io')(https);

io.on('connection', (socket) => {
    socket.on('attack', (userId, channelId) => {
        Pet.findOne(userId: req.body.userId)
            .then((userPet) => {
                Pet.findOne(userId: req.body.channelId)
                    .then((broadcasterPet) => {
                        broadcasterPet.set({
                            health: broadcasterPet - (userPet.level * 100);
                        });
                        broadcasterPet.save().then((pet) => {
                            io.emit('attack', pet);
                        })
                    });
            });
    });
})
