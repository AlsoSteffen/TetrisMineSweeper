'use strict'

import Shape from '../enum/Shape.js';
import Safe from "../block/Safe.js";
import Mine from "../block/Mine.js";
import MineField from "../minefield/MineField.js";
import ControlsHandler from "../utility/ControlsHandler.js";
import Artist from '../utility/Artist.js'

// todo: sounds - music, pausing, game over, line break

// todo: home screen, game over screen, pause screen

// todo: implement saving block and swapping with current

/**
 * Phaser doesn't like how Mootools classes makes methods so I
 * have to make the Scene classes this way.
 */
class Main extends Phaser.Scene
{

    /**
     * This property keeps track of the blocks which were previously controllable
     * MineFields (i.e currentField).
     *
     * Items in this array are stored in an object with the following format:
     *
     * > Object: {block: {Block}, x: {number}, y: {number} }
     *
     * These blocks are kept separate from blocks in the boundary (see: boundaryGroup).
     * @type {[Object]}
     */
    placedGroup = [];

    /**
     * This property keeps track of the blocks in the boundary group.
     *
     * Items in this array are stored in an object with the following format:
     *
     * > Object: { block: {Block}, x: {number}, y: {number} }
     *
     * These blocks are being stored separately so the logic on the functions
     * being used won't necessarily apply to boundary blocks unless specified.
     *
     * @type {[Object]}
     */
    boundaryGroup = [];

    /**
     * This property keeps track of each block object in the canvas,
     * and links that together with a 'ghost'; its drawing representation.
     *
     * Objects in this array are stored in an object with the following format:
     *
     * > Object: { block: {Block}, ghost {scene.image} }
     *
     * The drawings of each block are based on this property, and thus
     * to prevent a destroyed scene image from being redrawn, the corresponding
     * block will also need to be deleted.
     *
     * Conversely, the deleteBlock() method deletes both the ghost and the block
     * from this property, preventing it from being redrawn once deleted.
     *
     * @type [{block: block, ghost: ghost}]
     */
    blocks = [];

    /**
     * This property keeps track of the field which is currently dropping.
     *
     * Stored in a {MineField} object
     */
    currentField;

    // if the game is still on going or not
    alive;

    // if the player has already started or not
    // >>> used to make sure the player can't press start again
    started;

    // if the game is isPaused or not
    isPaused;

    // theme music
    music;
    // explosion sound when die
    explosionSound;
    // music that plays before game starts or is paused
    elevatorMusic

    // main text display
    text;
    // smaller text below main text
    subText;

    // current percent chance that a block will be a mine
    // double between 0 and 1
    mineChance;

    // the saved block
    static savedBlock;
    // upcoming fields
    static queue;
    // game tick rate (Block drop rate)
    static tickRate = 600;
    // block size in px
    static blockSize = 30;

    // scores
    static score = 0;
    static highScore = 0;

    /**
     * If Changing either the width or the height, make sure the they are in a ratio of
     * width : height = 2 : 7 otherwise the physics will break.
     */
        // game width in grid size
    static width = 12;

    /**
     * If Changing either the width or the height, make sure the they are in a ratio of
     * width : height = 2 : 7 otherwise the physics will break.
     */
        // game height in grid size
    static height = 21;

    constructor()
    {
        super();

        this.placedGroup = [];
        this.boundaryGroup = [];
        this.blocks = [];
        Main.queue = [];
        this.currentField = null;
        this.alive = true;
        this.isPaused = false;
        this.text = null;
        this.subText = null;
        this.music = null;
        this.elevatorMusic = null;
        this.explosionSound = null;
        this.mineChance = 0.2;
        Artist.configureCanvas();
    }

    /**
     * Used for getting the x position of a grid-centre
     * @param {number} x - x value request
     * @return {number}
     */
    getX(x)
    {
        return x * Main.blockSize;
    }

    /**
     * Used for getting the y position of a grid-centre
     * @param {number} y - y value request
     * @return {number}
     */
    getY(y)
    {
        return y * Main.blockSize;
    }

