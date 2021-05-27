const OBSWebSocket = require('obs-websocket-js');
const Key = require('../scenes/key');
const Module = require('./module');
const _ = require('underscore');

class OBSModule extends Module
{
    //// LIFECYCLE ////

    init(config)
    {
        this.obsConnection = null;
        let sceneList = [];
        let sourceList = [];
        let typeList = {};
        let sceneItemCache = {};

        this.sceneList = sceneList;
        this.sourceList = sourceList;
        this.typeList = typeList;
        this.sceneItemCache = sceneItemCache;
        this.autoCropInterval = null;
        this.jogwheelStatus = {};
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
                // Fetch the mute status for each audio source to set mute buttons
                .then(() => {
                    let reqs = [];
                    let reqId = 0;
                    let audioSources = this.getAudioSources();

                    for(let i in audioSources) {
                        reqs.push({
                            "message-id": "request-" + (++reqId),
                            "request-type": "GetMute",
                            "source": audioSources[i]
                        });
                    }
                    
                    return this.obsConnection.send('ExecuteBatch', { requests: reqs });
                })
                .then((data) => {
                    for(let i in data.results) {
                        this.onSourceMuteUnmute(data.results[i]);
                    }

                    // Trigger a scene re-render
                    this.manager.sceneManager.render();
                })
                .catch((e) => logger.error('Cannot connect to OBS: ' + e.error));
            
            // Binding events
            this.obsConnection
                .on('SourceMuteStateChanged', this.onSourceMuteUnmute.bind(this))
                .on('PreviewSceneChanged', this.onPreviewSceneChanged.bind(this));
            

            setInterval(this.onAutoCropInterval.bind(this), 100);
        }
    }

    shutdown()
    {
        this.obsConnection.disconnect();
    }

    //// EVENTS ////

    onSourceMuteUnmute(data)
    {
        // Get all the keys having the mute toggle type
        let keys = this.manager.sceneManager.getKeysByAction('obs_toggle_mute');
        let sourceName = data.sourceName ? data.sourceName : (data.name ? data.name : null);

        for(let i in keys) {
            if(keys[i].action.source == sourceName) {
                keys[i].status = data.muted ? Key.STATUS_ACTIVE : Key.STATUS_INACTIVE;
                this.manager.sceneManager.getCurrentScene().renderKey(keys[i], true);
            }
        }
    }

    onPreviewSceneChanged(data)
    {
        let sceneIndex = this.sceneList.indexOf(data["scene-name"] ? data["scene-name"] : data);

        if(sceneIndex != -1) {
            this.currentPreview = sceneIndex;
        }
    }

    onAutoCropInterval()
    {
        for(var i in this.jogwheelStatus) {
            let sceneItemKey = this.jogwheelStatus[i].sceneItem;
            let keyAction = this.jogwheelStatus[i].action;
            let cropAmount = null;

            if(this.jogwheelStatus[i].value <= OBSModule.JOGWHEEL_LOCK_MIN) {
                let boundary = null;

                if(_.contains(["top", "bottom"], keyAction.direction)) {
                    boundary = this.sceneItemCache[sceneItemKey].height;
                } else {
                    boundary = this.sceneItemCache[sceneItemKey].width;
                }

                cropAmount = Math.min(boundary, this.sceneItemCache[sceneItemKey].crop[keyAction.direction] + 5);
            } else if(this.jogwheelStatus[i].value >= OBSModule.JOGWHEEL_LOCK_MAX) {
                cropAmount = Math.max(0, this.sceneItemCache[sceneItemKey].crop[keyAction.direction] - 5);
            } else {
                continue; // Skip resize if the jogwheel isn't in extremes
            }

            // Skip crop if the amount didn't change
            if(cropAmount == this.sceneItemCache[sceneItemKey].crop[keyAction.direction]) {
                continue;
            }

            let itemPropertiesUpdate = {
                'scene-name': keyAction.scene,
                'item': keyAction.source,
                crop: {}
            };

            itemPropertiesUpdate.crop[keyAction.direction] = cropAmount;
            this.sceneItemCache[sceneItemKey].crop[keyAction.direction] = cropAmount;
            this.obsConnection.send('SetSceneItemProperties', itemPropertiesUpdate);
        }
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
                    this.obsConnection.send("SetCurrentScene", {'scene-name': key.action.scene});
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

                    this.obsConnection.send('SetVolume', {
                        source: key.action.source, 
                        volume: this.ratioToDB(key.value / 127.0),
                        useDecibel: true
                    });
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
                    this.obsConnection.send('ToggleMute', {source: key.action.source});
                }
            },

            obs_set_preview: {
                label: "OBS: Set preview scene",
                parameters: {
                    scene: {
                        label: "Target scene",
                        type: "choice",
                        values: {
                            previous: "Previous scene",
                            next: "Next scene"
                        }
                    }
                },
                perform: function(key) {
                    this.currentPreview += key.action.scene == "previous" ? -1 : 1;
                    
                    if(this.currentPreview >= this.sceneList.length) {
                        this.currentPreview = 0;
                    } else if(this.currentPreview < 0) {
                        this.currentPreview = this.sceneList.length - 1;
                    }

                    this.obsConnection.send('SetPreviewScene', {"scene-name": this.sceneList[this.currentPreview]});
                }
            },

            obs_transition: {
                label: "OBS: Transition to program",
                parameters: {},
                perform: function(key) {
                    this.obsConnection.send('TransitionToProgram');
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
                        // Handle current preview
                        let sceneName = key.action.scene == OBSModule.CURRENT_PREVIEW ? this.sceneList[this.currentPreview] : key.action.scene;
                        let sceneItemKey = sceneName + "_" + key.action.source;
                        
                        switch(key.action.behavior) {
                            case "jogwheel":
                                let positionKey = JSON.stringify(key.position);

                                if(!this.jogwheelStatus[positionKey]) {
                                    this.jogwheelStatus[positionKey] = {
                                        sceneItem: sceneItemKey,
                                        action: key.action,
                                        value: key.value
                                    };
                                } else if(key.value > OBSModule.JOGWHEEL_LOCK_MIN && key.value < OBSModule.JOGWHEEL_LOCK_MAX) {
                                    let diff = this.jogwheelStatus[positionKey].value - key.value;

                                    let performSceneItemCrop = function() {
                                        let cropAmount = Math.max(0, this.sceneItemCache[sceneItemKey].crop[key.action.direction] + diff);

                                        let itemPropertiesUpdate = {
                                            'scene-name': key.action.scene,
                                            'item': key.action.source,
                                            crop: {}
                                        };

                                        itemPropertiesUpdate.crop[key.action.direction] = cropAmount;
                                        this.sceneItemCache[sceneItemKey].crop[key.action.direction] = cropAmount;
                                        this.obsConnection.send('SetSceneItemProperties', itemPropertiesUpdate);
                                    };

                                    if(!this.sceneItemCache[sceneItemKey]) {
                                        // Fetch data in cache then perform the crop
                                        this.obsConnection
                                            .send('GetSceneItemProperties', { 'scene-name': key.action.scene, item: key.action.source })
                                            .then((data) => {
                                                this.sceneItemCache[sceneItemKey] = data;
                                                performSceneItemCrop.apply(this);
                                            });
                                    } else {
                                        performSceneItemCrop.apply(this);
                                    }
                                } else if(!this.autoCropInterval) {
                                    if(!this.sceneItemCache[sceneItemKey]) {
                                        // Fetch data in cache then perform the crop
                                        this.obsConnection
                                            .send('GetSceneItemProperties', { 'scene-name': key.action.scene, item: key.action.source })
                                            .then((data) => {
                                                this.sceneItemCache[sceneItemKey] = data;
                                            });
                                    }
                                }

                                this.jogwheelStatus[positionKey].value = key.value;
                                break;
                                
                            case "absolute":
                                let cropPercent = key.value / 127.0;

                                let performSceneItemCrop = function() {
                                    let sceneItem = this.sceneItemCache[sceneItemKey];
                                    let cropPixels = 0;
                                    
                                    if(_.contains(["top", "bottom"], key.action.direction)) {
                                        cropPixels = sceneItem.height * (1.0 - cropPercent);
                                    } else {
                                        cropPixels = sceneItem.width * (1.0 - cropPercent);
                                    }

                                    let itemPropertiesUpdate = {
                                        'scene-name': key.action.scene,
                                        'item': key.action.source,
                                        crop: {}
                                    };
                                    itemPropertiesUpdate.crop[key.action.direction] = Math.round(cropPixels);

                                    this.obsConnection.send('SetSceneItemProperties', itemPropertiesUpdate);
                                };

                                // Check if there is already a cache setting for the required scene item
                                if(this.sceneItemCache[sceneItemKey]) {
                                    performSceneItemCrop.apply(this);
                                } else {
                                    // Fetch data in cache then perform the crop
                                    this.obsConnection
                                        .send('GetSceneItemProperties', { 'scene-name': key.action.scene, item: key.action.source })
                                        .then((data) => {
                                            this.sceneItemCache[sceneItemKey] = data;
                                            performSceneItemCrop.apply(this);
                                        });
                                }

                                break;
                        }
                    } else { // Digital handling (button)
                        let sceneItemKey = key.action.scene + "_" + key.action.source;

                        let performSceneItemCrop = function() {
                            let cropAmount = this.sceneItemCache[sceneItemKey].crop[key.action.direction] + parseInt(key.action.amount);

                            let itemPropertiesUpdate = {
                                'scene-name': key.action.scene,
                                'item': key.action.source,
                                crop: {}
                            };
                            itemPropertiesUpdate.crop[key.action.direction] = cropAmount;
                            this.sceneItemCache[sceneItemKey].crop[key.action.direction] = cropAmount;

                            this.obsConnection.send('SetSceneItemProperties', itemPropertiesUpdate);
                        }

                        // Check if there is already a cache setting for the required scene item
                        if(this.sceneItemCache[sceneItemKey]) {
                            performSceneItemCrop.apply(this);
                        } else {
                            // Fetch data in cache then perform the crop
                            this.obsConnection
                                .send('GetSceneItemProperties', { 'scene-name': key.action.scene, item: key.action.source })
                                .then((data) => {
                                    this.sceneItemCache[sceneItemKey] = data;
                                    performSceneItemCrop.apply(this);
                                });
                        }
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
                },
                perform: function(key) {
                    let sceneName = key.action.scene == OBSModule.CURRENT_PREVIEW ? this.sceneList[this.currentPreview] : key.action.scene;
                    
                    this.obsConnection.send('GetSceneItemProperties', { 'scene-name': sceneName, 'item': key.action.source })
                        .then(data => {
                            this.obsConnection.send('SetSceneItemRender', { 'scene-name': sceneName, 'source': key.action.source, render: !data.visible});
                        });
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