const _ = require('underscore');
const CoreActions = require('./core');
const OBSActions = require('./obs');

const AVAILABLE_MODULES = {
    'core': CoreActions,
    'obs': OBSActions
};

class ModuleManager
{
    constructor(scriptManager, sceneManager, configuration)
    {
        this.scriptManager = scriptManager;
        this.sceneManager = sceneManager;
        this.configuration = configuration;

        let modulesToLoad = this.configuration.get('modules.load');
        let modulesConfig = this.configuration.get('modules.config'); 

        this.modules = {};
        this.actions = {};
        this.actionModules = {};
        this.shutdownTriggers = {};

        for(let i in modulesToLoad) {
            let moduleName = modulesToLoad[i];
            let config = modulesConfig[moduleName];
            this.loadModule(moduleName, config);
        }
    }

    loadModule(moduleName, moduleConfig)
    {
        if(moduleName in AVAILABLE_MODULES) {
            let module = new AVAILABLE_MODULES[moduleName](this);
            module.init(moduleConfig);
            
            this.actions[moduleName] = module.getActions();
            for(let id in this.actions[moduleName]) {
                this.actionModules[id] = moduleName;
            }

            this.modules[moduleName] = module;
        }

        return false;
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