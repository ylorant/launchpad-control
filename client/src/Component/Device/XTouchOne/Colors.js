// Base colors CSS classes constants
let Colors = {
    OFF: "btn-outline-secondary",
    BLINK: "btn-outline-warning",
    ON: "btn-outline-warning",
};

// Codes to CSS classes relationship
Colors.codes = {
    "off": Colors.OFF,
    "blink": Colors.BLINK,
    "on": Colors.ON
};

// Code to name color relationship
Colors.names = {
    "off": "Off",
    "blink": "Blink",
    "on": "On"
};

Colors.htmlCodes = {
    "off": "#888888",
    "blink": "#ffd7cc",
    "on": "#ffd78b",
};

Colors.codesToCSSClass = {
    "#888888": Colors.OFF,
    "#ffd7cc": Colors.BLINK,
    "#ffd78b": Colors.ON
};

export default Colors;