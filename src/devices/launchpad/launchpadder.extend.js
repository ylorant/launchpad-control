var colors = require('./color');

function laundpadderExtend(launchpadder)
{
    launchpadder.prototype.allLight = function(color) {
        // Reset the state on all buttons
        for(var x = 0; x < 9; x++) {
            for(var y = 0; y < 9; y++) {
                this._grid[x][y].light(color);
            }
        }
    };

    launchpadder.prototype.renderByte = function(x, y, color, byte) {
  
        byte = byte.toLowerCase();
        switch (byte) {
            case '1':
                break;
            case 'r':
                color = colors.RED.HIGH;
                break;  
            case 'o':
                color = colors.ORANGE.HIGH;
                break;
            case 'y':
                color = colors.YELLOW.HIGH;
                break;
            case 'g':
                color = colors.GREEN.HIGH;
                break;
            default:
                color = colors.OFF;
                break;
        }

        if(color) {
            this._grid[y][x].light(color);
        } else {
            this._grid[y][x].dark();
        }
    };
    
    launchpadder.prototype.renderBytes = function(bytes, color) {
        if (bytes === undefined) return;
            for (var x = 0; x < bytes.length; x++) {
            var byt = bytes[x];
            for (var y = 0; y < byt.length; y++) {
                if (!this._grid[y][x]) {
                    console.log("Button not found: x:"+x+", y:"+y);
                    return;
                }
                this.renderByte(x, y, color,  byt[y]);
            }
        }
    };

    return launchpadder;
}

module.exports = laundpadderExtend;