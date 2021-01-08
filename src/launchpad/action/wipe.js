const { range, identity } = require("underscore");

class Wipe
{
    constructor(direction, color, start, end, delay)
    {
        this.direction = direction;
        this.color = color;
        this.start = start;
        this.end = end;
        this.delay = delay;
    }

    init(pad)
    {
        this.pad = pad;

        return {
            "index": 0
        };
    }

    frame(data)
    {
        let direction = this.start < this.end ? 1 : -1;
        let positions = range(this.start, this.end + direction, direction);
        var pos = Math.floor(data.index / this.delay);
        this.setLineLighting(positions[pos], 1);
        
        data.index++;

        return data;
    }

    isDone(data)
    {
        return data.index == (Math.abs(this.end - this.start) + 1) * this.delay;
    }

    setLineLighting(lineIndex, light)
    {
        for(var i = 0; i < 9; i++) {
            switch(this.direction) {
                case Wipe.VERTICAL:
                    this.setLighting(lineIndex, i, light);
                    break;
                
                case Wipe.HORIZONTAL:
                    this.setLighting(i, lineIndex, light);
                    break;
            }
        }
    }

    setLighting(x, y, light)
    {
        // Convert between simulated top line (y = 0) and actual top line in launchpadder (y = 8)
        y--;
        if(y == -1) {
            y = 8;
        }

        if(x >= 0 && y >= 0) {
            let padButton = this.pad.getButton(x, y);

            padButton.light(this.color);
        }
    }
}

// Constants
Object.defineProperty(Wipe, 'VERTICAL', {
    value: 1,
    writable: false,
    configurable: false,
    enumerable: true,
});
Object.defineProperty(Wipe, 'HORIZONTAL', {
    value: 2,
    writable: false,
    configurable: false,
    enumerable: true,
});

module.exports = Wipe;