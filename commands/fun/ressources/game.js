class Game {

    constructor(name) {
        this.name = name;
    }

    isStarted = undefined;

    start() {
        this.isStarted = true;
    }

    stop() {
        this.isStarted = false;
    }

}

module.exports = Game;