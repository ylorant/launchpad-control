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
        router.get('/actions', this.getActions.bind(this));

        return router;
    }

    /** GET get actions info */
    getActions(req, res, next)
    {
        res.json(this.modulesManager.compileActions());
    }
}

module.exports = ModulesAPI;