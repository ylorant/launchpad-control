const OBSWebSocket = require('obs-websocket-js');
const Key = require('../scenes/key');
const Module = require('./module');
const _ = require('underscore');
const { isEmpty } = require('underscore');

class OBSModule extends Module
{
    //// LIFECYCLE ////

    init(config)
    {
        this.obsConnection = null;
        let sceneList = [];
        let sourceList = [];
        let sceneItemList = [];
        let typeList = {};

        this.sceneList = sceneList;
        this.sourceList = sourceList;
        this.typeList = typeList;
        this.sceneItemList = sceneItemList;
        this.jogwheelInterval = null;
        this.jogwheelStatus = {};
        this.fadeInterval = null;
        this.fadeStatus = {};
        this.currentPreview = null;

        if(config) {
            logger.info("Connecting to OBS...");

            this.obsConnection = new OBSWebSocket();
            this.obsConnection
                .connect(config)
                // Fetching data
                .then(() => this.fetchData('GetSceneList', 'scenes', 'sceneList'))
                .then(() => this.fetchData('GetSourcesList', 'sources', 'sourceList'))
                .then(() => this.fetchData('GetSourceTypesList', 'types', 'typeList'))
                .then(() => this.fetchData('GetPreviewScene', 'name', 'currentPreview'))
                // Format data that needs to be formatted
                .then(() => {
                    let typeListIndexed = {};
                    let sceneNamesList = [];
                    
                    for(let i in this.typeList) {
                        typeListIndexed[this.typeList[i].typeId] = this.typeList[i];
                    }

                    for(let i in this.sceneList) {
                        sceneNamesList.push(this.sceneList[i].name);
                    }

                    this.typeList = typeListIndexed;
                    this.sceneList = sceneNamesList;
                    this.onPreviewSceneChanged(this.currentPreview);
                })
                .then(() => this.fetchSceneItems())
                .then(() => this.fetchAudioStatus())
                .then(() => this.refreshKeyStatus(true)) // Once everything is loaded, we initialize the key statuses
                .then(() => logger.info("OBS module initialized"))
                .catch((e) => logger.error('Cannot connect to OBS: ' + e.error));

            // Binding events
            this.obsConnection
                .on('SourceMuteStateChanged', this.onSourceMuteUnmute.bind(this))
                .on('PreviewSceneChanged', this.onPreviewSceneChanged.bind(this))
                .on('SceneItemVisibilityChanged', this.onSceneItemVisibilityChanged.bind(this))
                .on('SourceVolumeChanged', this.onSourceVolumeChanged.bind(this));
        }
    }

    shutdown()
    {
        this.obsConnection.disconnect();
    }

    refreshKeyStatus(forceUpdate = false)
    {
        this.refreshKeyStatusByAction('obs_toggle_mute', 'muted', 'source', forceUpdate);
        this.refreshKeyStatusByAction('obs_fade_volume', 'volume', 'source', forceUpdate);
        this.refreshKeyStatusByAction('obs_toggle_visible', 'properties.visible', 'sceneItem', forceUpdate);
    }

    refreshKeyStatusByAction(action, property, type, forceUpdate = false, inverted = false)
    {
        let keys = this.manager.sceneManager.getKeysByAction(action);

        for(let i in keys) {
            let source = null;
            switch(type) {
                case "source":
                    source = this.getSource(keys[i].action.source);
                    break;
                    case "sceneItem":
                    source = this.getSceneItem(keys[i].action.scene, keys[i].action.source);
                    break;
            }

            if(source) {
                let oldStatus = keys[i].status;
                let keyActive = _.get(source, property.split('.')) ? true : false;

                if(inverted) {
                   keyActive = !keyActive; 
                }

                keys[i].status = keyActive ? Key.STATUS_ACTIVE : Key.STATUS_INACTIVE;

                // Update the key only if it has changed
                if(oldStatus != keys[i].status || forceUpdate) {
                    this.manager.sceneManager.renderKey(keys[i]);
                }
            }
        }
    }

    //// EVENTS ////

    onSourceMuteUnmute(data, render = true)
    {
        let source = this.getSource(data.sourceName);

        if(source) {
            source.muted = data.muted;
        }

        if(render) {
            this.refreshKeyStatus();
        }
    }

    onPreviewSceneChanged(data)
    {
        let sceneIndex = this.sceneList.indexOf(data["scene-name"] ? data["scene-name"] : data);

        if(sceneIndex != -1) {
            this.currentPreview = sceneIndex;
        }
    }

