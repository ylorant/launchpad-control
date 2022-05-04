class Key
{
    constructor(scene, keyData)
    {
        this.device = null;
        this.position = null;
        this.scene = scene;
        this.label = null;
        this.value = null;
        this.defaultStatus = null;
        this.status = Key.STATUS_INACTIVE;
        this.pressed = false;
        this.colors = {};
        this.action = {};

        this.colors[Key.STATUS_INACTIVE] = null;
        this.colors[Key.STATUS_ACTIVE] = null;
        this.colors[Key.STATUS_PRESSED] = null;

        // Hydrate the scene data
        for(var i in keyData) {
            this[i] = keyData[i];
        }

        if(this.defaultStatus) {
            this.status = this.defaultStatus;
        }
    }

    isActive()
    {
        return this.status === Key.STATUS_ACTIVE;
    }

    isPressed()
    {
        return this.pressed;
    }

    setStatus(status)
    {
        this.status = status;
    }
    
    setValue(value)
    {
        this.value = value;
    }

    toggle()
    {
        this.setStatus(this.isActive() ? Key.STATUS_INACTIVE : Key.STATUS_ACTIVE);
    }

    executeAction()
    {
        if(!("type" in this.action)) {
            return;
        }

        this.scene.manager.moduleManager.callAction(this.action.type, [this]);
    }

    toJSON(key)
    {
        if(key) {
            return key;
        }

        let actionOut = Object.assign({}, this.action);

        return {
            device: this.device,
            position: this.position,
            label: this.label,
            status: this.status,
            defaultStatus: this.defaultStatus,
            colors: this.colors,
            action: actionOut
        };
    }

    /**
     * Exports the key as a serializable object for configuration output.
     * Only exports the relevant keys.
     */
    export()
    {
        let actionOut = Object.assign({}, this.action);

        if(actionOut.type == "eval") {
            delete actionOut.script;
            delete actionOut.context;
        }

        let output = {
            device: this.device,
            position: this.position,
            label: this.label,
            colors: this.colors,
            action: actionOut
        };

        if(this.defaultStatus !== null) {
            output.defaultStatus = this.defaultStatus;
        }

        return output;
    }
}

Object.defineProperty(Key, 'STATUS_INACTIVE', {
    value: "inactive",
    writable: false,
    configurable: false,
    enumerable: true,
});
Object.defineProperty(Key, 'STATUS_ACTIVE', {
    value: "active",
    writable: false,
    configurable: false,
    enumerable: true,
});
Object.defineProperty(Key, 'STATUS_PRESSED', {
    value: "pressed",
    writable: false,
    configurable: false,
    enumerable: true,
});
Object.defineProperty(Key, 'DIRECTION_LEFT', {
    value: "left",
    writable: false,
    configurable: false,
    enumerable: true,
});
Object.defineProperty(Key, 'DIRECTION_RIGHT', {
    value: "right",
    writable: false,
    configurable: false,
    enumerable: true,
});
Object.defineProperty(Key, "TYPE_DIGITAL", {
    value: "digital",
    writable: false,
    configurable: false,
    enumerable: true,
});
Object.defineProperty(Key, "TYPE_ANALOG", {
    value: "analog",
    writable: false,
    configurable: false,
    enumerable: true,
});
Object.defineProperty(Key, "TYPE_ROTARY", {
    value: "rotary",
    writable: false,
    configurable: false,
    enumerable: true,
});

module.exports = Key;