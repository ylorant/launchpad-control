const _ = require('underscore');
var Key = require('./key');

class Scene
{
    constructor(manager, deviceManager, sceneData = {})
    {
        this.id = "default";
        this.manager = manager;
        this.deviceManager = deviceManager;
        this.name = "Default scene";
        this.keys = [];

        // Hydrate the scene data
        for(var i in sceneData) {
            this[i] = sceneData[i];
        }

        // Initialize the keys
        for(var i in this.keys) {
            this.keys[i] = new Key(this, this.keys[i]);
        }
    }

    pressKey(device, position, render)
    {
        let key = this.findKey(device, position);

        if(key) {
            key.pressed = true;
            if(render) {
                key.executeAction();
                this.renderKey(key);
            }
        }
    }

    releaseKey(device, position, render)
    {
        let key = this.findKey(device, position);

        if(key) {
            key.pressed = false;
            if(render) {
                this.renderKey(key, false);
            }
        }
    }

    analogKey(device, position, value, render)
    {
        let key = this.findKey(device, position);

        if(key) {
            key.value = value;
            if(render) {
                key.executeAction();
            }
        }
    }

    findKey(device, position)
    {
        for(var i in this.keys) {
            // Check device ID
            if(this.keys[i].device != device.id) {
                continue;
            }

            // Check the position depending on the 
            if(_.isEqual(position, this.keys[i].position)) {
                return this.keys[i];
            }
        }

        return null;
    }

    setKey(key)
    {
        if(!(key instanceof Key)) {
            key = new Key(this, key);
        }

        if(!this.findKey(key.x, key.y)) {
            this.keys.push(key);
        } else {
            for(var i in this.keys) {
                if(this.keys[i].x == key.x && this.keys[i].y == key.y) {
                    this.keys[i] = key;
                }
            }
        }

        this.renderKey(key);
    }

    render(update = false)
    {
        if(!update) {
            var devices = this.deviceManager.get();
            for(var i in devices) {
                devices[i].off();
            }
        }

        for(var i in this.keys) {
            let key = this.keys[i];
            this.renderKey(key, false);
        }

        if(!update) {
            publisher.publish("render-scene", {
                scene: this.id
            });
        }
    }

    renderKey(key, notify = true)
    {
        let newColor = null;

        if(key.pressed == true && key.colors[Key.STATUS_PRESSED]) {
            newColor = key.colors[Key.STATUS_PRESSED];
        } else if(key.colors[key.status]) {
            newColor = key.colors[key.status];
        }

        if(Array.isArray(newColor)) {
            let ms = (new Date()).getMilliseconds();
            let index = Math.floor(ms / (1000 / newColor.length));

            newColor = newColor[index];
        }

        this.deviceManager.get(key.device).light(key.position, newColor);

        if(notify) {
            publisher.publish("render-key", {
                scene: this.id,
                key: key.toJSON()
            });
        }
    }

    toJSON(key)
    {
        if(key) {
            return key;
        }

        let keysFlattened = [];

        for(var i in this.keys) {
            keysFlattened.push(this.keys[i].toJSON());
        }

        return {
            id: this.id,
            name: this.name,
            keys: keysFlattened
        };
    }

    /**
     * Exports the scene as a serializable object for configuration output.
     */
    export()
    {
        let keysFlattened = [];

        for(var i in this.keys) {
            keysFlattened.push(this.keys[i].export());
        }

        return {
            id: this.id,
            name: this.name,
            keys: keysFlattened
        };
    }
}

module.exports = Scene;