module.exports = class player{
    constructor(xpos, ypos, num) {
        this.to_trans = {};
        this.to_trans.x = xpos;
        this.to_trans.y = ypos;
        this.to_trans.points = 0;

        // HARD-CODED
        this.width = 20;
        this.height = 100
        
        this.player_num  = num;
        this.keypress = [];
    }
};

