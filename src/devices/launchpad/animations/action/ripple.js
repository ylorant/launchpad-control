const { lastIndexOf } = require("underscore");
const _ = require("underscore");

class Ripple
{
    constructor(x, y, color, delay)
    {
        this.x = x;
        this.y = (y == 8 ? 0 : (y + 1)); // Handle difference between displayed position and effective position
        this.color = color;
        this.delay = delay;
    }

    init(pad)
    {
        this.pad = pad;

        return {
            "index": 0,
            "radius": -1
        };
    }

    frame(data)
    {
        let radius = Math.round(data.index / this.delay);
        this.lightCircle(radius);
        data.index++;

        return data;
    }

    isDone(data)
    {
        let diagX = Math.round(1.41 * Math.abs(9 - this.x));
        let diagY = Math.round(1.41 * Math.abs(9 - this.y));
        let lastFrame = Math.max(diagX, diagY);

        return data.index == lastFrame * this.delay;
    }

    lightCircle(radius)
    {
        let lightedButtons = [];
        let posX = null;
        let posY = null;
        let posKey = null;

        for(var i = 0; i < (2 * Math.PI); i += (Math.PI / 32)) {
            posX = Math.round(this.x + (radius * Math.cos(i)));
            posY = Math.round(this.y + (radius * Math.sin(i)));
            
            if(posX < 0 || posX > 8 || posY < 0 || posY > 8) {
                continue;
            }

            // Handle Y position and top row alignment
            posY = (posY === 0 ? 8 : (posY - 1));
            posKey = "" + posX + "-" + posY;

            if(lightedButtons.indexOf(posKey) === -1) {
                lightedButtons.push(posKey);
                let padButton = this.pad.getButton(posX, posY);

                if(padButton) {
                    padButton.light(this.color);
                }
            }
        }
    }
}

module.exports = Ripple;