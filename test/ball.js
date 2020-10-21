module.exports = class ball{
    constructor(xpos, ypos) {
        this.to_trans = {};
        this.to_trans.x = xpos;
        this.to_trans.y = ypos;
        this.speed = 5;
        this.vel_x = 0;//this.speed;
        this.vel_y = this.speed;

        // For testing, it is hard-coded now.
        this.side = 20;
    }

    update(left_player, right_player) {
        this.to_trans.x += this.vel_x;
        this.to_trans.y += this.vel_y;

        // HARD-CODED
        const WIDTH = 700;
        const HEIGHT = 600;

        // proceed physics only if game is on going
        if (0 > this.to_trans.y || this.to_trans.y + this.side > HEIGHT) {
            var offset = this.vel_y < 0 ? 0 - this.vel_y : HEIGHT - (this.vel_y + this.side);
            this.to_trans.y += 2 * offset;
            this.vel_y *= -1;
        }

        if(this.to_trans.y < 0 || this.to_trans.y + this.side > HEIGHT) {
            //var offset = this.vel_y < 0 ? 0 - this.to_trans.y : HEIGHT - (this.to_trans.y + this.side);
            //this.to_trans.y += 2 * offset;
            this.vel_y *= -1;
            console.log('check');
        }
        //console.log(this.vel_y);

        var AABBIntersection = (ax, ay, aw, ah, bx, by, bw, bh) => {
            return ax < bx + bw && ay < by + bh && bx < ax + aw && by < ay + ah;
        }

        var paddle = this.vel_x < 0 ? left_player : right_player;
        if (AABBIntersection(paddle.to_trans.x, paddle.to_trans.y, paddle.width, paddle.height, this.to_trans.x, this.to_trans.y, this.side, this.side)) {
            this.x = paddle === left_player ? left_player.to_trans.x + left_player.width : right_player.to_trans.x - this.side;
            var n = (this.to_trans.y + this.side - paddle.to_trans.y) / (paddle.height + this.side);
            var phi = 0.25 * pi * (2 * n - 1);
            this.vel_x = (paddle === left_player ? 1 : -1) * this.speed * Math.cos(phi);
            this.vel_y = this.speed * Math.sin(phi);
            console.log('check');
        }
        //console.log(this.vel_x);
    }
};