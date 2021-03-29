const vm = require('vm');
const Key = require('../scenes/key');
const Color = require('../devices/launchpad/color');
const Animation = require('../devices/launchpad/animations/animation');
const Actions = require('../devices/launchpad/animations/action/actions');
const NanoKontrol = require('../devices/korg-nanokontrol');

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
            Key: Key,
            Launchpad: {
                Color: Color,
                Animation: Animation,
                Actions: Actions,
            },
            NanoKontrol: NanoKontrol,

            // Global access vars: launchpad and logger
            scriptManager: this,
            logger: logger
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

        // Set everything up in user scripts again
        if(this.hooks.setup) {
            this.executeScript(this.hooks.setup);
        }
    }

    close()
    {
        this.executeScript('teardown');
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
}

module.exports = ScriptsManager;