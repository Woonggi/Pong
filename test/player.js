module.exports = class player {
    constructor(xpos = 0, ypos = 0) {
        this.to_trans = {};
        this.to_trans.x = xpos;
        this.to_trans.y = ypos;
        this.width = 20;
        this.height = 100;
        this.randnum = Math.random(),
        this.keypress = [];
    }
};

