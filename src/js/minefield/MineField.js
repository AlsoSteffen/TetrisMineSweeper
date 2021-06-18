import Mine from "../block/Mine.js";
import Safe from "../block/Safe.js";

let MineField = new Class(
    {
        /**
         *
         * @param {integer} x - x position of the field centre
         * @param {integer} y - x position of the field centre
         * @param {Shape[]} shape - the shape of the mine field
         * @param {number} mineChance - percent chance that a block in the field is going to be a mine
         */
        initialize: function (x = 0, y = 0, shape = null, mineChance = 0.5)
        {
            this.x = x;
            this.y = y;
            this.rotation = 0;
            this.blocks = [];

            if (shape !== null)
            {
                this.shape = shape;
                this.layout = shape[this.rotation];

                this.generateBlocks(mineChance);
                this.positionBlocks();
            }
        },

        /**
         * get the next layout which the field will have
         * rotated clockwise
         * @return {Phaser.GameObjects.Shape|*}
         */
        getNextLayout: function()
        {
            if (this.shape.length > 1)
            {
                if (this.rotation < 3)
                {
                    return this.shape[this.rotation + 1];
                }
                else
                {
                    return this.shape[0];
                }
            }
            return this.layout;
        },

        /**
         * generate each block of the field
         * @param mineChance - percent chance that a block will be a mine
         */
        generateBlocks: function(mineChance)
        {
            for (let i = 0; i < 4; i++)
            {
                let block;
                if (mineChance > Math.random())
                {
                    block = new Mine();
                }
                else
                {
                    block = new Safe();
                }
                this.blocks.push(block);
            }
        },

        positionBlocks: function ()
        {
            for (let i = 0; i < this.blocks.length; i++)
            {
                this.blocks[i].updatePosition(this.x + this.layout[i][0], this.y + this.layout[i][1]);
            }
        },

        hardDrop: function ()
        {
            // todo: implement method
            this.softDrop();
        },

        softDrop: function ()
        {
            this.y++;
            this.positionBlocks();
        },

        left: function ()
        {
            this.x--;
            this.positionBlocks();
        },

        right: function ()
        {
            this.x++;
            this.positionBlocks();
        },

        /**
         * rotate the field clockwise
         */
        clock: function ()
        {
            if (this.shape.length > 1)
            {
                if (this.rotation < 3)
                {
                    this.rotation++;
                }
                else
                {
                    this.rotation = 0;
                }
                this.layout = this.shape[this.rotation];
                this.positionBlocks();
            }
        },

        rclock: function ()
        {
            if (this.shape.length > 1)
            {
                if (this._rotation > 0)
                {
                    this.rotation--;
                }
                else
                {
                    this.rotation = 3;
                }
                this.layout = this.shape[this.rotation];
                this.positionBlocks();
            }
        },
    }
);

export default MineField;