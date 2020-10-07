const express = require('express');
const player_instance = require('./player.js');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const player = require('./player.js');

players = {};

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
    players[socket.id]  = new player();
    io.emit('create', socket.id);

    socket.on('disconnect', function() {
        delete players[socket.id];
        io.emit('disconnect', socket.id);
        console.log('user disconnected', socket.id);
    });

    socket.on('keydown', function(keycode) {
        players[socket.id].keypress[keycode] = true;
    })

    socket.on('keyup', function(keycode) {
        players[socket.id].keypress[keycode] = false;
    })

});

const UP = 38, DOWN = 40;
var update = setInterval(function(){
    // check if players are connected or disconnceted all the time.
    var status = {};
    var ids = [];
    for(var id in io.sockets.clients().connected) {
        if(players[id].keypress[UP]) {
            players[id].to_trans.y -= 7;
        }
        if(players[id].keypress[DOWN]) {
            players[id].to_trans.y += 7;
        }
        ids.push(id);
        status[id] = players[id].to_trans;
    }
    io.emit('update', ids, status);
}, 10);

var port = 3000;
http.listen(port, function() {
    console.log("listening on port " + port);
});