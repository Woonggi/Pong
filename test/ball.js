module.exports = class ball{
    constructor(xpos, ypos) {
        this.to_trans = {};
        this.to_trans.x = xpos;
        this.to_trans.y = ypos;
        this.speed = 15;
        this.vel_x = this.speed;
        this.vel_y = 0;

        // For testing, it is hard-coded now.
        this.side = 20;
    }
    update(left_player, right_player, curr_state, io) {
        let pi = Math.PI;

        // HARD-CODED
        const WIDTH = 700;
        const HEIGHT = 600;

        const reset_offset = 5;

        if(curr_state === "ST_IDLE") {
            this.vel_x = 0;    
            this.vel_y = 0;    
        } else if(curr_state === "ST_LEFTBALL") {
            this.to_trans.x = (left_player.width * 2) + reset_offset;
            this.to_trans.y = left_player.to_trans.y + (left_player.height / 2) - (this.side / 2);
            this.speed = 15;
            this.vel_x = 0;    
            this.vel_y = 0;    
        } else if (curr_state === "ST_RIGHTBALL") {
            this.to_trans.x = WIDTH - (right_player.width * 2) - this.side - reset_offset;
            this.to_trans.y = right_player.to_trans.y + (right_player.height / 2) - (this.side / 2);
            this.speed = -15;
            this.vel_x = 0;    
            this.vel_y = 0;    
        } 
        if (curr_state === "ST_ONGAME") {
            this.to_trans.x += this.vel_x;
            this.to_trans.y += this.vel_y;
            // score condition
            if (this.to_trans.x <= 0) {
                curr_state = "ST_LEFTBALL"
                io.to(left_player.id).emit('score', curr_state);
                io.to(right_player.id).emit('score', curr_state);
                right_player.points += 1;
            }
            if (this.to_trans.x > WIDTH) {
                curr_state = "ST_RIGHTBALL"
                io.to(left_player.id).emit('score', curr_state);
                io.to(right_player.id).emit('score', curr_state);
                left_player.points += 1;
            }
            // proceed physics only if game is on going
            if (this.to_trans.y < 0 || this.to_trans.y + this.side > HEIGHT) {
                var offset = this.vel_y < 0 ? 0 - this.to_trans.y : HEIGHT - (this.to_trans.y + this.side);
                this.to_trans.y += 2 * offset;
                this.vel_y *= -1;
            }

            var AABBIntersection = (ax, ay, aw, ah, bx, by, bw, bh) => {
                return ax < bx + bw && ay < by + bh && bx < ax + aw && by < ay + ah;
            }

            let paddle = this.vel_x < 0 ? left_player : right_player;
            if (AABBIntersection(paddle.to_trans.x, paddle.to_trans.y, paddle.width, paddle.height, this.to_trans.x, this.to_trans.y, this.side, this.side)) {
                this.to_trans.x = paddle === left_player ? left_player.to_trans.x + left_player.width : right_player.to_trans.x - this.side;
                let n = (this.to_trans.y + this.side - paddle.to_trans.y) / (paddle.height + this.side);
                let phi = 0.25 * pi * (2 * n - 1);
                let abs_speed = this.speed < 0 ? this.speed * -1 : this.speed;
                this.vel_x = (paddle === left_player ? 1 : -1) * abs_speed* Math.cos(phi);
                this.vel_y = abs_speed * Math.sin(phi);
            }
        }
        return curr_state;
    }
};
