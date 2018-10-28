const app = require('express')();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
// const PubSub = require('pubsub-js');
const rp = require('request-promise');
const WebSocket = require('ws');

const ws = new WebSocket('wss://pubsub-edge.twitch.tv:443');

var twitchClientCredentialToken = "";

// Get twitch access token and listen to channel
getTwitchClientCredentials()
    .then(function(accessToken){
        // Start listening for subscription event
        var listenRequest = {
            "type": "LISTEN",
            // "nonce": Math.random()*42424242, //optional
            "data": {
                "topics": ["channel-subscribe-events-v1.265737932"],
                "auth_token": twitchClientCredentialToken
            }
        };

        ws.send(JSON.stringify(listenRequest));
    });

function getTwitchClientCredentials() {
    // POST https://id.twitch.tv/oauth2/token?client_id=uo6dggojyb8d6soh92zknwmi5ej1q2&client_secret=nyo51xcdrerl8z9m56w9w6wg&grant_type=client_credentials
    var options = {
        method: 'POST',
        uri: 'https://id.twitch.tv/oauth2/token?client_id=ljv7bvet8kgn92kbt1wem23z43fu6y&client_secret=ax3140sbtm4yztmpo3frazlcgx8q1a&grant_type=client_credentials',
        json: true // Automatically stringifies the body to JSON
    };

    return rp(options)
        .then(function (parsedBody) {
            // POST succeeded...
            console.log(parsedBody)
            twitchClientCredentialToken = parsedBody.access_token;
            return twitchClientCredentialToken;
        })
        .catch(function (err) {
            // POST failed...
            console.log(err)
            return null;
        });
}

ws.on('open', function open() {
    // ws.send('something');
    console.log('~~~~~opened websocket to twitch pubsub server')
    ws.send('{"type": "PING"}');

    // Twitch requires a keepalive ping avery 5 minutes or else it closes the connection
    setTimeout(function(){
        console.log('~~~~~sending keepalive to twitch pubsub server');
        ws.send('{"type": "PING"}');
    }, 240000);
});
ws.on('close', function open() {
    // ws.send('something');
    console.log('~~~~~closed websocket to twitch pubsub server')
});

ws.on('message', function incoming(data) {
    console.log('~~~~~received twitch pubsub data: ' + data);
    var jsonData = JSON.parse(data);

    // Check if the message is a subscribe event
    // NOTE: to simulate this we can change it to a whispers event or something and send a whisper
    if(jsonData.data && jsonData.data.topic && jsonData.data.topic.indexOf('channel-subscribe-events-v1') == 0){
    // if(jsonData.data && jsonData.data.topic && jsonData.data.topic.indexOf('whispers') == 0){
        subscriptionEventHandler(jsonData);
    }
});

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

function subscriptionEventHandler(data) {
    /*
    {
       "type": "MESSAGE",
       "data": {
          "topic": "channel-subscribe-events-v1.44322889",
          "message": {
             "user_name": "dallas",
             "display_name": "dallas",
             "channel_name": "twitch",
             "user_id": "44322889",
             "channel_id": "12826",
             "time": "2015-12-19T16:39:57-08:00",
             "sub_plan": "Prime"/"1000"/"2000"/"3000",
             "sub_plan_name": "Channel Subscription (mr_woodchuck)",
             "months": 9,
             "context": "sub"/"resub",
             "sub_message": {
                "message": "A Twitch baby is born! KappaHD",
                "emotes": [
                {
                   "start": 23,
                   "end": 7,
                   "id": 2867
                }]
             }
         }
       }
    }
     */

    var channelId = data.data.message.channel_id;
    return Pet.findOne({userId: channelId})
        .then((broadcasterPet) => {
            console.log("~~~~~~Leveling up pet for channel: " + channelId);
            broadcasterPet.set({
                level: broadcasterPet.level + 1,
                health: (broadcasterPet.level + 1) * 10
            });
            return broadcasterPet.save().then((pet) => {
                return pet;
            })
        }).catch((err) => {
        console.error(err);
        return err;
    });

}

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
