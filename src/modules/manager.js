const _ = require('underscore');
const CoreModule = require('./core');
const OBSModule = require('./obs');
const Yamaha01v96Module = require('./yamaha-01v96');

const AVAILABLE_MODULES = {
    'core': CoreModule,
    'obs': OBSModule,
    'yamaha-01v96': Yamaha01v96Module
};

const CONFIG_KEY_SETTINGS = "modules.settings";
const CONFIG_KEY_LOAD = "modules.load";

class ModuleManager
{
    constructor(scriptManager, sceneManager, configuration)
    {
        this.scriptManager = scriptManager;
        this.sceneManager = sceneManager;
        this.configuration = configuration;
        
        this.modules = {};
        this.actions = {};
        this.actionModules = {};
        this.shutdownTriggers = {};

        let modulesToLoad = this.configuration.get(CONFIG_KEY_LOAD) || [];
        
        this.setLoadedModules(modulesToLoad);
    }

    loadModule(moduleName, moduleSettings)
    {
        if(moduleName in AVAILABLE_MODULES) {
            logger.info("Loading module " + moduleName + "...");

            let module = new AVAILABLE_MODULES[moduleName](this);
            module.init(moduleSettings);
            
            this.actions[moduleName] = module.getActions();
            for(let id in this.actions[moduleName]) {
                this.actionModules[id] = moduleName;
            }

            this.modules[moduleName] = module;
        }

        return false;
    }

    unloadModule(moduleName)
    {
        if(this.modules[moduleName]) {
            logger.info("Unloading module " + moduleName + "...");

            this.modules[moduleName].shutdown();
            delete this.modules[moduleName];
        }
    }

    getAvailableModules()
    {
        return Object.keys(AVAILABLE_MODULES);
    }

    getLoadedModules()
    {
        return Object.keys(this.modules);
    }

    setLoadedModules(modules)
    {
        this.configuration.set(CONFIG_KEY_LOAD, modules);

        let loadedModules = Object.keys(this.modules);
        let modulesSettings = this.configuration.get(CONFIG_KEY_SETTINGS) || {};

        // Load new modules
        for(let i of modules) {
            if(!_.contains(loadedModules, i)) {
                this.loadModule(i, modulesSettings[i]);
            }
        }

        // Unload removed modules
        for(let moduleName in this.modules) {
            if(!_.contains(modules, moduleName)) {
                this.unloadModule(moduleName);
            }
        }
    }

    has(moduleName)
    {
        return typeof this.modules[moduleName] != "undefined";
    }

    get(moduleName)
    {
        if (this.modules[moduleName]) {
            return this.modules[moduleName];
        }
    }

    compileConfiguration()
    {
        let configurations = {};

        // Iterate through the modules to fetch the available config parameters for each one
        for(let moduleName in AVAILABLE_MODULES) {
            let config = {};
            config = AVAILABLE_MODULES[moduleName].getConfiguration();

            configurations[moduleName] = config;
        }

        return configurations;
    }

    getSettings()
    {
        return this.configuration.get(CONFIG_KEY_SETTINGS);
    }

    updateSettings(newSettings)
    {
        this.configuration.set(CONFIG_KEY_SETTINGS, newSettings);
    }

    compileActions()
    {
        let actionsInfo = {};

        // Iterate through the modules to fetch actions for each one
        for(let moduleName in this.modules) {
            let actions = this.modules[moduleName].getActions();

            // Iterate through the actions of the current module
            for(let actionKey in actions) {
                let actionData = actions[actionKey];
                let actionInfo = {
                    label: actionData.label,
                    parameters: {}
                };
        
                // Handle each parameter of the current action
                for(let j in actionData.parameters) {
                    let parameter = _.clone(actionData.parameters[j]);
                    
                    // Resolve parameters properties
                    switch(parameter.type) {
                        case "choice":
                            if(typeof parameter.values == "function") {
                                parameter.values = parameter.values.apply(this.modules[moduleName]);
                            }
                            break;
                    }
        
                    actionInfo.parameters[j] = parameter;
                }

                actionsInfo[actionKey] = actionInfo;
            }
        }

        return actionsInfo;
    }

    callAction(actionName, parameters)
    {
        if(!(actionName in this.actionModules)) {
            logger.warn("Action '" + actionName + "' not found.");
            return false;
        }

        let actionModule = this.actionModules[actionName];
        let module = this.modules[actionModule];
        let action = this.actions[actionModule][actionName];

        action.perform.apply(module, parameters);        
    }

    shutdown()
    {
        for(let i in this.modules) {
            this.modules[i].shutdown();
        }
    }
}

module.exports = ModuleManager;