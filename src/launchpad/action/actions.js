const Ripple = require("./ripple");
const Wipe = require("./wipe");
const Character = require("./character");
const Text = require("./text");

const Actions = {
    Wipe: Wipe,
    Ripple: Ripple,
    Character: Character,
    Text: Text
}

module.exports = Actions;