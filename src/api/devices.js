var express = require('express');
var router = express.Router();

class DevicesAPI
{
    constructor(deviceManager)
    {
        this.deviceManager = deviceManager;
    }

    router()
    {
        router.get('/', this.getDevices.bind(this));
        router.get('/types', this.getDeviceTypes.bind(this));
        router.get('/device/:device', this.getDevice.bind(this));
        router.post('/', this.postDevice.bind(this));
        router.put('/device/:device', this.putDevice.bind(this));
        router.delete('/device/:device', this.deleteDevice.bind(this));

        return router;
    }

    getDeviceTypes(req, res, next)
    {
        let deviceTypes = this.deviceManager.getDeviceTypes();
        let typesOutput = {};

        for(var i in deviceTypes) {
            typesOutput[deviceTypes[i].getType()] = deviceTypes[i].getName();
        }

        res.json(typesOutput);
    }

    /** GET get all devices */
    getDevices(req, res, next)
    {
        let devices = this.deviceManager.get();
        let devicesOuptut = [];

        for(var i in devices) {
            devicesOuptut.push(devices[i].export());
        }

        res.json(devicesOuptut);
    }

    /** GET get a specific device */
    getDevice(req, res, next)
    {
        res.json(this.deviceManager.get(req.params.device));
    }

    /** POST create a device */
    postDevice(req, res, next)
    {
        res.json(this.deviceManager.create(req.body));
    }

    /** PUT update device */
    putDevice(req, res, next)
    {
        
    }

    /** DELETE delete device */
    deleteDevice(req, res, next)
    {

    }
}

module.exports = DevicesAPI;