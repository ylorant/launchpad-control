var express = require('express');
var router = express.Router();
var _ = require("underscore");

class ModulesAPI
{
    constructor(modulesManager)
    {
        this.modulesManager = modulesManager;
    }

    router()
    {
        router.get('/available', this.getAvailable.bind(this));
        router.get('/loaded', this.getLoaded.bind(this));
        router.put('/loaded', this.putLoaded.bind(this));
        router.get('/actions', this.getActions.bind(this));
        router.get('/configmodel', this.getConfigurationModel.bind(this));
        router.get('/settings', this.getSettings.bind(this));
        router.put('/settings', this.putSettings.bind(this));

        return router;
    }

    /** GET get available modules */
    getAvailable(req, res, next)
    {
        res.json(this.modulesManager.getAvailableModules());
    }

    /** GET get loaded modules */
    getLoaded(req, res, next)
    {
        res.json(this.modulesManager.getLoadedModules());
    }

    /** PUT update loaded modules */
    putLoaded(req, res, next)
    {
        res.json(this.modulesManager.setLoadedModules(req.body.modules));
    }

    /** GET get actions info */
    getActions(req, res, next)
    {
        res.json(this.modulesManager.compileActions());
    }

    /** GET get configuration model */
    getConfigurationModel(req, res, next)
    {
        res.json(this.modulesManager.compileConfiguration());
    }

    /** GET get settings */
    getSettings(req, res, next)
    {
        res.json(this.modulesManager.getSettings());
    }

    /** PUT update settings */
    putSettings(req, res, next)
    {
        res.json(this.modulesManager.updateSettings(req.body.settings));
    }
}

module.exports = ModulesAPI;