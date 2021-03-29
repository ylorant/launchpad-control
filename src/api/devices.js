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
        router.get('/:device', this.getDevice.bind(this));
        router.post('/', this.postDevice.bind(this));
        router.put('/:device', this.putDevice.bind(this));

        return router;
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
        
    }

    /** PUT update device */
    putDevice(req, res, next)
    {

    }
}

module.exports = DevicesAPI;