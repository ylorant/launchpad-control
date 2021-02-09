const Launchpad = require('./launchpad');
const NanoKontrol = require('./korg-nanokontrol');
const EventEmitter = require('events');

class DeviceManager extends EventEmitter
{
    constructor()
    {
        super();

        this.devices = [];
        this.initializedCount = 0;
    }

    init(deviceConfig)
    {
        this.initializedCount = 0;
        
        // Load each device
        if("list" in deviceConfig) {
            for(var i in deviceConfig.list) {
                logger.info("Device: " + i);

                let currentDeviceConfig = deviceConfig.list[i];
                let deviceTypeList = this.getDeviceTypes();

                for(var deviceName in deviceTypeList) {
                    if(deviceName == currentDeviceConfig.type) {
                        let device = new deviceTypeList[deviceName]();
                        device.on("ready", this.onDeviceReady.bind(this, device));
                        device.on("press", this.onDevicePress.bind(this, device));
                        device.on("release", this.onDeviceRelease.bind(this, device));
                        device.on("analog", this.onDeviceAnalog.bind(this, device));
                        device.init(deviceConfig.list[i]);

                        this.devices.push(device);
                    }
                }
            }
        }
    }

    getDeviceTypes()
    {
        let deviceTypes = [];

        deviceTypes[Launchpad.getType()] = Launchpad;
        deviceTypes[NanoKontrol.getType()] = NanoKontrol;

        return deviceTypes;
    }

    get(deviceId = null)
    {
        if(deviceId === null) {
            return this.devices;
        }

        for(var i in this.devices) {
            if(this.devices[i].id == deviceId) {
                return this.devices[i];
            }
        }

        return null;
    }

    close()
    {
        for(var i in this.devices) {
            this.devices[i].close();
        }
    }

    onDeviceReady()
    {
        this.initializedCount++;

        if(this.initializedCount == this.devices.length) {
            logger.info("All devices ready.");
            this.emit("ready");
        }
    }

    onDevicePress(device, position)
    {
        this.emit("press", device, position);
    }

    onDeviceRelease(device, position)
    {
        this.emit("release", device, position);
    }

    onDeviceAnalog(device, position, value)
    {
        this.emit("analog", device, position, value);
    }
}

module.exports = DeviceManager;