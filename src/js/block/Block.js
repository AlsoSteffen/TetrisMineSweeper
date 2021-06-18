'use strict'

let Block = new Class(
    {
        hidden: true,
        flagged: false,
        texture: Texture.default,
        textureUnhidden: 0,
        x: 0,
        y: 0,

        /**
         *
         * @param {integer} x - x position of block
         * @param {integer} y - y position of block
         */
        initialize: function (x, y)
        {
            this.updatePosition(x, y);
        },

        /**
         * Toggles the flag display
         */
        toggleFlag: function ()
        {
            if (this.hidden)
            {
                this.flagged = this.flagged !== true;
                this.texture = this.flagged === true ? Texture.flag : Texture.default;
            }
        },

        updatePosition: function (x, y)
        {
            this.x = x;
            this.y = y;
        },

        /**
         * Un-hides the block if it isn't flagged
         */
        unHide: function ()
        {
            if (!this.flagged)
            {
                this.hidden = false;
                this.texture = this.textureUnhidden;
            }
        },

        /**
         * Updates either the hidden texture or the displayed one depending on whether the block
         * is hidden or unhidden.
         * @param {Texture} texture - texture to apply to this block
         */
        updateTexture: function (texture)
        {
            if (this.hidden)
            {
                this.textureUnhidden = texture
            }
            else
            {
                this.texture = texture;
            }
        }
    })

export default Block;

