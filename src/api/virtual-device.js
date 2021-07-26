var express = require('express');
const VirtualDevice = require('../devices/virtual-device');
var router = express.Router();

class VirtualDeviceAPI
{
    constructor(deviceManager, sceneManager)
    {
        this.deviceManager = deviceManager;
        this.sceneManager = sceneManager;
    }

    router()
    {
        router.get('/:device/buttons', this.getButtons.bind(this));
        router.post('/:device/buttons', this.postButton.bind(this));

        return router;
    }

    getButtons(req, res, next)
    {
        let deviceId = req.params.device;
        let device = this.deviceManager.get(deviceId);

        if(!device || !(device instanceof VirtualDevice)) {
            res.json(false);
            return;
        }

        res.json(device.getKeys());
    }

    postButton(req, res, next)
    {
        let deviceId = req.params.device;
        let device = this.deviceManager.get(deviceId);

        if(!device || !(device instanceof VirtualDevice)) {
            res.json(false);
            return;
        }

        let newKey = device.addKey();

        res.json(newKey);
    }
}

module.exports = VirtualDeviceAPI;