const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

let num_user = 0;

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
    num_user++;
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
        console.log('user disconnected');
    });
});

http.listen(3000, function() {
    console.log('listening on port 3000');
});
