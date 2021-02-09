const Animation = require('../');
const Wipe = require('../action/wipe');
const Color = require('../../color');

let BootAnimation = {
    animation: function(pad) {
        // init pad
        let animationActions = [
            [new Wipe(Wipe.HORIZONTAL, Color.RED.HIGH, 0, 8, 3)],
            [new Wipe(Wipe.VERTICAL, Color.GREEN.HIGH, 0, 8, 3)],
            [
                new Wipe(Wipe.HORIZONTAL, Color.YELLOW.HIGH, 0, 8, 3),
                new Wipe(Wipe.VERTICAL, Color.YELLOW.HIGH, 0, 8, 3)
            ],
            [
                new Wipe(Wipe.HORIZONTAL, Color.OFF, 8, 0, 3),
                new Wipe(Wipe.VERTICAL, Color.OFF, 8, 0, 3)
            ],
            {
                clear: true
            }
        ];

        return new Animation(pad, Animation.FRAME_KEEP, animationActions);
    }
}

module.exports = BootAnimation;