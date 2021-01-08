const CharMap = require("./helper/charmap");

class Text
{
    constructor(text, x, y, color, duration)
    {
        this.text = text;
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
        let pos = this.x;
        let letters = this.text.split('');

        for(var l in letters) {
            let letter = letters[l].toLowerCase();

            for(var i = 0; i < CharMap[letter].length; i++) {
                for(var j = 0; j < CharMap[letter][i].length; j++) {
                    let button = this.pad.getButton(pos + i, this.y + j);
                    
                    if(CharMap[letter][j][i]) {
                        button.light(this.color);
                    } else {
                        button.dark();
                    }
                }
            }

            pos += 4;
        }

        data.index++;

        return data;
    }

    isDone(data)
    {
        return data.index == this.duration;
    }
}

module.exports = Text;