const CharMap = require('./helper/charmap');

class Character
{
    constructor(letter, x, y, color, duration)
    {
        this.letter = letter.toLowerCase();
        this.x = x;
        this.y = y;
        this.color = color;
        this.duration = duration;
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
        for(var i = 0; i < CharMap[this.letter].length; i++) {
            for(var j = 0; j < CharMap[this.letter][i].length; j++) {
                let button = this.pad.getButton(this.x + i, this.y + j);
                
                if(CharMap[this.letter][j][i]) {
                    button.light(this.color);
                } else {
                    button.dark();
                }
            }
        }

        data.index++;

        return data;
    }

    isDone(data)
    {
        return data.index == this.duration;
    }
}

module.exports = Character;