    /**
     * Checks if a spot is taken by comparing the coordinates with this.placedGroup coordinates
     * @param {integer} x
     * @param {integer} y
     * @return {boolean} returns true if the spot is taken
     */
    isSpotTaken(x, y)
    {
        let pObj = this.placedGroup.find(obj => obj.x === x && obj.y === y);
        let bObj = this.boundaryGroup.find(obj => obj.x === x && obj.y === y);
        return pObj !== undefined || bObj !== undefined;
    }

    /**
     * Starts the game
     */
    start()
    {
        if (!this.started)
        {
            this.alive = true;
            this.started = true;
            this.music.play();
            this.text.setText('');
            this.subText.setText('');
        }
    }

    /**
     * Ends the game
     */
    die()
    {
        for (let i = 0; i < this.blocks.length; i++)
        {
            let block = this.blocks[i].block;

            // for tinting colors if they were wrongly flagged
            let tint = null;

            // colors blocks red if they were incorrectly flagged
            if (block instanceof Safe && block.flagged)
            {
                tint = 0xff7f7f;
            }

            // colors blocks green if they were correctly flagged
            if (block instanceof Mine && block.flagged)
            {
                tint = 0x7FFF7F;
            }

            block.flagged = false;
            block.unHide();
            Artist.drawBlock(this, block, null, tint);

            this.music.stop();
            this.explosionSound.play();
        }
        this.alive = false;

        this.text.setText(' You Died');
        this.subText.setText('Press (R) to restart');
    }

    /**
     * Restarts the game
     */
    restart()
    {
        if (!this.alive)
        {
            this.time.removeAllEvents();

            Main.tickRate = 600;
            this.mineChance = 0.20;
            Main.queue = [];
            this.reQueue();

            Main.score = 0;

            this.scene.restart();
            this.addCurrentToPlaced();
            this.placedGroup = [];
            this.blocks = [];

            this.alive = true;
            this.music.play();

            this.text.setText('');
            this.subText.setText('');
        }
    }

    /**
     * Places each block in the current mine-field to the placedGroup array
     * To allow interaction with a new field
     */
    addCurrentToPlaced()
    {
        for (let i = 0; i < this.currentField.blocks.length; i++)
        {
            let block = this.currentField.blocks[i];
            let obj = {block: block, x: block.x, y: block.y};
            this.placedGroup.push(obj);
        }

        this.currentField = null;
    }

    /**
     * Gets the object representing the inputted {Block} object from the blocks array
     * @param {Block} block - the block to retrieve the representing object from
     * @return {Object} - object from the blocks array
     */
    getGhostFromBlock(block)
    {
        return this.blocks.find(x => x.block === block);
    }

    /**
     * Gets the object representing the inputted {Scene.Image} object from the
     * blocks array
     * @param ghost - the ghost object to retrieve the representing object from
     * @return {Object} - object from the blocks array
     */
    getBlockFromGhost(ghost)
    {
        return this.blocks.find(x => x.ghost === ghost);
    }

    /**
     * Gets the object from the placedGroup which represents the inputted block
     * @param block - the block from which to get the representing object
     * @return {Object} - object from placedGroup array
     */
    getPlacedFromBlock(block)
    {
        return this.placedGroup.find(x => x.block === block);
    }

    /**
     * Drops a new block and adds another one to the end of the queue
     *
     * > If a block isn't able to be dropped, automatically loses the game
     */
    dropNew()
    {
        this.currentField = Main.queue.shift();

        Artist.drawField(this, this.currentField);

        this.currentField.blocks.forEach(x =>
        {
            if (this.isSpotTaken(x.x, x.y))
            {
                this.die();
            }
        })
        this.reQueue();
    }

