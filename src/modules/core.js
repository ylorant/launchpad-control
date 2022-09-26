const Module = require("./module");

class CoreModule extends Module
{
    getActions()
    {
        return {
            core_scene: {
                label: "Core: Change scene",
                parameters: {
                    scene: {
                        label: "Target scene",
                        type: "scene"
                    }
                },
                perform: function(key) {
                    this.manager.sceneManager.changeScene(key.action.scene);
                }
            },
        
            core_toggle: {
                label: "Core: Toggle state",
                parameters: {},
                perform: function(key) {
                    key.toggle();
                }
            },
        
            core_script: {
                label: "Core: Execute script",
                parameters: {
                    script: {
                        label: "Script",
                        type: "script"
                    }
                },
                perform: function(key) {
                    this.manager.scriptManager.updateContext({ key: key });
                    this.manager.scriptManager.executeScript(key.action.script);
                }
            },

            core_set_variable: {
                label: "Core: Set variable value",
                parameters: {
                    name: {
                        label: "Variable name",
                        type: "string"
                    },
                    value: {
                        label: "Variable value",
                        type: "string"
                    }
                },
                perform: function(key) {
                    this.manager.scriptManager.sandbox.vars[key.action.name] = key.action.value;
                }
            }
        };
    }
}

module.exports = CoreModule;