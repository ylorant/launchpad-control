const Device = require('../device');
const XTouchOne = require('node-xtouch-one');
const Controls = require('node-xtouch-one/controls');
const Key = require('../../scenes/key');
const _ = require('underscore');

class XTouchOneDevice extends Device
{
    static getType()
    {
        return "xtouch-one";
    }

    static getName()
    {
        return "Behringer X-Touch One";
    }

    init(data)
    {
        super.init(data);

        let defaultConfig = {
            inputPort: null,
            outputPort: null,
        };

        this.config = _.extend(defaultConfig, data.config);
        this.xtouch = null;
        this.faderPressed = false;
        this.connected = false;

        // Open the X-Touch One
        this.open();
    }

    open()
    {
        this.xtouch = new XTouchOne();

        // Bind events
        this.xtouch.on("btnpress", this.onBtnPress.bind(this));
        this.xtouch.on("btnrelease", this.onBtnRelease.bind(this));
        this.xtouch.on("fader", this.onFaderMove.bind(this));
        this.xtouch.on("encoder", this.onEncoderMove.bind(this));
        this.xtouch.on("jogwheel", this.onJogwheelMove.bind(this));

        logger.info("Connecting to XTouch One...");

        try {
            this.xtouch.connect(this.config.inputPort, this.config.outputPort);
            this.connected = true;
            logger.info("Connected to XTouch One.");
        } catch(e) {
            this.connected = false;
            logger.error("Cannot connect to XTouch One: " + e.message);
        }

        this.emit("ready");
    }

    close()
    {
        this.xtouch.disconnect();
        this.xtouch = null;
    }

    isConnected()
    {
        return this.connected;
    }

    light(position, value)
    {
        // Don't do anything if the device isn't connected
        if(!this.isConnected()) {
            return false;
        }
        
        this.xtouch.light(this.getDeviceButton(position), this.getButtonValue(value));

        return true;
    }

    move(position, value)
    {
        if(!this.isConnected()) {
            return false;
        }

        switch(position.element) {
            case "fader": 
                // Disable fader movement if it is pressed to avoid forcing the motor
                if(this.faderPressed) {
                    break;
                }

                this.xtouch.setFaderLevel(value);
                break;
            
            case "faderled":
                this.xtouch.setFaderLEDLevel(value);
                break;
            
            case "encoder":
                this.xtouch.setEncoderRingLevel(value);
                break;
        }

        return true;
    }

    off()
    {
        // Don't do anything if the device isn't connected
        if(!this.isConnected()) {
            return false;
        }

        this.xtouch.clear();

        return true;
    }

    onBtnPress(btn)
    {
        if(btn == Controls.Buttons.FADER) {
            this.faderPressed = true;
        }

        this.emit("press", this.getPosition("button", btn));
    }

    onBtnRelease(btn)
    {
        if(btn == Controls.Buttons.FADER) {
            this.faderPressed = false;
        }

        this.emit("release", this.getPosition("button", btn));
    }

    onFaderMove(value)
    {
        this.emit("analog", this.getPosition("fader"), value);
    }

    onEncoderMove(value)
    {
        if(this.xtouch.getEncoderMode() == Controls.EncoderMode.RELATIVE) {
            this.emit("direction", this.getPosition("encoder"), this.directionToKeyDir(value));
        } else {
            this.emit("analog", this.getPosition("encoder"), value);
        }
    }

    onJogwheelMove(direction)
    {
        this.emit("direction", this.getPosition("jogwheel"), this.directionToKeyDir(direction));
    }

    directionToKeyDir(direction)
    {
        return direction == Controls.Direction.LEFT ? Key.DIRECTION_LEFT : Key.DIRECTION_RIGHT;    
    }

    getDeviceButton(position)
    {
        let buttonName = position.element.replace("button:", "");
        return Controls.Buttons[buttonName.toUpperCase()];
    }

    getPosition(type, id)
    {
        let elementName = null;

        switch(type) {
            case "fader": elementName = "fader"; break;
            case "encoder": elementName = "encoder"; break;
            case "jogwheel": elementName = "jogwheel"; break;
            case "button": elementName = "button:" + Controls.ButtonNames[id].toLowerCase(); break;
        }

        return {
            element: elementName
        };
    }

    getButtonValue(value)
    {
        let valueMap = {
            off: Controls.LightStatus.OFF,
            on: Controls.LightStatus.ON,
            blink: Controls.LightStatus.BLINK
        };

        return valueMap[value] ?? valueMap.off;
    }
    
    /**
     * Exports the device info
     */
     export()
     {
         return {
             id: this.id,
             type: XTouchOneDevice.getType(),
             typeName: XTouchOneDevice.getName(),
             config: this.config
         };
     }
}

module.exports = XTouchOneDevice;