    onSceneItemVisibilityChanged(data)
    {
        let sceneItem = this.getSceneItem(data.sceneName, data.itemName);

        if(sceneItem) {
            sceneItem.properties.visible = data.itemVisible;
        }

        this.refreshKeyStatus();
    }

    onSourceVolumeChanged(data)
    {
        let source = this.getSource(data.sourceName);

        if(source) {
            source.volume = this.DBToRatio(data.volumeDb);
        }

        this.refreshKeyStatus();
    }

    //// FETCH FUNCTIONS ////

    fetchSceneItems()
    {
        let reqs = [];
        let reqId = 0;

        // Scene items fetch for each scene
        for(let i in this.sceneList) {
            reqs.push({
                "message-id": "request-" + (++reqId),
                "request-type": "GetSceneItemList",
                "sceneName": this.sceneList[i]
            });
        }

        return this.obsConnection.send('ExecuteBatch', { requests: reqs })
            .then((data) => {
                this.sceneItemList = {};
                reqs = {};
                
                for(let i in data.results) {
                    let sceneName = data.results[i].sceneName;
                    reqs[data.results[i].sceneName] = [];

                    for(let j in data.results[i].sceneItems) {
                        let sceneItem = data.results[i].sceneItems[j];
                        sceneItem.sceneName = sceneName;

                        this.sceneItemList[sceneName + "-" + sceneItem.itemId] = sceneItem;

                        reqs[sceneName].push({
                            "message-id": "request-" + (++reqId),
                            "request-type": "GetSceneItemProperties",
                            "scene-name": sceneItem.sceneName,
                            "item": { id: sceneItem.itemId }
                        });
                    }

                    this.obsConnection.send('ExecuteBatch', { requests: reqs[sceneName] })
                        .then((data) => {
                            for(let i in data.results) {
                                let sceneItemProperties = data.results[i];

                                if(this.sceneItemList[sceneName + "-" + sceneItemProperties.itemId]) {
                                    this.sceneItemList[sceneName + "-" + sceneItemProperties.itemId].properties = sceneItemProperties;
                                }
                            }
                        });
                }
            });
    }

    /**
     * Fetch the mute status for each audio source to set mute buttons
     */
    fetchAudioStatus()
    {
        let reqs = [];
        let audioSources = this.getAudioSources();
        let reqId = 0;
        
        for(let i in audioSources) {
            reqs.push({
                "message-id": "request-" + (++reqId),
                "request-type": "GetVolume",
                "source": audioSources[i],
                "useDecibel": true
            });
        }

        
        return this.obsConnection.send('ExecuteBatch', { requests: reqs })
            .then((data) => {
                for(let i in data.results) {
                    let source = this.getSource(data.results[i].name);

                    if(source) {
                        source.volume = this.DBToRatio(data.results[i].volume);
                        source.muted = data.results[i].muted;
                    }
                }
            });
    }

    //// UTIL FUNCTIONS ////

    /**
     * Fetches data from the websocket server to put in an instance property.
     * It serves as a shorthand to fetch data mechanically as the way it works is the same.
     * 
     * @param {string} request The request to make to the server
     * @param {string} key The key to fetch in the reply
     * @param {string} property The property to update
     */
    fetchData(request, key, property)
    {
        return this.obsConnection.send(request)
            .then(data => {
                this[property] = data[key];
            });
    }

    /**
     * Converts a volume ratio to its decibel value, between 0dB and -100dB.
     * Formula taken from OBS source code to work linearly.
     * 
     * @param {float} ratio The ratio to convert to decibels, between 0 and 1.
     * @returns {float} The decibel value.
     */
    ratioToDB(ratio)
    {
        const LOG_OFFSET_DB = 6.0;
        const LOG_RANGE_DB = 96.0;

        if (ratio >= 1.0)
            return 0.0;
        else if (ratio <= 0.0)
            return -100;

        return -(LOG_RANGE_DB + LOG_OFFSET_DB) *
                Math.pow((LOG_RANGE_DB + LOG_OFFSET_DB) / LOG_OFFSET_DB,
                    -ratio) +
            LOG_OFFSET_DB;
    }

