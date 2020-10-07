const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

let num_user = 0;

let players = {};

function user_object() {
    this.status = {};
    this.status.x = 0;
    this.status.y = 0;
    this.status.height = 100;
    this.status.width = 20;
    this.keypress = [];
}

const KEY_UP = 38,KEY_DOWN = 40, SPACE = 32, KEY_W = 87, KEY_S = 83;
var update = setInterval(function() {
    var id_array = [];
    var status_array = {};
    for(var id in io.sockets.clients().connected) {
        if(players[id].keypress[KEY_UP]) {
            console.log('pressed');
            players[id].status.y += 7;
        }
        if(players[id].keypress[KEY_DOWN]) {
            console.log('pressed');
            players[id].status.y -= 7;
        }

        id_array.push(id);
        status_array[id] = players[id].status;
    }
    io.emit('update', id_array, status_array);
}, 10);

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
    num_user++;
    players[socket.id] = new user_object();
    console.log(socket.id);
    console.log('a user connected');

    if(num_user % 2 == 0) {
        io.emit('GAME START', "Game Start");
        console.log("Game Started");
    }

    socket.on('SCORED', function(msg) {
        io.emit('SCORED', "Someone Scored!");
        console.log(msg);
    });

    socket.on('disconnect', function() {
        io.emit('USR DISCONNECTED', "User Diconnected");
        delete players[socket.id];
        console.log('user disconnected');
    });
});

http.listen(3000, function() {
    console.log('listening on port 3000');
});
