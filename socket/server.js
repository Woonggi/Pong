const express = require('express');
const app = express();
const path = require('path');
const http = require('http').Server(app);
const io = require('socket.io')(http);

const port = '3000';

app.get("/", function(req, res, next) {
    var options = {
        root: path.join(__dirname),
        dotfiles: 'deny',
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    }
    var filename = "client.html";
    res.sendFile(filename, options, function(err) {
        if(err) {
            next(err);
        }
        else {
            console.log('Sent:', filename);
        }
    });
});

var count = 1;
io.on('connection', function(socket) {
    console.log('user connected', socket.id);
    var name = "user" + count++;
    io.to(socket.id).emit('change name', name);

    socket.on('disconnect', function(){
        console.log('user disconnected: ', socket.id);
    });

    socket.on('send message', function(name, text){
        var msg = name + ' : ' + text;
        console.log(msg);
        io.emit('receive message', msg);
    });
});

http.listen(port, function() {
    console.log("server on!");
});

