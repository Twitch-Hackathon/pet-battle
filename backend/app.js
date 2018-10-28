const app = require('express')();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const PubSub = require('pubsub-js');


var server = require('http').createServer(app);
var io = require('socket.io')(server);

const Pet = require('./models/pet.js');

io.on('connection', (socket) => {
    socket.on('attack', (userId, channelId) => {
        console.log("USER:", userId)
        console.log("CHANNEL", channelId)
        Pet.findOne({userId: userId})
            .then((userPet) => {
                Pet.findOne({userId: channelId})
                    .then((broadcasterPet) => {
                        broadcasterPet.set({
                            health: broadcasterPet.health - (userPet.level * 10)
                        });
                        broadcasterPet.save().then((pet) => {
                            io.emit('attack', pet);
                        })
                    }).catch((err) => {
                        console.error(err);
                    });
            });
    });
});

const pet = require('./controllers/pet.js');

const port = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI||'mongodb://localhost/pet-battle', { useNewUrlParser: true });

const subscribeSubscriber = (msg, data) => {
    console.log(msg, data);
}

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "https://localhost.rig.twitch.tv:8080");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

pet(app);

app.listen(port, () => {
    console.log("Listening on:",port);
})

server.listen(8888, () => {
    console.log("IO Listening on:8888");
});
