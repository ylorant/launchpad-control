const Device = require("../device");
const KorgNanoKontrolStudio = require('korg-nanokontrol-studio');
const Controls = require("korg-nanokontrol-studio/controls");
const Key = require("../../scenes/key");
var _ = require('underscore');

// Button name mapping from the library codes to the internal representation
const ButtonNameMapping = {};
const ButtonNameReverseMapping = {};

for (let i in Controls.ButtonNames) {
    ButtonNameMapping[i] = Controls.ButtonNames[i].toLowerCase();
    ButtonNameReverseMapping[Controls.ButtonNames[i].toLowerCase()] = i;
}

class NanoKontrolStudio extends Device
{
    static getType()
    {
        return "nanokontrol-studio";
    }

    static getName()
    {
        return "Korg NanoKontrol Studio";
    }

    // LIFECYCLE //

    init(data)
    {
        super.init(data);

        let defaultConfig = {
            inputPort: null,
            outputPort: null,
        };

        this.config = _.extend(defaultConfig, data.config);

        this.device = null;
        this.connected = false;

        // Open the nanokontrol with config
        this.open();
    }

    open()
    {
        logger.info('Connecting to Korg NanoKontrol Studio...');

        this.device = new KorgNanoKontrolStudio();
        this.device.on("connected", this.onConnected.bind(this));

        // Bind events
        this.device.on("btnpress", this.onBtnPress.bind(this));
        this.device.on("btnrelease", this.onBtnRelease.bind(this));
        this.device.on("jogwheel", this.onJogwheelMove.bind(this));
        this.device.on("rotary", this.onRotaryMove.bind(this));
        this.device.on("slider", this.onSliderMove.bind(this));

        try {
            this.device.connect(this.config.inputPort, this.config.outputPort);
        } catch (e) {
            logger.error("Cannot connect to NanoKontrol Studio: " + e.message);
        }
    }

    // EVENTS //

    onConnected()
    {
        logger.info("Connected to NanoKontrol Studio.");
        this.connected = true;
        this.emit("ready");
    }

    onDisconnected()
    {
        logger.info("Disconnected from NanoKontrol Studio.");
        this.connected = false;
    }

    onJogwheelMove(direction)
    {
        this.emit("direction", this.getPosition("jogwheel"), this.directionToKeyDir(direction));
    }

    onRotaryMove(rotary, value)
    {
        this.emit("analog", this.getPosition("rotary", rotary), value);
    }

    onSliderMove(slider, value)
    {
        this.emit("analog", this.getPosition("slider", slider), value);
    }

    onBtnPress(btn)
    {
        this.emit("press", this.getPosition("button", btn));
    }

    onBtnRelease(btn)
    {
        this.emit("release", this.getPosition("button", btn));
    }

    // ACTIONS //

    /** Lights the given element (by its position) */
    light(position, value)
    {
        if(!this.device) {
            return false;
        }

        if(!position.element || !position.element.match(/^button/i)) {
            return false;
        }

        let button = position.element.replace("button:", "");
        this.device.light(ButtonNameReverseMapping[button], value == NanoKontrolStudio.ON ? true : false);

        return true;
    }

    // UTILS //

    getPosition(type, id)
    {
        let elementName = null;

        switch(type) {
            case "slider": elementName = "slider:" + id; break;
            case "rotary": elementName = "rotary:" + id; break;
            case "jogwheel": elementName = "jogwheel"; break;
            case "button": elementName = "button:" + ButtonNameMapping[id]; break;
        }

        return {
            element: elementName
        };
    }

    directionToKeyDir(direction)
    {
        return direction == Controls.JogwheelDirection.LEFT ? Key.DIRECTION_LEFT : Key.DIRECTION_RIGHT;    
    }

    /**
     * Exports the device info
     */
    export()
    {
        return {
            id: this.id,
            type: NanoKontrolStudio.getType(),
            typeName: NanoKontrolStudio.getName(),
            config: this.config
        };
    }
}

Object.defineProperty(NanoKontrolStudio, 'ON', {
    value: "on",
    writable: false,
    configurable: false,
    enumerable: true,
});

Object.defineProperty(NanoKontrolStudio, 'OFF', {
    value: "off",
    writable: false,
    configurable: false,
    enumerable: true,
});

module.exports = NanoKontrolStudio;