var EventEmitter = require('events');
var midi = require('midi');

class Device extends EventEmitter
{
    constructor()
    {
        super();

        // Init MIDI lower-level I/O, to allow discovering devices
        this.input = new midi.Input();
        this.output = new midi.Output();
    }

    static getType()
    {
        return "device";
    }

    static getName()
    {
        return "Generic device";
    }

    getDevices()
    {
        let count = 0;
        let i;
        let devices = {input: {}, output: {}};


        // Count the available input ports.
        count = this.input.getPortCount();

        for(i = 0; i < count; i++) {
            devices.input[i] = this.input.getPortName(i);
        }

        // Count the available output ports.
        count = this.output.getPortCount();

        for(i = 0; i < count; i++) {
            devices.output[i] = this.output.getPortName(i);
        }

        return devices;
    }

    /** Initializes the device interface. */
    init(config) 
    {
        this.id = config.id;
    }

    /** Connects to the device. */
    open() {}

    /** Disconnects from the device. */
    close() {}

    /** Checks if the device is connected */
    isConnected() {}

    /** Lights the given element (by its position) of the given value (usually color) */
    light(position, value) {}

    /** Lights off everything */
    off() {}
}

module.exports = Device;