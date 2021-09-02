const Device = require('../device');
const _ = require('underscore');

class VirtualDevice extends Device
{
    static getType()
    {
        return "virtual-device";
    }

    static getName()
    {
        return "Virtual device";
    }

    /** Initializes the device interface. */
    init(data) 
    {
        super.init(data);

        let defaultConfig = {
            keys: []
        };
        
        this.config = _.extend(defaultConfig, data.config);
        this.open();
    }

    /** Connects to the device. */
    open() 
    {
        logger.info("Virtual device initialized.");
        this.emit('ready');
    }

    /** Disconnects from the device. */
    close() {}

    /** Checks if the device is connected */
    isConnected() 
    {
        return true;
    }

    /** Lights the given element (by its position) of the given value (usually color) */
    light(position, value)
    {
        return true;
    }

    /** Lights off everything */
    off() {}

    /** Exports the device */
    export()
    {
        return {
            id: this.id,
            type: VirtualDevice.getType(),
            typeName: VirtualDevice.getName(),
            config: {
                keys: this.config.keys
            }
        };
    }

    /// Virtual device specific functions ///

    addKey()
    {
        let newKey = {
            position: {
                id: "key-" + (this.config.keys.length + 1)
            }
        };

        this.config.keys.push(newKey);

        return newKey;
    }

    getKeys()
    {
        return this.config.keys;
    }
}

module.exports = VirtualDevice;