    /**
     * Deletes an inputted block from the required properties
     *
     * Make sure to use this method  removing blocks from the canvas
     * to ensure that it doesn't get redrawn by the Artist Class
     * after it is deleted from the scene.
     *
     * @param {Block} block - block to reduce to atoms
     */
    deleteBlock(block)
    {
        let obj = this.getGhostFromBlock(block);

        if (obj !== undefined)
        {
            this.placedGroup = this.placedGroup.filter(x =>
            {
                return x.block !== obj.block;
            });

            // destroy the block
            obj.ghost.destroy();

            // remove the block from this.blocks
            this.blocks = this.blocks.filter(x =>
            {
                return x.block !== block;
            })

            // make block null;
            delete obj.block;
        }
    }

    /**
     * Gets the next field in queue for dropping
     * @return {MineField} - the next minefield in queue
     */
    static getNextInQueue()
    {
        return Main.queue[0];
    }

    /**
     * Adds a new Minefield to the back of the queue if there are less than 10
     * mine fields queued
     */
    reQueue()
    {
        while (Main.queue.length < 10)
        {
            Main.queue.push(new MineField(Main.width / 2, -1, Shape.rand(), this.mineChance));
        }
    }

    /**
     * Gets surrounding Block objects based on coordinates of block param
     *
     * @param block - block to get the surroundingBlocks blocks from
     * @param {number[]} coords - number multi-array containing coordinates of desired blocks
     * @return {Block[]} - block array of all block objects around block param
     */
    getBlocksFromCoordinates(block, coords = [])
    {
        coords = block.surroundingBlocks();

        let surrounding = [];

        for (let i = 0; i < coords.length; i++)
        {
            let current = this.currentField.blocks.find(x => x.x === coords[i][0] && x.y === coords[i][1]);

            if (current !== undefined)
            {
                surrounding.push(current);
            }

            let placed = (this.placedGroup.find(x => x.x === coords[i][0] && x.y === coords[i][1]));

            if (placed !== undefined)
            {
                surrounding.push(placed.block);
            }
        }

        return surrounding;
    }

    /**
     * Handles un-hiding multiple blocks if they have zero mines near them
     * >Checks if the blocks have zero mines near them
     * >If they don't have any mines nearby, also uncovers blocks near that block
     * >If they do have mines nearby, only uncovers that block, and not its surrounding blocks
     * @param {Safe} block - block which was initially un-hidden
     */
    unHideMultiple(block)
    {
        if (block instanceof Mine)
        {
            return;
        }

        let coords = block.surroundingBlocks();

        coords.splice(7, 1);
        coords.splice(5, 1);
        coords.splice(2, 1);
        coords.splice(0, 1);


        let blocks = this.getBlocksFromCoordinates(block, coords);

        blocks.forEach(x =>
        {
            if (x.hidden)
            {
                if (x instanceof Safe)
                {
                    if (x.surrBombCount === 0)
                    {
                        x.unHide();
                        this.unHideMultiple(x);
                    }
                }
            }
        })
    }

    /**
     * Updates safe blocks in each block group
     */
    updateNearbySafes()
    {
        if (this.currentField !== null)
        {
            // update blocks in current field
            for (let i = 0; i < this.currentField.blocks.length; i++)
            {
                Artist.updateSafeTexture(this, this.currentField.blocks[i]);
            }

            // update blocks in boundary
            for (let i = 0; i < this.boundaryGroup.length; i++)
            {
                Artist.updateSafeTexture(this, this.boundaryGroup[i].block);
            }

            // update blocks placed
            for (let i = 0; i < this.placedGroup.length; i++)
            {
                Artist.updateSafeTexture(this, this.placedGroup[i].block);
            }
        }
    }

    /**
     * Updates the score
     * @param num - amount to modify the score by
     */
    updateScores(num)
    {
        Main.score += num;
        if (Main.score > Main.highScore)
        {
            Main.highScore += num;
        }
    }

