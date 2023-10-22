const vm = require('vm');
const Key = require('../scenes/key');
const Color = require('../devices/launchpad/color');
const Animation = require('../devices/launchpad/animations/animation');
const Actions = require('../devices/launchpad/animations/action/actions');
const NanoKontrol = require('../devices/korg-nanokontrol');
const XTouchOne = require('../devices/xtouch-one');

class ScriptsManager
{
    constructor()
    {
        this.resetProperties();
    }

    resetProperties()
    {
        this.scripts = {};
        this.hooks = {
            setup: null,
            teardown: null
        };

        // Build sandbox context
        this.sandbox = {
            // Global base functions that will be required anyway
            require: require,

            // Classes, mainly for constants
            // FIXME: Find a way to change that to a dynamic device sandbox building
            Key: Key,
            Launchpad: {
                Color: Color,
                Animation: Animation,
                Actions: Actions,
            },
            NanoKontrol: NanoKontrol,
            XTouchOne: XTouchOne,

            // Variable container, to access variables from outside
            vars: {},

            // Global access vars: script manager and logger
            scriptManager: this,
            logger: logger,
            console: console
        };

        this.context = vm.createContext(this.sandbox);
    }

    init(scriptConfig)
    {
        // Execute teardown script to gracefully shut down the context
        if(this.hooks.teardown) {
            this.executeScript(this.hooks.teardown);
        }

        this.resetProperties();

        // Load config
        this.scripts = {};
        if("list" in scriptConfig) {
            this.scripts = scriptConfig.list;
        }

        if("hooks" in scriptConfig) {
            this.hooks.setup = scriptConfig.hooks.setup || null;
            this.hooks.teardown = scriptConfig.hooks.teardown || null;
        }
    }

    close()
    {
        if(this.hooks.teardown) {
            this.executeScript(this.hooks.teardown);
        }
    }

    startup()
    {
        if(this.hooks.setup) {
            this.executeScript(this.hooks.setup);
        }
    }

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

    getHooks()
    {
        return this.hooks;
    }

    setHook(hookName, scriptName)
    {
        if(scriptName && typeof this.scripts[scriptName] == "undefined") {
            return false;
        }

        if(typeof this.hooks[hookName] == "undefined") {
            return false;
        }

        this.hooks[hookName] = scriptName ? scriptName : null;

        return true;
    }

    setScript(name, script)
    {
        this.scripts[name] = script;
    }

    deleteScript(name)
    {
        if(this.scripts[name]) {
            delete this.scripts[name];
        }
    }

    updateContext(mergeObject)
    {
        for(var i in mergeObject) {
            this.sandbox[i] = mergeObject[i];
        }
    }

    /**
     * Exports the manager as a serializable object for configuration output.
     */
    export() {
        return {
            list: this.scripts,
            hooks: this.hooks
        };
    }
}

module.exports = ScriptsManager;
