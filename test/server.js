const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const player = require('./player.js');

players = {};

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    players[socket.id]  = new player();
    console.log('user connected', socket.id);
    io.emit('create', socket.id);

    socket.on('disconnect', () => {
        delete players[socket.id];
        io.emit('disconnect', socket.id);
        console.log('user disconnected', socket.id);
    });

    socket.on('keydown', (keycode) => {
        players[socket.id].keypress[keycode] = true;
    });

    socket.on('keyup', (keycode) => {
            players[socket.id].keypress[keycode] = false;
    });

});

const UP = 38, DOWN = 40;
var update = setInterval(() => {
    // check if players are connected or disconnceted all the time.
    let status = {};
    let ids = [];
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
http.listen(port, () => {
    console.log("listening on port " + port);
});