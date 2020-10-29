const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const player = require('./player.js');
const ball_obj = require('./ball.js')

const setups = {
    width : 700,
    height: 600
}

const game_state = ["ST_IDLE", "ST_ONGAME", "ST_LEFTBALL", "ST_RIGHTBALL"]

let curr_state = game_state[0]; 
let players = {};
let ball = new ball_obj((setups.width - 20) / 2, (setups.height - 20) / 2);
let player1_id, player2_id;
let num_player = 1;

// TODO: server send clients respect to setup parameters


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    io.emit('setup', setups)
    if(num_player == 1) {
        players[socket.id]  = new player(20, (setups.height - 100)/ 2, num_player);
        player1_id = socket.id;
        console.log(player1_id);
        console.log(num_player + "P")
        num_player++;
    }
    else if(num_player == 2) {
        player2_id = socket.id;
        console.log(player2_id);
        players[socket.id] = new player(setups.width - 40, (setups.height - 100) / 2, num_player);
    }

    console.log('user connected', socket.id, num_player);
    socket.on('disconnect', () => {
        if(players[socket.id].player_num == 1){
            num_player--;
        }
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

const UP = 38, DOWN = 40, SPACE = 32;
var update = setInterval(() => {
    // check if players are connected or disconnceted 'all the time'.
    let status = {};
    let ids = [];
    for(var id in io.sockets.clients().connected) {
        if(players[id].keypress[UP]) {
            players[id].to_trans.y-= 7;
        }
        if(players[id].keypress[DOWN]) {
            players[id].to_trans.y+= 7;
        }
        if(players[id].keypress[SPACE] && 
            curr_state != "ST_ONGAME" && num_player == 2) {
            ball.vel_x = ball.speed;
            curr_state = "ST_ONGAME";
        }

        ids.push(id);
        status[id] = players[id].to_trans;
    }
    curr_state = ball.update(players[player1_id], players[player2_id], curr_state);
    io.emit('update', ids, status, ball.to_trans);
}, 30);

const port = 3000;
http.listen(port, () => {
    console.log("listening on port " + port);
});