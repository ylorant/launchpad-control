var launchpadder = require('launchpadder').Launchpad;
var midi = require('midi');
var _ = require('underscore');
var EventEmitter = require('events');

var launchpadderExtend = require('./launchpadder.extend');
const BootAnimation = require('./animations/boot-animation');

launchpadder = launchpadderExtend(launchpadder);

class LaunchpadControl extends EventEmitter
{
    init(options)
    {
        let defaultOptions = {
            inputPort: null,
            outputPort: null,
        };

        this.options = _.extend(defaultOptions, options);
        this.currentAnimation = null;
        this.pad = null;

        // Init MIDI lower-level I/O, to allow discovering devices
        this.input = new midi.Input();
        this.output = new midi.Output();

        // Open launchpad with options
        this.openLaunchpad();
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

    openLaunchpad()
    {
        if(this.options.inputPort == null || this.options.outputPort == null) {
            logger.info("Input or output port not specified, trying to autodiscover them.");
            var devices = this.getDevices();

            // Try to guess the input port if needed
            if(this.options.inputPort == null) {
                for(var i in devices.input) {
                    if(devices.input[i].match(/Launchpad/)) {
                        logger.info("Guessed input port " + i + ": " + devices.input[i]);
                        this.options.inputPort = parseInt(i);
                        break;
                    }
                }
            }

            // Try to guess the output port if needed
            if(this.options.outputPort == null) {
                for(var i in devices.output) {
                    if(devices.output[i].match(/Launchpad/)) {
                        logger.info("Guessed output port " + i + ": " + devices.output[i]);
                        this.options.outputPort = parseInt(i);
                        break;
                    }
                }
            }

            // If one port is still missing, we 
            if(this.options.inputPort == null || this.options.outputPort == null) {
                logger.error("Could not discover a Launchpad.");
                return false;
            }
        }

        logger.info("Connecting to Launchpad on ports " + this.options.inputPort + ":" + this.options.outputPort);

        try {
            this.pad = new launchpadder(this.options.inputPort, this.options.outputPort);
        } catch(e) {
            logger.error("Cannot connect to the Launchpad.");
            return false;
        }

        // Binding events
        this.pad.on('press', this.onPadPress.bind(this));
        this.pad.on('release', this.onPadRelease.bind(this));

        BootAnimation.animation(this.pad)
            .start()
            .then((function() {
                logger.info("Launchpad ready.");
                this.emit('ready');
            }).bind(this));
    }

    closeLaunchpad()
    {
        this.off();

        this.input.closePort();
        this.output.closePort();

        this.pad.removeAllListeners('press');
        this.pad.removeAllListeners('release');

        delete this.pad;
    }

    onPadPress(button)
    {
        this.emit('press', button);
    }

    onPadRelease(button)
    {
        this.emit('release', button);
    }

    isConnected()
    {
        return this.pad !== null;
    }

    getPad()
    {
        return this.pad;
    }

    off()
    {
        this.pad.allDark();
    }

    light(x, y, color)
    {
        let button = this.pad.getButton(x, y);
        button.light(color);
    }
}

module.exports = LaunchpadControl;