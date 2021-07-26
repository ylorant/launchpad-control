var launchpadder = require('launchpadder').Launchpad;
var _ = require('underscore');
var Device = require('../device');
var Color = require('./color');

var launchpadderExtend = require('./launchpadder.extend');
const BootAnimation = require('./animations/presets/boot-animation');

launchpadder = launchpadderExtend(launchpadder);

class Launchpad extends Device
{
    static getType()
    {
        return "launchpad";
    }

    static getName()
    {
        return "Novation Launchpad";
    }

    init(data)
    {
        super.init(data);

        let defaultConfig = {
            inputPort: null,
            outputPort: null,
        };

        this.config = _.extend(defaultConfig, data.config);
        this.pad = null;

        // Open launchpad with options
        this.open();
    }

    open()
    {
        if(this.config.inputPort == null || this.config.outputPort == null) {
            logger.info("Input or output port not specified, trying to autodiscover them.");
            var devices = this.getDevices();

            // Try to guess the input port if needed
            if(this.config.inputPort == null) {
                for(var i in devices.input) {
                    if(devices.input[i].match(/Launchpad/)) {
                        logger.info("Guessed input port " + i + ": " + devices.input[i]);
                        this.config.inputPort = parseInt(i);
                        break;
                    }
                }
            }

            // Try to guess the output port if needed
            if(this.config.outputPort == null) {
                for(var i in devices.output) {
                    if(devices.output[i].match(/Launchpad/)) {
                        logger.info("Guessed output port " + i + ": " + devices.output[i]);
                        this.config.outputPort = parseInt(i);
                        break;
                    }
                }
            }

            // If one port is still missing, we 
            if(this.config.inputPort == null || this.config.outputPort == null) {
                logger.error("Could not discover a Launchpad.");
                this.emit("ready");
                return false;
            }
        }

        logger.info("Connecting to Launchpad on ports " + this.config.inputPort + ":" + this.config.outputPort);

        try {
            this.pad = new launchpadder(this.config.inputPort, this.config.outputPort);
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

    close()
    {
        if(this.isConnected()) {
            this.off();

            this.input.closePort();
            this.output.closePort();

            this.pad.removeAllListeners('press');
            this.pad.removeAllListeners('release');

            delete this.pad;
            this.pad = null;
        }
    }

    onPadPress(button)
    {
        this.emit('press', this.getButtonPosition(button));
    }

    onPadRelease(button)
    {
        this.emit('release', this.getButtonPosition(button));
    }

    isConnected()
    {
        return this.pad !== null;
    }

    getPad()
    {
        return this.pad;
    }

    getButtonPosition(button)
    {
        return {
            x: button.getX(),
            y: button.getY()
        };
    }

    off()
    {
        // Don't do anything if the pad isn't connected
        if(!this.isConnected()) {
            return false;
        }

        this.pad.allDark();

        return true;
    }

    light(position, color)
    {
        if(!position.x || !position.y) {
            return false;
        }

        // Don't do anything if the pad isn't connected
        if(!this.isConnected()) {
            return false;
        }

        let button = this.pad.getButton(position.x, position.y);
        
        if(!button) {
            return false;
        }

        button.light(color ? color : Color.OFF);

        return true;
    }

    /**
     * Exports the device info
     */
    export()
    {
        return {
            id: this.id,
            type: Launchpad.getType(),
            typeName: Launchpad.getName(),
            config: this.config
        };
    }
}

module.exports = Launchpad;