    /**
     * Converts a decibel value to its linear ratio, between 0 and 1.
     * Formula taken from OBS source code to work linearly.
     * 
     * @param {float} db The db to convert to a ratio, between 0 and -100.
     * @returns {float} The decibel value.
     */
    DBToRatio(db)
    {
        const LOG_OFFSET_DB = 6.0;
        /* equals -log10f(LOG_OFFSET_DB) */
        const LOG_OFFSET_VAL = -0.77815125038364363;
        /* equals -log10f(-LOG_RANGE_DB + LOG_OFFSET_DB) */
        const LOG_RANGE_VAL = -2.00860017176191756;
        
        if (db >= 0.0)
            return 1.0;
        else if (db <= -96.0)
            return 0.0;

        return (-Math.log10(-db + LOG_OFFSET_DB) - LOG_RANGE_VAL) /
            (LOG_OFFSET_VAL - LOG_RANGE_VAL);
    }

    /**
     * Gets the available audio sources.
     * 
     * @returns {array} The audio sources list.
     */
    getAudioSources()
    {
        let output = [];

        for(let i in this.sourceList) {
            let source = this.sourceList[i];
            let sourceType = this.typeList[source.typeId];

            if(sourceType && sourceType.caps.hasAudio) {
                output.push(source.name);
            }
        }

        return output;
    }

    getVideoSources()
    {
        let output = [];

        for(let i in this.sourceList) {
            let source = this.sourceList[i];
            let sourceType = this.typeList[source.typeId];

            if(sourceType && sourceType.caps.hasVideo) {
                output.push(source.name);
            }
        }

        return output;
    }

    getSource(sourceName)
    {
        for(let i in this.sourceList) {
            if(this.sourceList[i].name == sourceName) {
                return this.sourceList[i];
            }
        }

        return null;
    }

    getSceneItem(sceneName, sourceName)
    {
        for(let i in this.sceneItemList) {
            if(this.sceneItemList[i].sceneName == sceneName && this.sceneItemList[i].sourceName == sourceName) {
                return this.sceneItemList[i];
            }
        }

        return null;
    }

    getSceneItemListForScene(sceneName)
    {
        let sceneItemList = [];

        for(let i in this.sceneItemList) {
            if(this.sceneItemList[i].sceneName == sceneName) {
                sceneItemList.push(this.sceneItemList[i]);
            }
        }

        return sceneItemList;
    }

    getAbsoluteSceneName(sceneName)
    {
        return sceneName == OBSModule.CURRENT_PREVIEW ? this.sceneList[this.currentPreview] : sceneName;
    }

    getCurrentPreview(index = false)
    {
        if(index) {
            return this.currentPreview;
        }

        return this.sceneList[this.currentPreview];
    }

    //// OBS ACTIONS ////
    
    toggleSourceVisibility(scene, source, force = null)
    {
        let sceneName = this.getAbsoluteSceneName(scene);
        let sceneItem = this.getSceneItem(sceneName, source);
        let visibility = force;

        if(visibility === null) {
            visibility = !sceneItem.properties.visible;
        }

        console.log(sceneItem, visibility);
        
        if(sceneItem) {
            this.obsConnection.send('SetSceneItemRender', {
                'scene-name': sceneName,
                'source': source, 
                render: visibility
            });
        }
    }

    toggleSourceMute(source)
    {
        this.obsConnection.send('ToggleMute', {source: source});
    }

    setSourceVolume(source, volume)
    {
        this.obsConnection.send('SetVolume', {
            source: source, 
            volume: this.ratioToDB(volume),
            useDecibel: true
        });
    }

    changeScene(scene)
    {
        this.obsConnection.send("SetCurrentScene", {'scene-name': scene});
    }

    changePreviewScene(scene)
    {
        if(this.sceneList.includes(scene)) {
            this.currentPreview = this.sceneList.indexOf(scene);
            this.obsConnection.send("SetPreviewScene", {'scene-name': scene});
        }
    }

    transitionScene()
    {
        this.obsConnection.send('TransitionToProgram');
    }

    cropSceneItem(scene, source, direction, amount)
    {

        // Handle current preview
        let sceneName = this.getAbsoluteSceneName(scene);
        let sceneItem = this.getSceneItem(sceneName, source);

        if(!sceneItem) {
            return false;
        }

        let itemPropertiesUpdate = {
            'scene-name': sceneName,
            'item': source,
            crop: {}
        };

        sceneItem.properties.crop[direction] = amount;
        itemPropertiesUpdate.crop[direction] = amount;

        this.obsConnection.send('SetSceneItemProperties', itemPropertiesUpdate);
    }

    //// VOLUME FADE ////

