'use strict'

import Main from "./Main.js";

/**
 * Phaser doesn't like how Mootools classes makes methods so I
 * have to make the Scene classes this way.
 *
 * @extends Main - extending main so I can reuse the drawing methods used
 */
class ScoreBoard extends Main
{
    // the field to be displayed in the canvas
    boundaryGroup;

    // score and high score text fields
    text;
    subtext;

    // displays the controls for the game
    controlsText;

    static width = 7;
    static height = 7;

    constructor()
    {
        super();
        this.currentField = null;
        this.boundaryGroup = [];
        this.text = '0';
        this.subText = '0';
        this.controlsText = '';

        // set to false so the user can't click on it
        this.alive = false;
    }

    /**
     * Phaser standard - creates game
     */
    create()
    {
        this.text = this.add.text(Main.blockSize, Main.blockSize);
        this.subText = this.add.text(Main.blockSize, Main.blockSize * 2);
        this.controlsText = this.add.text(Main.blockSize, Main.blockSize * 3);

        this.controlsText.setText(
            'Pause: (P) \n' +
            'Mute: (M) \n' +
            'Restart: (R) \n' +
            'Volume Up: ([) \n' +
            'Volume Down: (])');
    }

    update(time, delta)
    {
        this.text.setText('Score: ' + Main.score);
        this.subText.setText('High Score:' + Main.highScore);
    }
}

export default ScoreBoard;

const config = {
    type: Phaser.AUTO,
    width: Main.blockSize * ScoreBoard.width,
    height: Main.blockSize * ScoreBoard.height,
    physics: {
        default: 'arcade'
    },
    parent: 'saved-display',
    pixelArt: true,
    backgroundColor: '#696969',
    scene: [ScoreBoard]
}

const game = new Phaser.Game(config);