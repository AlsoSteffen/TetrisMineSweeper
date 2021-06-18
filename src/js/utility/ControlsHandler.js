import Mine from "../block/Mine.js";
import Artist from "./Artist.js";

/**
 * Adds all the keyboard inputs to be handled to the game class
 * @type {Class}
 */
let ControlsHandler = new Class({});

ControlsHandler.extend(
    {
        /**
         * Creates the allowed inputs and adds them to provided scene
         * @param scene - the Main class of the application
         */
        create: function (scene)
        {
            /**
             * Controls Creation
             */
            scene.input.keyboard.on('keydown-SPACE', function (event)
            {
                `for debugging`
                // if (game.currentField === null)
                // {
                //     game.dropNew();
                // }
                // else
                // {
                //     game.addCurrentToPlaced();
                // }

                if (scene.currentField !== null)
                {
                    while (ControlsHandler.checkMovement(scene, ControlsHandler.checkMoveDown))
                    {
                        scene.currentField.softDrop();
                        Artist.drawField(scene, scene.currentField);
                        scene.updateNearbySafes();
                    }
                    scene.deleteLines();
                }
            });

            scene.input.keyboard.on('keydown-DOWN', function (event)
            {
                if (scene.currentField !== null)
                {
                    if (ControlsHandler.checkMovement(scene, ControlsHandler.checkMoveDown))
                    {
                        scene.currentField.softDrop();
                        Artist.drawField(scene, scene.currentField);
                    }
                    scene.resetTimedEvent();
                    scene.updateNearbySafes();
                }
            });

            scene.input.keyboard.on('keydown-UP', function (event)
            {
                if (scene.currentField !== null)
                {
                    if (ControlsHandler.checkMovement(scene, ControlsHandler.checkRotate))
                    {
                        scene.currentField.clock();
                        Artist.drawField(scene, scene.currentField);
                    }
                    scene.updateNearbySafes();
                }
            });

            scene.input.keyboard.on('keydown-LEFT', function (event)
            {
                if (scene.currentField !== null)
                {
                    if (ControlsHandler.checkMovement(scene, ControlsHandler.checkMoveLeft))
                    {
                        scene.currentField.left();
                        Artist.drawField(scene, scene.currentField);
                    }
                    scene.updateNearbySafes();
                }
            });

            scene.input.keyboard.on('keydown-RIGHT', function (event)
            {
                if (scene.currentField !== null)
                {
                    if (ControlsHandler.checkMovement(scene, ControlsHandler.checkMoveRight))
                    {
                        scene.currentField.right();
                        Artist.drawField(scene, scene.currentField);
                    }
                    scene.updateNearbySafes();
                }
            });

            scene.input.keyboard.on('keydown-S', function (event)
            {
                scene.start();
            });

            scene.input.keyboard.on('keydown-P', function (event)
            {
                if (scene.alive)
                {
                    scene.togglePause();
                }
            });

            scene.input.keyboard.on('keydown-R', function (event)
            {
                if (scene.started)
                {
                    scene.restart();
                }
            });

            scene.input.keyboard.on('keydown-M', function (event)
            {
                scene.toggleSound();
            });

            scene.input.keyboard.on('keydown-CLOSED_BRACKET', function (event)
            {
                scene.increaseVolume();
            })

            scene.input.keyboard.on('keydown-OPEN_BRACKET', function (event)
            {
                scene.decreaseVolume();
            });
        },

        /**
         * Configures clicking mechanics on each block
         * @param ghost - canvas drawing to modify
         * @param game - game to set configuration
         */
        setClick: function (game, ghost)
        {
            let cur = this;
            ghost.on('pointerdown', function (pointer)
            {
                if (game.alive && !game.isPaused && game.started)
                {
                    let obj = game.getBlockFromGhost(this);

                    if (pointer.leftButtonDown())
                    {
                        cur.leftClick(game, obj.block);
                    }

                    if (pointer.rightButtonDown())
                    {
                        cur.rightClick(game, obj.block);
                    }
                }
            });
        },

        /**
         * Configures what will happen when a player left-clicks on a block
         * @param game - game to modify objects from
         * @param block - block to interact with
         */
        leftClick: function (game, block)
        {
            `For Debugging`
            // console.log(block);
            // un-hide and redraw the block
            if (block instanceof Mine && block.flagged === false)
            {
                block.explode();
                game.die();
                game.alive = false;
            }
            if (block.hidden)
            {
                block.unHide();
                game.unHideMultiple(block);
                Artist.drawBlock(game, block);
            }
        },

        /**
         * Configures what will happen when a player right-clicks on a block
         * @param game - game to modify objects from
         * @param block - block to interact with
         */
        rightClick: function (game, block)
        {
            // flag and redraw the block
            block.toggleFlag();
            Artist.drawBlock(game, block);
        },

        /**
         * Method that uses delegates to determine if a move is possible
         * @param game - game object to check movement from
         * @param method - direction which needs to be checked
         * @return {boolean} - whether movement in selected direction is possible
         */
        checkMovement: function (game, method)
        {
            if (game.alive && !game.isPaused && game.started)
            {
                for (let i = 0; i < game.currentField.blocks.length; i++)
                {
                    if (method(game, game.currentField.blocks[i], i))
                    {
                        return false;
                    }
                }
                return true;
            }
            return false;
        },

        /**
         * Checks if the object is allowed to move down and replaces current field if it isn't
         * @param game - the Main object (needed to use isSpotTaken, since js doesn't like the 'this'
         * keyword in delegates)
         * @param block - the block to check
         * @return {boolean} - whether the block is allowed to move or not
         */
        checkMoveDown: function (game, block)
        {
            if (game.isSpotTaken(block.x, block.y + 1))
            {
                game.addCurrentToPlaced();
            }
            return game.isSpotTaken(block.x, block.y + 1);
        },

        /**
         * Checks if the object is allowed to move left
         * @param game - the Main object (needed to use isSpotTaken, since js doesn't like the 'this'
         * keyword in delegates)
         * @param block - the block to check
         * @return {boolean} - whether the block is allowed to move or not
         */
        checkMoveLeft: function (game, block)
        {
            return game.isSpotTaken(block.x - 1, block.y);
        },

        /**
         * Checks if the object is allowed to move right
         * @param game - the Main object (needed to use isSpotTaken, since js doesn't like the 'this'
         * keyword in delegates)
         * @param block - the block to check
         * @return {boolean} - whether the block is allowed to move or not
         */
        checkMoveRight: function (game, block)
        {
            return game.isSpotTaken(block.x + 1, block.y);
        },

        /**
         * Checks if the object is allowed to rotate clockwise
         * @param game - the Main object (needed to use isSpotTaken, since js doesn't like the 'this'
         * keyword in which layout needs to be checked for
         * @param block <optional> - the block to check
         * @param num - index of layout to compare to block
         * @return boolean - whether the block is allowed to rotate or not
         */
        checkRotate: function (game, block = null, num)
        {
            // for checking rotation
            let layout = game.currentField.getNextLayout();

            return (game.isSpotTaken(game.currentField.x + layout[num][0], game.currentField.y + layout[num][1]));
        },
    }
)

export default ControlsHandler;