    fadeVolumeStart(source, direction)
    {

        // Cancel an already happening fade if needed
        if(this.fadeStatus[source]) {
            this.fadeVolumeStop(this.fadeStatus[source]);
        }

        this.fadeStatus[source] = {
            source: source,
            direction: direction
        };

        if(!this.fadeInterval) {
            this.fadeInterval = setInterval(this.fadeVolumeTick.bind(this), 50);
        }
    }

    fadeVolumeStop(source)
    {
        if(!this.fadeStatus[source]) {
            return false;
        }

        delete this.fadeStatus[source];

        if(isEmpty(this.fadeStatus) && this.fadeInterval) {
            clearInterval(this.fadeInterval);
            this.fadeInterval = null;
        }
    }

    fadeVolumeTick()
    {
        for(let i in this.fadeStatus) {
            let source = this.getSource(this.fadeStatus[i].source);
            
            switch(this.fadeStatus[i].direction) {
                case "in":
                    source.volume = Math.min(source.volume + 0.025, 1);
                    break;
                
                case "out":
                    source.volume = Math.max(source.volume - 0.025, 0);
                    break;
            }

            this.setSourceVolume(source.name, source.volume);

            if(source.volume <= 0 || source.volume >= 1) {
                this.fadeVolumeStop(source.name);
            }
        }
    }

    //// JOGWHEEL CONTROL ////

    jogwheelGetKeyHash(key)
    {
        return JSON.stringify(key.position);
    }

    jogwheelStart(key, action, target, actionParameters, initialValue, increment)
    {
        let keyPos = this.jogwheelGetKeyHash(key);

        this.jogwheelStatus[keyPos] = {
            action: action,
            target: target,
            actionParameters: actionParameters,
            value: initialValue,
            locked: false,
            positionLock: 0,
            increment: increment
        };
    }

    jogwheelMove(key, value) {
        let keyPos = this.jogwheelGetKeyHash(key);
        
        if(!this.jogwheelStatus[keyPos]) {
            return false;
        }
        
        let diff = value - this.jogwheelStatus[keyPos].value;
        this.jogwheelStatus[keyPos].value = value;
        let js = this.jogwheelStatus[keyPos];
        this.jogwheelAction(js.action, js.target, js.actionParameters, diff);
    }

    jogwheelLock(key, positionLock)
    {
        let keyPos = this.jogwheelGetKeyHash(key);

        if(!this.jogwheelStatus[keyPos]) {
            return false;
        }

        this.jogwheelStatus[keyPos].locked = true;
        this.jogwheelStatus[keyPos].positionLock = positionLock;

        if(isEmpty(this.jogwheelInterval)) {
            this.jogwheelInterval = setInterval(this.onJogwheelInterval.bind(this), 100);
        }
    }

    jogwheelUnlock(key, keyPos = null)
    {
        if(!keyPos) {
            keyPos = this.jogwheelGetKeyHash(key);
        }

        if(!this.jogwheelStatus[keyPos] || !this.jogwheelStatus[keyPos].locked) {
            return false;
        }

        this.jogwheelStatus[keyPos].locked = false;

        // Remove the interval if no locked jogs are present anymore
        let hasLocked = false;

        for(let i in this.jogwheelStatus) {
            if(this.jogwheelStatus[i].locked) {
                hasLocked = true;
                break;
            }
        }

        if(!isEmpty(this.jogwheelInterval) && !hasLocked) {
            clearInterval(this.jogwheelInterval);
            this.jogwheelInterval = null;
        }
    }

    jogwheelEnabled(key)
    {
        let keyPos = this.jogwheelGetKeyHash(key);
        
        if(this.jogwheelStatus[keyPos]) {
            return true;
        }
        
        return false;
    }

    jogwheelStop(key)
    {
        let keyPos = this.jogwheelGetKeyHash(key);

        if(this.jogwheelStatus[keyPos]) {
            delete this.jogwheelStatus[key];

            if(isEmpty(this.jogwheelStatus)) {
                clearInterval(this.jogwheelInterval);
                this.jogwheelInterval = null;
            }
        }
    }

    jogwheelAction(action, target, actionParameters, value)
    {
        switch(action) {
            case "crop":
                let sceneName = this.getAbsoluteSceneName(target.scene);
                let sceneItem = this.getSceneItem(sceneName, target.source);

                let cropAmount = Math.max(0, sceneItem.properties.crop[actionParameters.direction] + value);

                // Update only if the new crop is updated relative to the old one
                if(sceneItem.properties.crop[actionParameters.direction] != cropAmount) {
                    this.cropSceneItem(sceneName, target.source, actionParameters.direction, cropAmount);
                    return true;
                }
        }

        return false;
    }