    /**
     * Checks lines to determine if they can be deleted
     * @return {Object} - object containing the eligible y values for deletion,
     *  along with the number of blocks in its x axis.
     */
    checkLines()
    {
        let eligible = [];

        // doing this so I don't have an O(n^2) for finding the blocks
        // also because I had the data on block placements already
        this.placedGroup.forEach(x =>
        {
            if (x.block instanceof Mine && !x.block.flagged)
            {
                return;
            }

            if (x.block instanceof Safe && (x.block.flagged || x.block.hidden))
            {
                return;
            }

            // have to do it this stupid way cause JS wouldn't let me do it normally
            eligible[x.y] = eligible[x.y] === undefined ?
                {y: x.y, val: 0} :
                {y: x.y, val: eligible[x.y].val += 1};
        });


        return eligible.filter(x =>
        {
            if (x !== undefined)
            {
                return x.val === Main.width - 3;
            }
        });
    }

    /**
     * Deletes y axis lines which are eligible for deletion
     */
    deleteLines()
    {
        let eligible = this.checkLines();

        if (eligible !== undefined)
        {
            `Doing it like this to reduce ms lag, and since I already
            keep track of the x and y coordinates of each block.`
            for (let i = 0; i < eligible.length; i++)
            {
                let blocks = this.placedGroup.filter(x =>
                {
                    return x.y === eligible[i].y;
                })
                blocks.forEach(x => this.deleteBlock(x.block));
            }

            for (let i = 0; i < eligible.length; i++)
            {
                this.dropLine(eligible[i].y);
            }

            this.updateScores(100 * eligible.length);
        }
    }

    /**
     * Drops each block above a provided y coordinate by one
     * @param {number} y - the y coordinate to drop lines from
     */
    dropLine(y)
    {
        this.placedGroup.forEach(x =>
        {
            if (x.y < y)
            {
                x.block.y++;
                x.y++;
            }
            Artist.drawBlock(this, x.block);
        })
    }

    /**
     * Pauses this scene.
     *
     * > I have to make this method myself since the way phaser handles pausing the
     * game prevents further input thus preventing the user from unpausing the game.
     *
     *
     * This method also doesn't require me to create a new scene to handle
     * unpausing the game
     */
    togglePause()
    {
        if (!this.isPaused)
        {
            this.music.pause();
            this.elevatorMusic.play();
            this.isPaused = true;
            this.text.setText('Game Paused');
            this.subText.setText('Press (P) to unpause')
        }
        else
        {
            this.music.resume();
            this.elevatorMusic.stop();
            this.isPaused = false;
            this.text.setText('');
            this.subText.setText('')
        }
    }

    /**
     * Toggles whether the scene is muted or not
     */
    toggleSound()
    {
        this.sound.mute = !this.sound.mute;
    }

    /**
     * Increases the volume of the game
     */
    increaseVolume()
    {
        // Only need to check for this.music since they all have the same volume level
        if (this.music.volume < 1.0)
        {
            this.music.volume += 0.1;
            this.elevatorMusic.volume += 0.1;
            this.explosionSound.volume += 0.1;
        }
    }

    /**
     * Decreases the volume of the game
     */
    decreaseVolume()
    {
        // Only need to check for this.music since they all have the same volume level
        if (this.music.volume > 0.1)
        {
            this.music.volume -= 0.1;
            this.elevatorMusic.volume -= 0.1;
            this.explosionSound.volume -= 0.1;
        }
    }

    /**
     * Sets what happens on each game tick
     */
    onEvent()
    {
        if (this.currentField !== null && this.alive && !this.isPaused && this.started)
        {
            // drop the blocks here
            if (ControlsHandler.checkMovement(this, ControlsHandler.checkMoveDown))
            {
                this.currentField.softDrop();
            }
            Artist.drawField(this, this.currentField);
            this.deleteLines();
            this.updateNearbySafes();

            // increase the tick rate to make drops block faster
            // also increases mine chance as an effect
            if (Main.tickRate > 300)
            {
                Main.tickRate--;
            }

            // increase the chance that each block will be a mine by
            // 0.3 percent each tick
            if (this.mineChance < 0.80)
            {
                this.mineChance += 0.001
            }

            this.resetTimedEvent();
        }
    }

    /**
     * sets / resets the timed event
     */
    resetTimedEvent()
    {
        this.time.removeEvent(this.timedEvent);
        this.timedEvent = this.time.addEvent({
            delay: Main.tickRate,
            callback: this.onEvent,
            callbackScope: this,
            loop: true
        });
    }

