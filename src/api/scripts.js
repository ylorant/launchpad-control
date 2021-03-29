var express = require('express');
var router = express.Router();

class ScriptsAPI
{
    constructor(scriptsManager)
    {
        this.scriptsManager = scriptsManager;
    }

    router()
    {
        router.get('/', this.getScripts.bind(this));
        router.get('/hooks', this.getHooks.bind(this));
        router.put('/script/:script', this.putScript.bind(this));
        router.put('/hooks/:hook', this.putHook.bind(this));

        return router;
    }

    /** GET get scripts */
    getScripts(req, res, next)
    {
        res.json(this.scriptsManager.getScripts());
    }

    /** GET get lifecycle script identifiers */
    getHooks(req, res, next)
    {
        res.json(this.scriptsManager.getHooks());
    }

    /** PUT update one script */
    putScript(req, res, next)
    {
        this.scriptsManager.setScript(req.params.script, req.body.script);
        res.json(true);
    }

    /** PUT update hook script binding */
    putHook(req, res, next)
    {
        let updated = this.scriptsManager.setHook(req.params.hook, req.body.script);
        res.json(updated);
    }
}

module.exports = ScriptsAPI;