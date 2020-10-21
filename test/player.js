module.exports = class client{
    constructor(xpos, ypos, num) {
        this.to_trans = {};
        this.to_trans.player_x = xpos;
        this.to_trans.player_y = ypos;

        // HARD-CODED
        this.width = 20;
        this.height = 100
        
        this.player_num  = num;
        this.keypress = [];
    }
};

