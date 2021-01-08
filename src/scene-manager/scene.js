const { first } = require('underscore');
var Key = require('./key');

class Scene
{
    constructor(manager, pad, sceneData = {})
    {
        this.id = "default";
        this.manager = manager;
        this.pad = pad;
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

    pressKey(x, y, render) {
        let key = this.findKey(x, y);

        if(key) {
            key.pressed = true;
            if(render) {
                key.executeAction();
                this.renderKey(key);
            }
        }
    }

    releaseKey(x, y, render) {
        let key = this.findKey(x, y);

        if(key) {
            key.pressed = false;
            if(render) {
                this.renderKey(key, false);
            }
        }
    }

    findKey(x, y) {
        for(var i in this.keys) {
            if(this.keys[i].x == x && this.keys[i].y == y) {
                return this.keys[i];
            }
        }

        return null;
    }

    setKey(key) {
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
            this.pad.getPad().allDark();
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

    renderKey(key, notify = true) {
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

        this.pad.light(key.x, key.y, newColor);

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