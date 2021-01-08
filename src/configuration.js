var fs = require('fs'),
    path = require('path');

class Configuration
{
    /**
     * Constructor.
     * 
     * @param {string} file Path to an initial config file to load.
     */
    constructor(file)
    {
        this.data = {};
        this.path = file;

        this.load(file);
    }

    /**
     * Loads a configuration file.
     * 
     * @param {string} file The file to load configuraiton from.
     */
    load(file)
    {
        this.path = file;
        let absPath = path.resolve(file);

        // Check that file exists
        if(!fs.existsSync(absPath)) {
            logger.warn("Configuration file does not exist");
            return false;
        }

        let configJson = fs.readFileSync(absPath);
        let configObject = null;
        try {
            configObject = JSON.parse(configJson);
        } catch(e) {
            logger.warn("Could not read configuration as JSON");
            return false;
        }

        this.data = configObject;
        return true;
    }

    /**
     * Saves the current configuration to a file.
     * 
     * @param {string} file The file to save to.
     */
    save(file)
    {
        this.path = file;
        let absPath = path.resolve(file);
        let configJson = JSON.stringify(this.data, null, 4);

        fs.writeFileSync(absPath, configJson);
        return true;
    }

    /**
     * Gets a specific configuration value.
     * 
     * @param {string} key The path to the configuration value. 
     *                     Defaults to empty, to return the complete configuration.
     * @param {mixed} defaultValue The default value to return if the path doesn't exist.
     */
    get(key = "", defaultValue = null)
    {
        var data = this.data;
        
        if(key.length > 0) {
            var keyParts = key.split('.');
            
            for(var i in keyParts) {
                // If the key part doesn't exist 
                if(!(keyParts[i] in data)) {
                    return defaultValue;
                }
                
                data = data[keyParts[i]];
            }
        }

        return data;
    }

    /**
     * Sets a configuration value.
     * 
     * @param {string} key The configuration path to set the value of.
     * @param {mixed} value The value to set.
     */
    set(key, value) {
        var keyParts = key.split('.');
        var data = this.data;

        var lastPart = keyParts.pop();

        for(var i in keyParts) {
            // If the key part doesn't exist 
            if(!(keyParts[i] in data)) {
                data[keyParts[i]] = {};
            }
            
            data = data[keyParts[i]];
        }

        if(typeof data != "object") {
            data = {};
        }

        data[lastPart] = value;

        return this;
    }
}

module.exports = Configuration;