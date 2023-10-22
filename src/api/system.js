var express = require('express');
const { Console } = require('winston/lib/winston/transports');
var router = express.Router();

class SystemAPI
{
    constructor(sceneManager, deviceManager, scriptsManager, config)
    {
        this.sceneManager = sceneManager;
        this.deviceManager = deviceManager;
        this.scriptsManager = scriptsManager;
        this.config = config;
    }

    router()
    {
        router.post('/save-config', this.saveConfig.bind(this));
        router.post('/load-config', this.loadConfig.bind(this));
        router.get('/config-path', this.configPath.bind(this));
        router.post('/reconnect', this.reconnect.bind(this));

        return router;
    }

    /** POST save configuration to file */
    saveConfig(req, res, next)
    {
        if(!("path" in req.body)) {
            res.json(false);
            return;
        }

        this.config.set("scenes", this.sceneManager.export());
        this.config.set("devices", this.deviceManager.export());
        this.config.set("scripts", this.scriptsManager.export());
        this.config.save(req.body.path);
        res.json(true);

    }

    /** POST load configuration from file */
    loadConfig(req, res, next)
    {
        this.config.load(req.body.path);
        this.sceneManager.init(this.config.get("scenes"));
        this.sceneManager.render();

        res.json(true);
    }

    /** GET get the current configuration path */
    configPath(req, res, next)
    {
        res.json(this.config.path);
    }

    /** POST Tries to reconnect to the launchpad */
    reconnect(req, res, next)
    {
        this.sceneManager.stopUpdates();
        this.deviceManager.close();
        this.deviceManager.open();
        this.sceneManager.startUpdates();
        res.json(true);
    }
}

module.exports = SystemAPI;