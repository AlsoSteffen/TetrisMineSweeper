import Block from './Block.js';

let Mine = new Class(
    {
        Extends: Block,

        initialize: function (x, y)
        {
            this.parent(x, y);
            this.textureUnhidden = Texture.bomb;
        },

        /**
         * Sets the texture of this block to that of an exploded mine
         */
        explode: function ()
        {
            this.updateTexture(Texture.explode);
        },
    });

export default Mine;