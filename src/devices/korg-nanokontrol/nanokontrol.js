var NanoKONTROLLib = require('korg-nano-kontrol');
var Device = require('../device');
var _ = require('underscore');

class NanoKontrol extends Device
{
    static getType()
    {
        return "nanokontrol";
    }


    static getName()
    {
        return "Korg NanoKontrol/2";
    }

    /** Initializes the device interface. */
    init(config) 
    {
        super.init(config);

        let defaultConfig = {
            inputPort: null,
            outputPort: null,
        };

        this.config = _.extend(defaultConfig, config);
        this.nanokontrolDevice = null;

        // Open the nanokontrol with config
        this.open();
    }

    /** Connects to the device. */
    open()
    {
        NanoKONTROLLib.connect()
            .then(this.onDeviceConnected.bind(this));
    }

    /** Disconnects from the device. */
    close()
    {
        this.nanokontrolDevice.close();
    }

    /** Checks if the device is connected */
    isConnected()
    {
        return this.nanokontrolDevice !== null;
    }

    /** Lights the given element (by its position) of the given value (usually color) */
    light(position, value)
    {
        if(!position.element || !position.element.match(/^button/i)) {
            return false;
        }

        this.nanokontrolDevice.light(position.element.replace("button:", ""), value == NanoKontrol.ON ? 1 : 0);

        return true;
    }

    /** Lights off everything */
    off()
    {
        // TODO: implement
    }

    /** 
     * Internal event: device is connected, we bind events to it and keep its ref for ulterior access. 
     */
    onDeviceConnected(device)
    {
        let instance = this;

        this.nanokontrolDevice = device;
        this.nanokontrolDevice.on('slider:*', function(value) {
            instance.callEvent(this.event, value);
        });
        
        this.nanokontrolDevice.on('knob:*', function(value) {
            instance.callEvent(this.event, value);
        });
        
        this.nanokontrolDevice.on('button:**', function(value) {
            instance.callEvent(this.event, value);
        });

        logger.info("NanoKontrol/2 ready.");
        this.emit("ready");
    }

    /**
     * Calls the bound events for the given element, with the given value.
     * 
     * @param {string} elementName
     * @param {mixed} eventValue
     */
    callEvent(elementName, value)
    {
        let position = this.generatePosition(elementName);

        // Handle button press and release
        if(elementName.match(/^button/i)) {
            this.emit(value ? "press" : "release", position);
        } else {
            this.emit("analog", position, value);
        }
    }

    /**
     * Generates the position object for the given element name.
     * 
     * @param {string} elementName
     * 
     * @return {object}
     */
    generatePosition(elementName)
    {
        return {
            element: elementName
        };
    }
}

Object.defineProperty(NanoKontrol, 'ON', {
    value: "on",
    writable: false,
    configurable: false,
    enumerable: true,
});

Object.defineProperty(NanoKontrol, 'OFF', {
    value: "off",
    writable: false,
    configurable: false,
    enumerable: true,
});

module.exports = NanoKontrol;