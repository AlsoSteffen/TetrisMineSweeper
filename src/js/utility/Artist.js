import Safe from "../block/Safe.js";
import ControlsHandler from "./ControlsHandler.js";
import Mine from "../block/Mine.js";
import Main from "../scenes/Main.js";
import NextDisplay from "../scenes/NextDisplay.js";

/**
 * Yes I know the name is funny but this class is the man drawing
 * all my stuff. (I wouldn't name it like this if it wasn't a joke,
 * please be kind on the grade).
 * @type {Class}
 */
let Artist = new Class({})

// sets static methods and var s
Artist.extend(
    {
        configureCanvas: function ()
        {
            // body element
            let body = $$('body');
            // main game div
            let game = $('game');
            // extra display divs
            let display = $$('div.display');
            // all canvas divs
            let canvas = $$('canvas');

            game.setStyles(
                {
                    position: 'absolute',
                    // this looks funky but it sets the horizontal position of the
                    // canvas to the exact center by calculating the midpoint of
                    // the body, minus half the width of the canvas
                    left: body[0].clientWidth / 2 -
                        (((Main.width + NextDisplay.width) *
                            Main.blockSize) / 2),

                    top: body[0].clientHeight / 2 -
                        ((Main.height * Main.blockSize) / 2),

                    width: (Main.width + NextDisplay.width) * Main.blockSize + 10
                }
            )

            display.setStyles(
                {
                    float: 'left',
                    marginLeft: 5,
                    marginBottom: 5
                }
            )

            canvas.addEvents(
                {
                    contextmenu: function ()
                    {
                        return false;
                    }
                }
            )
        },

        /**
         * Draws with the given dimensions
         *
         * > if xEnd or yEnd aren't filled in, automatically defaults to a single increment
         * of either axis
         *
         * > if xEnd or yEnd exceed the width / height limit, automatically defaults
         * to the maximum possible of either axis
         *
         * @param scene - scene on which to draw blocks
         * @param x - starting x position
         * @param y - starting y position
         * @param xEnd <optional> ending x position
         * @param yEnd <optional> ending y position
         * @param texture <optional> texture to draw the blocks in
         */
        drawBlocks: function (scene, x, y, xEnd = x, yEnd = y, texture)
        {
            let block;

            // Checks for below 0 and > max
            x = x < x ? x : x;
            y = y < y ? y : y;
            xEnd = xEnd > Main.width ? Main.width : xEnd;
            yEnd = yEnd > Main.height ? Main.height : yEnd;

            // decrementing to keep function count start at 1 instead of 0
            x--;
            y--;

            for (let i = y; i < yEnd; i++)
            {
                for (let j = x; j < xEnd; j++)
                {
                    block = new Safe();
                    block.x = j;
                    block.y = i;
                    block.unHide();
                    scene.boundaryGroup.push({block: block, x: block.x, y: block.y});
                    this.drawBlock(scene, block, texture);
                }
            }
        },

        /**
         * Draws the specified block to the specified scene
         *
         * > if a texture or tint are not provided, will default to the blocks texture
         *
         * @param {*} scene - scene object to containing blocks for drawing
         * @param {Block} block - block to draw on canvas
         * @param {Texture} texture <optional> texture of the block to draw
         * @param tint - <optional> tint to add to the drawn block
         */
        drawBlock: function (scene, block, texture = null, tint = null)
        {
            // object storing block and ghost { block: x, ghost: y }
            // block - the actual object storing information
            // ghost - drawing on canvas
            let obj = scene.getGhostFromBlock(block);

            let ghost;

            let x = scene.getX(block.x) + Main.blockSize / 2;
            let y = scene.getY(block.y) + Main.blockSize / 2;

            texture = texture !== null ? texture : block.texture;
            if (obj)
            {
                ghost = obj.ghost;

                if (tint !== null)
                {
                    ghost.setTint(tint);
                }

                if (ghost.active)
                {
                    ghost.setTexture(texture);
                    ghost.x = x;
                    ghost.y = y;
                }
            }
            else
            {
                ghost = scene.physics.add.image(x, y, texture);
                obj = {block: block, ghost: ghost};

                ghost.setInteractive();

                ControlsHandler.setClick(scene, ghost);

                scene.blocks.push(obj);
            }
        },

        /**
         * Draws the provided mine field into the canvas
         * @param scene - scene in which to draw the field
         * @param field - field to draw into the canvas
         */
        drawField: function (scene, field)
        {
            if (field !== null)
            {
                for (let i = 0; i < field.blocks.length; i++)
                {
                    let block = field.blocks[i];
                    Artist.drawBlock(scene, block);
                }
            }
        },

        /**
         * Updates the texture of safe blocks near the provided block to each respective
         * safe blocks' new texture
         *
         * @param scene - scene containing blocks to update
         * @param block - block whose texture to update
         */
        updateSafeTexture(scene, block)
        {
            if (block instanceof Safe)
            {
                let surrounding = scene.getBlocksFromCoordinates(block, block.surroundingBlocks());

                let count = 0;

                for (let i = 0; i < surrounding.length; i++)
                {
                    if (surrounding[i] instanceof Mine)
                    {
                        count++;
                    }
                }
                block.update(count);
                this.drawBlock(scene, block);
            }
        }
    }
)

export default Artist;