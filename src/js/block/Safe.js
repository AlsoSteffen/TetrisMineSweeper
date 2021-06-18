import Block from './Block.js';

let Safe = new Class(
    {
        Extends: Block,

        // the number of surroundingMines
        surrBombCount: 0,

        initialize: function (x, y)
        {
            this.parent(x, y);
            this.surrBombCount = 0;
            this.textureUnhidden = Texture.zero;
        },

        /**
         * Gets the relative positions of each surrounding block to this one
         *
         * @return {[number]} - multi-array containing all the relavant relative positions
         * of blocks directly next to this one
         */
        surroundingBlocks: function ()
        {
            // positions of surroundingBlocks boxes
            return [
                // x x x
                // o   o
                // o o o
                [this.x - 1, this.y + 1],
                [this.x, this.y + 1],
                [this.x + 1, this.y + 1],

                // o o o
                // x   x
                // o o o
                [this.x - 1, this.y],
                [this.x + 1, this.y],

                // o o o
                // o   o
                // x x x
                [this.x - 1, this.y - 1],
                [this.x, this.y - 1],
                [this.x + 1, this.y - 1],
            ];
        },

        /**
         * Updates the texture based on the number of surroundingBlocks mines
         */
        update: function (num)
        {
            switch (num)
            {
                case 0:
                    this.updateTexture(Texture.zero);
                    this.surrBombCount = 0;
                    break;
                case 1:
                    this.updateTexture(Texture.one);
                    this.surrBombCount = 1;
                    break;
                case 2:
                    this.updateTexture(Texture.two);
                    this.surrBombCount = 2;
                    break;
                case 3:
                    this.updateTexture(Texture.three);
                    this.surrBombCount = 3;
                    break;
                case 4:
                    this.updateTexture(Texture.four);
                    this.surrBombCount = 4;
                    break;
                case 5:
                    this.updateTexture(Texture.five);
                    this.surrBombCount = 5;
                    break;
                case 6:
                    this.updateTexture(Texture.six);
                    this.surrBombCount = 6;
                    break;
                case 7:
                    this.updateTexture(Texture.seven);
                    this.surrBombCount = 7;
                    break;
                case 8:
                    this.updateTexture(Texture.eight);
                    this.surrBombCount = 8;
            }
        }
    })

export default Safe;