const Launchpad = require('./launchpad');
const NanoKontrol = require('./korg-nanokontrol');
const VirtualDevice = require('./virtual-device');
const XTouchOne = require('./xtouch-one');
const EventEmitter = require('events');

class DeviceManager extends EventEmitter
{
    constructor()
    {
        super();

        this.resetProperties();
    }

    resetProperties()
    {
        this.devices = [];
        this.initializedCount = 0;   
    }

    init(deviceConfig)
    {
        this.resetProperties();
        
        // Load each device
        if("list" in deviceConfig) {
            for(var i in deviceConfig.list) {
                logger.info("Device: " + i);
                this.create(deviceConfig.list[i]);
            }
        }
    }

    getDeviceTypes()
    {
        let deviceTypes = [];

        deviceTypes[Launchpad.getType()] = Launchpad;
        deviceTypes[NanoKontrol.getType()] = NanoKontrol;
        deviceTypes[VirtualDevice.getType()] = VirtualDevice;
        deviceTypes[XTouchOne.getType()] = XTouchOne;

        return deviceTypes;
    }

    create(config)
    {
        let deviceTypeList = this.getDeviceTypes();
        
        if(!(config.type in deviceTypeList)) {
            return false;
        }

        let device = new deviceTypeList[config.type]();
        
        device.on("ready", this.onDeviceReady.bind(this, device));
        device.on("press", this.onDevicePress.bind(this, device));
        device.on("release", this.onDeviceRelease.bind(this, device));
        device.on("analog", this.onDeviceAnalog.bind(this, device));
        device.on("direction", this.onDeviceDirection.bind(this, device));
        device.init(config);

        this.devices.push(device);

        return true;
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

    delete(deviceId)
    {
        let device = this.get(deviceId);

        if(device) {
            device.close();

            for(var i in this.devices) {
                if(this.devices[i].id == deviceId) {
                    this.devices.splice(i, 1);
                    break;
                }
            }
        }
    }

    open()
    {
        for(var i in this.devices) {
            this.devices[i].open();
        }
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

    onDeviceDirection(device, position, direction)
    {
        this.emit("direction", device, position, direction);
    }

    export()
    {
        let config = {
            list: {}
        };

        for(let i in this.devices) {
            let deviceExport = this.devices[i].export();
            delete deviceExport.typeName;
            config.list[deviceExport.id] = deviceExport;
        }
        
        return config;
    }
}

module.exports = DeviceManager;