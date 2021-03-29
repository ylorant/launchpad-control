let ActionList = {
    setScriptManager: function(scriptManager)
    {
        this.scriptManager = scriptManager;
    },

    scene: {
        perform: function(key) {
            key.scene.manager.changeScene(key.action.scene);
        }
    },

    toggle: {
        perform: function(key) {
            key.toggle();
        }
    },

    script: {
        perform: function(key) {
            ActionList.scriptManager.updateContext({ key: key });
            ActionList.scriptManager.executeScript(key.action.script);
            // delete key.action.context.key;
        }
    }
};

module.exports = ActionList;