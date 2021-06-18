'use strict'

import Main from "./Main.js";
import Artist from "../utility/Artist.js";
import MineField from "../minefield/MineField.js";
import Block from "../block/Block.js";

/**
 * Phaser doesn't like how Mootools classes makes methods so I
 * have to make the Scene classes this way.
 *
 * @extends Main - extending main so I can reuse the drawing methods used
 */
class NextDisplay extends Main
{
    // the field to be displayed in the canvas
    boundaryGroup;
    placedGroup;
    currentField;

    static width = 7;
    static height = 7;

    constructor()
    {
        super();
        this.currentField = null;
        this.boundaryGroup = [];
        this.placedGroup = [];

        // set to false so the user can't click on it
        this.alive = false;
    }

    /**
     * Clones the next field in queue from the main class and displays it
     * in the canvas
     */
    setField()
    {
        // clone the next object in queue
        this.clone(Main.getNextInQueue());

        if (this.currentField !== null)
        {
            this.placedGroup.forEach(x =>
            {
                this.deleteBlock(x.block);
            })

            if (this.currentField !== undefined)
            {
                this.currentField.x = NextDisplay.width / 2 - 1;
                this.currentField.y = NextDisplay.height / 2 - 1;

                this.currentField = Object.setPrototypeOf(this.currentField, new MineField);

                // set the blocks in copied object to instances of Block
                for (let i = 0; i < this.currentField.blocks.length; i++)
                {
                    this.currentField.blocks[i] = Object.setPrototypeOf(this.currentField.blocks[i], new Block);
                }

                this.currentField.positionBlocks();

                Artist.drawField(this, this.currentField);

                this.addCurrentToPlaced();
            }
        }
    }

    /**
     * Structured cloning method for objects by surma (23 Jan 2018)
     * ***
     * NOT MY CODE, src: https://github.com/whatwg/html/issues/793
     * @param obj
     */
    clone(obj)
    {
        new Promise(resolve =>
        {
            const {port1, port2} = new MessageChannel();
            port2.onmessage = ev => resolve(ev.data);
            port1.postMessage(obj);
            return obj;
        }).then(r =>
        {
            this.currentField = r;
        })
    }

    /**
     * Phaser standard - pre-loads assets
     */
    preload()
    {
        let frameConfig = {frameWidth: Main.blockSize, frameHeight: Main.blockSize};

        // only need to load these since other textures won't be displayed.
        this.load.spritesheet(Texture.zero, Texture.zero, frameConfig);
        this.load.spritesheet(Texture.default, Texture.default, frameConfig);
    }

    /**
     * Phaser standard - creates game
     */
    create()
    {
        // draws the default blocks
        Artist.drawBlocks(this, 1, 1, NextDisplay.width, 1, Texture.zero);
        Artist.drawBlocks(this, 1, NextDisplay.height, NextDisplay.width, NextDisplay.height, Texture.zero);

        Artist.drawBlocks(this, 1, 1, 1, NextDisplay.height, Texture.zero);
        Artist.drawBlocks(this, NextDisplay.width, 1, NextDisplay.width, NextDisplay.height, Texture.zero);
    }
    /**
     * Phaser standard, updates in intervals
     * @param time
     * @param delta
     */
    update(time, delta)
    {
        this.setField(Main.queue);
    }
}

export default NextDisplay;

const config = {
    type: Phaser.AUTO,
    width: Main.blockSize * NextDisplay.width,
    height: Main.blockSize * NextDisplay.height,
    physics: {
        default: 'arcade'
    },
    parent: 'next-display',
    pixelArt: true,
    backgroundColor: '#696969',
    scene: [NextDisplay]
}

const game = new Phaser.Game(config);