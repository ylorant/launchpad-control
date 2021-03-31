let ActionList = {
    setScriptManager: function(scriptManager)
    {
        this.scriptManager = scriptManager;
    },

    scene: {
        name: "Change scene",
        parameters: {
            scene: {
                label: "Target scene",
                type: "scene"
            }
        },
        perform: function(key) {
            key.scene.manager.changeScene(key.action.scene);
        }
    },

    toggle: {
        name: "Toggle state",
        parameters: {},
        perform: function(key) {
            key.toggle();
        }
    },

    script: {
        name: "Execute script",
        parameters: {
            script: {
                label: "Script",
                type: "script"
            }
        },
        perform: function(key) {
            ActionList.scriptManager.updateContext({ key: key });
            ActionList.scriptManager.executeScript(key.action.script);
        }
    }
};

module.exports = ActionList;