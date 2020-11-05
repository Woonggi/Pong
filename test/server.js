const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const player = require('./player.js');
const ball_obj = require('./ball.js')

const config = {
    screen_width,
    screen_height,
    player_width,
    player_height,
    end_point
} = require('./config.json');

const game_state = ["ST_IDLE", "ST_DISCONNECTED", "ST_READY", "ST_ONGAME", "ST_LEFTBALL", "ST_RIGHTBALL"]

let curr_state = game_state[0]; 
let players = {};
let ball = {}; 
let player1_id, player2_id;
let num_player = 0;


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/client.html');
});

io.on('connection', (socket) => {
    io.emit('config', config);
    io.emit('text_update', "Waiting for other player...");
    if(player1_id == null) {
        players[socket.id]  = new player(config.player_width, (config.screen_height - config.player_height)/ 2, num_player);
        player1_id = socket.id;
        console.log(player1_id);
    }
    else if(player2_id == null) {
        player2_id = socket.id;
        console.log(player2_id);
        players[socket.id] = new player(config.screen_width - config.player_width * 2, (config.screen_height - config.player_height) / 2, num_player);
    }
    num_player++;
    if(num_player >= 2) {
        io.emit('text_update', "");
        curr_state = "ST_READY"
        ball = new ball_obj((config.screen_width - config.player_width) / 2, (config.screen_height - config.player_width) / 2);
    }

    console.log('user connected', socket.id, num_player);
    console.log('num player : ', num_player);
    socket.on('disconnect', () => {
        curr_state = "ST_IDLE";
        io.emit('config', config);
        io.emit('text_update', "Waiting for other player...")
        if(player1_id == socket.id) {
            player1_id = null;
        } 
        else {
            player2_id = null;
        }
        num_player--;
        delete players[socket.id];
        delete ball;
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
    if (curr_state != "ST_IDLE" && player1_id != null && player2_id != null) {
        let status = {};
        let ids = [];
        let start_player_id = player1_id;
        if (curr_state === "ST_RIGHTBALL") {
            start_player_id = player2_id;
        }
        for (var id in io.sockets.clients().connected) {
            if (players[id].keypress[UP]) {
                players[id].to_trans.y -= 7;
            }
            if (players[id].keypress[DOWN]) {
                players[id].to_trans.y += 7;
            }
            if (players[start_player_id].keypress[SPACE] &&
                curr_state != "ST_ONGAME" && num_player == 2) {
                ball.vel_x = ball.speed;
                curr_state = "ST_ONGAME";
            }

            ids.push(id);
            status[id] = players[id].to_trans;
        }
        if (players[player1_id].to_trans.points == config.end_point
            || players[player2_id].to_trans.points == config.end_point) {
            let winner = curr_state === "ST_RIGHTBALL" ? player1_id : player2_id;
            let winning_text = winner + ' Won!';
            curr_state = "ST_GAMEOVER";
            io.emit('game_over', winning_text)
        }

        curr_state = ball.update(players[player1_id], players[player2_id], curr_state);
        io.emit('update', ids, status, ball.to_trans);
    }
}, 30);

const port = 3000;
http.listen(port, () => {
    console.log("listening on port " + port);
});