    /**
     * Phaser standard - loads game files
     */
    preload()
    {
        let frameConfig = {frameWidth: Main.blockSize, frameHeight: Main.blockSize};

        `NOT MINE, src here: https://www.youtube.com/watch?v=Ci5squuWW3Q`
        this.load.audio('theme', 'assets/sounds/theme.mp3');

        `NOT MINE, src here: https://www.youtube.com/watch?v=WCE1m5oVcWI`
        this.load.audio('explosion', 'assets/sounds/explosion.mp3');

        `NOT MINE, src here: https://www.youtube.com/watch?v=atejQh9cXWI`
        this.load.audio('elevator', 'assets/sounds/elevator.mp3');

        `NOT MINE, src here: https://www.spriters-resource.com/custom_edited/minesweepercustoms/sheet/139692/`
        this.load.spritesheet(Texture.zero, Texture.zero, frameConfig);
        this.load.spritesheet(Texture.one, Texture.one, frameConfig);
        this.load.spritesheet(Texture.two, Texture.two, frameConfig);
        this.load.spritesheet(Texture.three, Texture.three, frameConfig);
        this.load.spritesheet(Texture.four, Texture.four, frameConfig);
        this.load.spritesheet(Texture.five, Texture.five, frameConfig);
        this.load.spritesheet(Texture.six, Texture.six, frameConfig);
        this.load.spritesheet(Texture.seven, Texture.seven, frameConfig);
        this.load.spritesheet(Texture.eight, Texture.eight, frameConfig);
        this.load.spritesheet(Texture.default, Texture.default, frameConfig);
        this.load.spritesheet(Texture.flag, Texture.flag, frameConfig);
        this.load.spritesheet(Texture.bomb, Texture.bomb, frameConfig);
        this.load.spritesheet(Texture.explode, Texture.explode, frameConfig);

    }

    /**
     * Phaser standard - creates game
     */
    create()
    {
        // draws the default blocks on the sides
        Artist.drawBlocks(this, Main.width, -4, Main.width, Main.height);
        Artist.drawBlocks(this, 1, -4, 1, Main.height);

        // draws the default blocks at the bottom
        Artist.drawBlocks(this, 2, Main.height, Main.width - 1);

        // sets the controls based on ControlsHandler
        ControlsHandler.create(this);

        // these conditions need to be checks to prevent multiple instances
        // of music playing upon restarting since the scene doesn't restart
        // its properties with its restart method
        if (this.music === null)
            this.music = this.sound.add('theme', {loop: true});

        if (this.explosionSound === null)
            this.explosionSound = this.sound.add('explosion');

        if (this.elevatorMusic === null)
            this.elevatorMusic = this.sound.add('elevator');

        this.text = this.add.text((Main.width / 2 - 2.8) * Main.blockSize, 2 * Main.blockSize);
        this.subText = this.add.text((Main.width / 2 - 3.2) * Main.blockSize, 3 * Main.blockSize);

        if (!this.started)
        {
            this.elevatorMusic.setVolume(0.2);
            this.explosionSound.setVolume(0.2);
            this.music.setVolume(0.2);

            this.text.setText('Start Game');
            this.subText.setText('Press (S) to start');

            this.text.setFontSize(25);
            this.subText.setFontSize(16);
        }

        // set the initial fields in the queue
        this.reQueue();
        this.resetTimedEvent();
    }

    /**
     * Phaser standard, updates in interval
     * @param time
     * @param delta
     */
    update(time, delta)
    {
        if (this.alive && this.started && this.currentField === null)
        {
            this.dropNew();
        }
    }
}

export default Main;

const config = {
    type: Phaser.AUTO,
    width: Main.width * Main.blockSize,
    height: Main.height * Main.blockSize,
    physics: {
        default: 'arcade'
    },
    parent: 'main',
    pixelArt: true,
    backgroundColor: '#696969',
    scene: [Main]
}

const game = new Phaser.Game(config);