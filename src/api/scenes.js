var express = require('express');
var router = express.Router();
var _ = require("underscore");

class ScenesAPI
{
    constructor(sceneManager)
    {
        this.sceneManager = sceneManager;
    }

    router()
    {
        router.get('/', this.getScenes.bind(this));
        router.post('/', this.postScene.bind(this));
        router.get('/current', this.getCurrentScene.bind(this));
        router.put('/current', this.putCurrentScene.bind(this));
        router.get('/scene/:scene', this.getScene.bind(this));
        router.put('/scene/key', this.putKey.bind(this));

        return router;
    }

    /** GET available scenes */
    getScenes(req, res, next)
    {
        res.json(this.sceneManager.getScenes());
    }

    /** GET specific scene */
    getScene(req, res, next)
    {
        res.json(this.sceneManager.getScene(req.params.scene));
    }

    /** POST create a scene */
    postScene(req, res, next)
    {
        if(!("id" in req.body && "name" in req.body)) {
            res.json(false);
            return;
        }

        let created = this.sceneManager.createScene(req.body.id, req.body.name);

        res.json(created);
    }

    /** GET current loaded scene */
    getCurrentScene(req, res, next)
    {
        res.json(this.sceneManager.getCurrentSceneName());
    }

    /** PUT update current scene */
    putCurrentScene(req, res, next)
    {
        if(!("scene" in req.body)) {
            res.json(false);
            return;
        }

        this.sceneManager.changeScene(req.body.scene); // Reload the scene
        res.json(true);
    }

    /** PUT update key */
    putKey(req, res, next)
    {
        if(!("scene" in req.body) && !("key" in req.body)) {
            res.json(false);
            return;
        }

        let scene = this.sceneManager.getScene(req.body.scene);
        if(!scene) {
            res.json(false);
            return;
        }
        
        scene.setKey(req.body.key);
        res.json(true);
    }
}

module.exports = ScenesAPI;