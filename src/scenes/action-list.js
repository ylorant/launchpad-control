let ActionList = {
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

    eval: {
        perform: function(key) {
            key.action.context.key = key;
            key.action.script.runInContext(key.action.context);
            delete key.action.context.key;
        }
    }
};

module.exports = ActionList;