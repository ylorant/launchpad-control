const Scene = require('./scene');

class Manager
{
    constructor(deviceManager, scriptsManager)
    {
        this.deviceManager = deviceManager;
        this.scriptsManager = scriptsManager;
        this.resetProperties();
                
        this.deviceManager.on('press', this.onDevicePress.bind(this));
        this.deviceManager.on('release', this.onDeviceRelease.bind(this));
        this.deviceManager.on('analog', this.onDeviceAnalog.bind(this));
    }

    setModuleManager(moduleManager)
    {
        this.moduleManager = moduleManager;
    }

    resetProperties()
    {

        this.scenes = {};
        this.currentScene = null;
        this.defaultScene = null;
    }

    init(sceneConfig)
    {
        this.resetProperties();
        this.loadConfig(sceneConfig);

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

        // Set current scene as the default one
        if("default" in sceneConfig && sceneConfig.default in this.scenes) {
            this.defaultScene = sceneConfig.default;
        }
    }

    getActionList()
    {
        return this.actionList;
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

    getCurrentSceneName()
    {
        return this.currentScene;
    }

    getCurrentScene()
    {
        return this.scenes[this.currentScene];
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

    //// KEYS ////

    getKeysByAction(keyAction, scene = null)
    {
        let output = [];

        for(let i in this.scenes) {
            if(scene && this.scenes[i].id != scene) {
                continue;
            }

            for(let j in this.scenes[i].keys) {
                if(this.scenes[i].keys[j].action.type == keyAction) {
                    output.push(this.scenes[i].keys[j]);
                }
            }
        }

        return output;
    }

    //// RENDER ////

    render()
    {
        logger.info("Rendering active scene");
        this.scenes[this.currentScene].render();

        this.startUpdates();
    }

    renderKey(key)
    {
        // Render only if the key is currently shown
        if(key.scene.id == this.currentScene) {
            this.getScene(key.scene.id).renderKey(key);
        }
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
            this.scenes[i].pressKey(device.id, position, this.currentScene == i);
        }
    }

    onDeviceRelease(device, position)
    {
        for(var i in this.scenes) {
            this.scenes[i].releaseKey(device.id, position, this.currentScene == i);
        }
    }

    onDeviceAnalog(device, position, value)
    {
        for(var i in this.scenes) {
            this.scenes[i].analogKey(device.id, position, value, this.currentScene == i);
        }
    }

    /**
     * Exports the manager as a serializable object for configuration output.
     */
    export() {
        let output = {
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