    onJogwheelInterval()
    {
        for(let i in this.jogwheelStatus) {
            if(this.jogwheelStatus[i].locked) {
                let js = this.jogwheelStatus[i];
                let updated = this.jogwheelAction(js.action, js.target, js.actionParameters, js.increment * js.positionLock);

                // Disable the lock if the update failed
                if(!updated) {
                    this.jogwheelUnlock(null, i);
                }
            }
        }
    }

    //// ACTIONS ////

    getActions()
    {
        return {
            obs_change_scene: {
                label: "OBS: change scene",
                parameters: {
                    scene: {
                        label: "Target scene",
                        type: "choice",
                        values: function() {
                            return this.sceneList;
                        }
                    }
                },
                perform: function(key) {
                    this.changeScene(key.action.scene);
                }
            },

            obs_set_volume: {
                label: "OBS: Set audio volume",
                parameters: {
                    source: {
                        label: "Source",
                        type: "choice",
                        values: function() {
                            return this.getAudioSources();
                        }
                    }
                },
                perform: function(key) {
                    this.setSourceVolume(key.action.source, key.value / 127.0);
                }
            },

            obs_toggle_mute: {
                label: "OBS: Toggle mute",
                parameters: {
                    source: {
                        label: "Source",
                        type: "choice",
                        values: function() {
                            return this.getAudioSources();
                        }
                    }
                },
                perform: function(key) {
                    this.toggleSourceMute(key.action.source);
                }
            },

            obs_set_preview: {
                label: "OBS: Set preview scene",
                parameters: {
                    scene: {
                        label: "Target scene",
                        type: "choice",
                        values: function() {
                            let sceneList = _.clone(this.sceneList);
                            sceneList.unshift("Previous scene");
                            sceneList.unshift("Next scene");

                            return sceneList;
                        }
                    }
                },
                perform: function(key) {
                    let targetScene = null;
                    let targetSceneIndex = this.currentPreview;

                    if(['Previous scene', 'Next scene'].includes(key.action.scene)) {
                        targetSceneIndex += key.action.scene == "Previous scene" ? -1 : 1;
                        
                        if(targetSceneIndex >= this.sceneList.length) {
                            targetSceneIndex = 0;
                        } else if(targetSceneIndex < 0) {
                            targetSceneIndex = this.sceneList.length - 1;
                        }

                        targetScene = this.sceneList[targetSceneIndex];
                    } else {
                        targetScene = key.action.scene;
                    }

                    this.changePreviewScene(targetScene);
                }
            },

            obs_transition: {
                label: "OBS: Transition to program",
                parameters: {},
                perform: function(key) {
                    this.transitionScene();
                }
            },
            
            obs_crop: {
                label: "OBS: Crop source",
                parameters: {
                    scene: {
                        label: "Scene",
                        type: "choice",
                        values: function() {
                            let sceneList = _.clone(this.sceneList);
                            sceneList.unshift(OBSModule.CURRENT_PREVIEW);
                            return sceneList;
                        }
                    },

                    source: {
                        label: "Target source",
                        type: "choice",
                        values: function() {
                            return this.getVideoSources();
                        }
                    },
                    
                    direction: {
                        label: "Direction",
                        type: "choice",
                        values: [
                            "top",
                            "bottom",
                            "left",
                            "right"
                        ]
                    },

                    behavior: {
                        label: "Behavior",
                        type: "choice",
                        context: "analog",
                        values: {
                            jogwheel: "Jogwheel",
                            absolute: "Absolute"
                        }
                    },

                    increment: {
                        label: "Lock increment",
                        type: "number",
                        context: "analog"
                    },

                    amount: {
                        label: "Crop amount",
                        type: "number",
                        context: "button"
                    }
                },
                perform: function(key) {
                    // TODO: Refactor this to avoid repetitions
                    // Analog handling (slider/rotary)
                    if(key.value != null) {
                        switch(key.action.behavior) {
                            case "jogwheel":
                                let target = {scene: key.action.scene, source: key.action.source};
                                let params = { direction: key.action.direction };

                                if(!this.jogwheelEnabled(key)) {
                                    this.jogwheelStart(key, "crop", target, params, key.value, key.action.increment);
                                }
                                
                                this.jogwheelMove(key, key.value);
                                
                                if(key.value > OBSModule.JOGWHEEL_LOCK_MIN && key.value < OBSModule.JOGWHEEL_LOCK_MAX) {
                                    this.jogwheelUnlock(key);
                                } else {
                                    this.jogwheelLock(key, (key.value == OBSModule.JOGWHEEL_LOCK_MIN ? -1 : 1));
                                }
                                break;
                                
                            case "absolute":
                                let cropPercent = key.value / 127.0;
                                let sceneName = this.getAbsoluteSceneName(key.action.scene);
                                let sceneItem = this.getSceneItem(sceneName, key.action.source);
                                let cropPixels = 0;

                                if(_.contains(["top", "bottom"], key.action.direction)) {
                                    cropPixels = sceneItem.properties.sourceHeight * (1.0 - cropPercent);
                                } else {
                                    cropPixels = sceneItem.properties.sourceWidth * (1.0 - cropPercent);
                                }

                                this.cropSceneItem(sceneName, key.action.source, key.action.direction, cropPixels);
                                break;
                        }
                    } else { // Digital handling (button)
                        let sceneName = this.getAbsoluteSceneName(key.action.scene);
                        let sceneItem = this.getSceneItem(sceneName, key.action.source);
                        let cropAmount = sceneItem.properties.crop[key.action.direction] + parseInt(key.action.amount);

                        this.cropSceneItem(key.action.scene, key.action.source, key.action.direction, cropAmount);
                    }
                }
            },

            obs_toggle_visible: {
                label: "OBS: Toggle source visibility",
                parameters: {
                    scene: {
                        label: "Scene",
                        type: "choice",
                        values: function() {
                            let sceneList = _.clone(this.sceneList);
                            sceneList.unshift(OBSModule.CURRENT_PREVIEW);
                            return sceneList;
                        }
                    },

                    source: {
                        label: "Target source",
                        type: "choice",
                        values: function() {
                            return this.getVideoSources();
                        }
                    },

                    hideOtherSources: {
                        label: "Hide other sources",
                        type: "choice",
                        values: { 
                            "yes": "Yes", 
                            "no": "No"
                        }
                    }
                },
                perform: function(key) {
                    if(key.action.hideOtherSources && key.action.hideOtherSources == "yes") {
                        let sceneItems = this.getSceneItemListForScene(key.action.scene);

                        for(let i in sceneItems) {
                            this.toggleSourceVisibility(key.action.scene, sceneItems[i].sourceName, false);
                        }

                        this.toggleSourceVisibility(key.action.scene, key.action.source, true);
                    } else {
                        this.toggleSourceVisibility(key.action.scene, key.action.source);
                    }

                }
            },

            obs_fade_volume: {
                label: "OBS: Fade volume",
                parameters: {
                    source: {
                        label: "Source",
                        type: "choice",
                        values: function() {
                            return this.getAudioSources();
                        }
                    },

                    crossfadeSource: {
                        label: "Crossfade source",
                        type: "choice",
                        values: function() {
                            return this.getAudioSources();
                        }
                    },

                    behavior: {
                        label: "Behavior",
                        type: "choice",
                        values: {
                            "one-way": "One way",
                            "toggle": "Toggle"
                        }
                    }
                },
                perform: function(key) {
                    let sourceDir = "in";
                    let crossfadeSourceDir = "out";

                    // In case of a toggle behavior, check to reverse direction depending on source volume
                    if(key.action.behavior == "toggle") {
                        let source = this.getSource(key.action.source);

                        if(source.volume !== 0) {
                            sourceDir = "out";
                            crossfadeSourceDir = "in";
                        }
                    }

                    if(key.action.source) {
                        this.fadeVolumeStart(key.action.source, sourceDir);
                    }

                    if(key.action.crossfadeSource) {
                        this.fadeVolumeStart(key.action.crossfadeSource, crossfadeSourceDir);
                    }
                }
            }
        };
    }
}


Object.defineProperty(OBSModule, 'JOGWHEEL_LOCK_MIN', {
    value: 0,
    writable: false,
    configurable: false,
    enumerable: true,
});

Object.defineProperty(OBSModule, 'JOGWHEEL_LOCK_MAX', {
    value: 127,
    writable: false,
    configurable: false,
    enumerable: true,
});

Object.defineProperty(OBSModule, 'CURRENT_PREVIEW', {
    value: "Current preview",
    writable: false,
    configurable: false,
    enumerable: true,
});

module.exports = OBSModule;