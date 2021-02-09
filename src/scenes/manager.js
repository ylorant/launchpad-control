const Scene = require('./scene');
const vm = require('vm');
const Key = require('./key');
const Color = require('../devices/launchpad/color');
const Animation = require('../devices/launchpad/animations/animation');
const Actions = require('../devices/launchpad/animations/action/actions');

class Manager
{
    constructor(deviceManager)
    {
        this.deviceManager = deviceManager;
        this.resetProperties();
        
        this.deviceManager.on('press', this.onDevicePress.bind(this));
        this.deviceManager.on('release', this.onDeviceRelease.bind(this));
    }

    resetProperties()
    {
        let sandbox = {
            // Global base functions that will be required anyway
            require: require,
            manager: this,

            // Classes, mainly for constants
            Key: Key,
            Color: Color,
            Animation: Animation,
            Actions: Actions,

            // Global access vars: launchpad and logger
            pad: this.pad,
            logger: logger
        };

        this.scenes = {};
        this.context = vm.createContext(sandbox);
        this.currentScene = null;
        this.defaultScene = null;
        this.scripts = {
            setup: null,
            teardown: null
        };
    }

    init(sceneConfig)
    {
        this.executeScript('teardown');
        this.resetProperties();
        this.loadConfig(sceneConfig);
        this.executeScript('setup');

        // Change to default scene (or the first scene if none is defined)
        let defaultScene = this.defaultScene;
        if(!defaultScene) {        
            defaultScene  = Object.keys(this.scenes).shift();
        }

        this.changeScene(defaultScene, false);
    }

    loadConfig(sceneConfig)
    {
        logger.info("Loading scenes from config...");

        // Load each scene
        if("list" in sceneConfig) {
            for(var i in sceneConfig.list) {
                logger.info("Scene: " + i);
                this.scenes[i] = new Scene(this, this.deviceManager, sceneConfig.list[i]);
            }
        }

        // If no scene has been defined, create a default, empty scene
        if(Object.keys(this.scenes).length == 0) {
            this.scenes.default = new Scene(this, this.deviceManager);
        }

        if("scripts" in sceneConfig) {
            this.scripts.setup = "setup" in sceneConfig.scripts ? sceneConfig.scripts.setup : null;
            this.scripts.teardown = "teardown" in sceneConfig.scripts ? sceneConfig.scripts.teardown : null;
        }

        // Set current scene as the default one
        if("default" in sceneConfig && sceneConfig.default in this.scenes) {
            this.defaultScene = sceneConfig.default;
        }
    }

    //// SCRIPTS ////

    executeScript(scriptName)
    {
        if(this.scripts[scriptName]) {
            let script = new vm.Script(this.scripts[scriptName]);
            script.runInContext(this.context);
        }
    }

    getScripts()
    {
        return this.scripts;
    }

    setScripts(newScripts)
    {
        this.scripts = newScripts;
    }

    setScript(type, newScript)
    {
        this.scripts[type] = newScript;
    }

    //// SCENES ////

    getScenes()
    {
        let sceneNames = {};

        for(var i in this.scenes) {
            sceneNames[i] = this.scenes[i].name;
        }

        return sceneNames;
    }

    getScene(sceneId)
    {
        if(sceneId in this.scenes) {
            return this.scenes[sceneId];
        }

        return null;
    }

    getCurrentScene()
    {
        return this.currentScene;
    }

    changeScene(sceneName, render = true)
    {
        if(sceneName in this.scenes) {
            this.currentScene = sceneName;

            if(render) {
                this.render();
            }
        }
    }

    createScene(id, name)
    {
        if(id in this.scenes) {
            return false;
        }

        this.scenes[id] = new Scene(this, this.pad, {id: id, name: name})

        publisher.publish("new-scene", {
            scene: id
        });

        return true;
    }

    //// RENDER ////

    render()
    {
        logger.info("Rendering active scene");
        this.scenes[this.currentScene].render();

        this.startUpdates();
    }

    /** 
     * Updates the scene without re-rendering it completely (for animations and such) and without 
     * re-sending the render events.
     */
    update()
    {
        this.scenes[this.currentScene].render(true);
    }

    //// LIFECYCLE ////

    startUpdates()
    {
        if(!("updateInterval" in this) || this.updateInterval === null) {
            this.updateInterval = setInterval(this.update.bind(this), 100);
        }
    }

    stopUpdates()
    {
        if("updateInterval" in this) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    onDevicePress(device, position)
    {
        for(var i in this.scenes) {
            this.scenes[i].pressKey(device, position, this.currentScene == i);
        }
    }

    onDeviceRelease(device, position)
    {
        for(var i in this.scenes) {
            this.scenes[i].releaseKey(device, position, this.currentScene == i);
        }
    }

    /**
     * Exports the manager as a serializable object for configuration output.
     */
    export() {
        let output = {
            scripts: this.scripts,
            list: {},
            default: this.defaultScene
        };

        for(var i in this.scenes) {
            output.list[i] = this.scenes[i].export();
        }

        return output;
    }
}

module.exports = Manager;