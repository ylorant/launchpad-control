// Base colors CSS classes constants
let Colors = {
    OFF: "btn-outline-secondary",
    RED_LOW: "red low",
    RED_MEDIUM: "red medium",
    RED_HIGH: "red high",

    YELLOW_LOW: "yellow low",
    YELLOW_MEDIUM: "yellow medium",
    YELLOW_HIGH: "yellow high",
    
    ORANGE_LOW: "orange low",
    ORANGE_MEDIUM: "orange medium",
    ORANGE_HIGH: "orange high",
    
    GREEN_LOW: "green low",
    GREEN_MEDIUM: "green medium",
    GREEN_HIGH: "green high"
};

// Codes to CSS classes relationship
Colors.codes = {
    "12": Colors.OFF,

    "1": Colors.RED_LOW,
    "2": Colors.RED_MEDIUM,
    "3": Colors.RED_HIGH,

    "17": Colors.YELLOW_LOW,
    "34": Colors.YELLOW_MEDIUM,
    "54": Colors.YELLOW_HIGH,

    "45": Colors.ORANGE_LOW,
    "46": Colors.ORANGE_MEDIUM,
    "23": Colors.ORANGE_HIGH,

    "16": Colors.GREEN_LOW,
    "32": Colors.GREEN_MEDIUM,
    "48": Colors.GREEN_HIGH,
};

// Code to name color relationship
Colors.names = {
    "12": "Off",

    "1": "Red (low)",
    "2": "Red (medium)",
    "3": "Red (high)",

    "17": "Yellow (low)",
    "34": "Yellow (medium)",
    "54": "Yellow (high)",

    "45": "Orange (low)",
    "46": "Orange (medium)",
    "23": "Orange (high)",

    "16": "Green (low)",
    "32": "Green (medium)",
    "48": "Green (high)",
};

Colors.htmlCodes = {
    "12": "#888888",

    "1": "#b30d09",
    "2": "#cc221f",
    "3": "#fb4541",

    "17": "#b3a600",
    "34": "#ccbf13",
    "54": "#fff025",

    "45": "#b34400",
    "46": "#cc5a13",
    "23": "#fa7c2e",

    "16": "#3f9a00",
    "32": "#59c013",
    "48": "#78e62d",
};

Colors.codesToCSSClass = {
    "#888888": Colors.OFF,

    "#b30d09": Colors.RED_LOW,
    "#cc221f": Colors.RED_MEDIUM,
    "#fb4541": Colors.RED_HIGH,

    "#b3a600": Colors.YELLOW_LOW,
    "#ccbf13": Colors.YELLOW_MEDIUM,
    "#fff025": Colors.YELLOW_HIGH,

    "#b34400": Colors.ORANGE_LOW,
    "#cc5a13": Colors.ORANGE_MEDIUM,
    "#fa7c2e": Colors.ORANGE_HIGH,

    "#3f9a00": Colors.GREEN_LOW,
    "#59c013": Colors.GREEN_MEDIUM,
    "#78e62d": Colors.GREEN_HIGH,
};

export default Colors;