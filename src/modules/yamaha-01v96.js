const Yamaha01v96 = require('midi-01v96');
const Module = require('./module');
const Key = require('../scenes/key');

class Yamaha01v96Module extends Module
{
    init(config)
    {
        this.config = config;

        // Initialize empty config
        if(!this.config) {
            this.config = {
                midiInput: null,
                midiOutput: null,
                faderResolution: null,
                faderRange: null
            };
        }

        this.connect();
    }

    static getConfiguration()
    {
        return {
            midiInput: {
                type: "integer",
                label: "MIDI input port",
                default: null
            },
            midiOutput: {
                type: "integer",
                label: "MIDI output port",
                default: null
            },
            faderResolution: {
                type: "choice",
                label: "Fader resolution",
                default: Yamaha01v96.RES_LOW,
                values: [
                    { label: "Low", value: Yamaha01v96.RES_LOW },
                    { label: "High", value: Yamaha01v96.RES_HIGH }
                ]
            },
            faderRange: {
                type: "choice",
                label: "Fader range",
                default: Yamaha01v96.RANGE_ABSOLUTE,
                values: [
                    { label: "Absolute", value: Yamaha01v96.RANGE_ABSOLUTE },
                    { label: "Relative", value: Yamaha01v96.RANGE_RELATIVE }
                ]
            }
        };
    }

    //// LIFECYCLE ////

    connect()
    {
        let midiInput = this.config.midiInput || null,
            midiOutput = this.config.midiOutput || null;

        this.mixer = new Yamaha01v96();

        this.mixer
            .on('channelLevel', this.onChannelLevel.bind(this, "channel"))
            .on('auxLevel', this.onChannelLevel.bind(this, "bus"))
            .on('busLevel', this.onChannelLevel.bind(this, "aux"))
            .on('inGroupMasterLevel', this.onChannelLevel.bind(this, "in_group"))
            .on('outGroupMasterLevel', this.onChannelLevel.bind(this, "out_group"))
            .on('channelOn', this.onChannelOn.bind(this, "channel"))
            .on('auxOn', this.onChannelOn.bind(this, "aux"))
            .on('busOn', this.onChannelOn.bind(this, "bus"))
            .on('inGroupMasterOn', this.onChannelOn.bind(this, "in_group"))
            .on('outGroupMasterOn', this.onChannelOn.bind(this, "out_group"))
            .on('soloChannel', this.onSoloOn.bind(this, "channel"))
            .on('soloAux', this.onSoloOn.bind(this, "aux"))
            .on('soloBus', this.onSoloOn.bind(this, "bus"))
            .on('soloInGroupMaster', this.onSoloOn.bind(this, "in_group"))
            .on('soloOutGroupMaster', this.onSoloOn.bind(this, "out_group"))
            .on('debug', (msg) => logger.debug(msg));

        if(this.config.faderResolution) {
            this.mixer.setFaderResolution(this.config.faderResolution);
        }

        if(this.config.faderRange) {
            this.mixer.setFaderRange(this.config.faderRange);
        }

        try {
            this.mixer.connect(midiInput, midiOutput);
            logger.info("Connected to Yamaha 01v96.");
            this.refreshKeyStatus();
        } catch(e) {
            logger.error("Yamaha 01v96: Cannot connect to device: " + e.message);
        }

    }

    refreshKeyStatus()
    {
        this.refreshKeyStatusForAction("yamaha01v96_set_channel_on", { channel_type: "channel"}, "getChannelOn");
        this.refreshKeyStatusForAction("yamaha01v96_set_channel_on", { channel_type: "aux"}, "getAuxOn");
        this.refreshKeyStatusForAction("yamaha01v96_set_channel_on", { channel_type: "bus"}, "getBusOn");
        this.refreshKeyStatusForAction("yamaha01v96_set_channel_on", { channel_type: "in_group"}, "getInGroupMasterOn");
        this.refreshKeyStatusForAction("yamaha01v96_set_channel_on", { channel_type: "out_group"}, "getOutGroupMasterOn");

        this.refreshKeyStatusForAction("yamaha01v96_set_channel_level", { channel_type: "channel"}, "getChannelLevel");
        this.refreshKeyStatusForAction("yamaha01v96_set_channel_level", { channel_type: "aux"}, "getAuxLevel");
        this.refreshKeyStatusForAction("yamaha01v96_set_channel_level", { channel_type: "bus"}, "getBusLevel");
        this.refreshKeyStatusForAction("yamaha01v96_set_channel_level", { channel_type: "in_group"}, "getInGroupMasterLevel");
        this.refreshKeyStatusForAction("yamaha01v96_set_channel_level", { channel_type: "out_group"}, "getOutGroupMasterLevel");

        this.refreshKeyStatusForAction("yamaha01v96_set_solo", { channel_type: "channel"}, "getChannelSolo");
        this.refreshKeyStatusForAction("yamaha01v96_set_solo", { channel_type: "aux"}, "getAuxOutSolo");
        this.refreshKeyStatusForAction("yamaha01v96_set_solo", { channel_type: "bus"}, "getBusOutSolo");
        this.refreshKeyStatusForAction("yamaha01v96_set_solo", { channel_type: "in_group"}, "getInGroupSolo");
        this.refreshKeyStatusForAction("yamaha01v96_set_solo", { channel_type: "out_group"}, "getOutGroupSolo");
    }

    refreshKeyStatusForAction(action, filters, call)
    {
        let keys = this.manager.sceneManager.getKeysByAction(action);
        let method = this.mixer[call];

        for (let key of keys) {
            let keyValid = true;

            for (let [property, value] of Object.entries(filters)) {
                if (key.action[property] != value) {
                    keyValid = false;
                }
            }

            if (keyValid) {
                method.call(this.mixer, parseInt(key.action.channel));
            }
        }
    }

    //// EVENTS ////

    onChannelLevel(event)
    {
    }

    onChannelOn(type, event)
    {
        let oldStatus = null;
        let keyValue = null;
        let keys = this.manager.sceneManager.getKeysByAction("yamaha01v96_set_channel_on");
        
        for(let key of keys) {
            if (key.action.channel_type == type && key.action.channel == event.channel) {
                oldStatus = key.status;

                // Handle the reversed value situation
                keyValue = key.action.reverse ? !event.value : event.value;
                key.status = keyValue ? Key.STATUS_ACTIVE : Key.STATUS_INACTIVE;
                
                if(oldStatus != key.status) {
                    this.manager.sceneManager.renderKey(key);
                }
            }
        }
    }

    onSoloOn(type, event)
    {
        let keys = this.manager.sceneManager.getKeysByAction("yamaha01v96_set_solo");
        let oldStatus = null;
        
        for(let key of keys) {
            if (key.action.channel == event.channel && key.action.channel_type == type) {
                oldStatus = key.status;
                key.status = event.value ? Key.STATUS_ACTIVE : Key.STATUS_INACTIVE;

                if(oldStatus != key.status) {
                    this.manager.sceneManager.renderKey(key);
                }
            }
        }
    }

    //// UTILITIES ////

    //// ACTIONS ////

    getActions()
    {
        return {
            yamaha01v96_set_channel_on: {
                label: "Yamaha 01v96: Set channel on status",
                parameters: {
                    channel_type: {
                        label: "Channel type",
                        type: "choice",
                        values: {
                            "channel": "Input channel",
                            "aux": "Aux out",
                            "bus": "Bus out",
                            "in_group": "Input group",
                            "out_group": "Output group"
                        }
                    },
                    channel: {
                        label: "Channel",
                        type: "number"
                    },

                    status: {
                        label: "Status",
                        type: "choice",
                        values: {
                            on: "On",
                            off: "Off",
                            toggle: "Toggle"
                        }
                    },

                    reverse: {
                        label: "Reverse value (act as mute)",
                        type: "boolean"
                    }
                },

                perform: function(key) {
                    let status = null, statusToSend = null;
                    let channelNo = parseInt(key.action.channel);
                    
                    if(key.action.status === "toggle") {
                        // Set the boolean status of the key from its constant reversed (toggle behavior)
                        status = key.status == Key.STATUS_INACTIVE ? true : false;
                    } else {
                        status =  key.action.status === "on" ? true : false;
                    }

                    // If the behavior is to have the mixer on status opposite the button, we send the opposite status
                    // to the new one defined for the button
                    statusToSend = key.action.reverse ? !status : status;
                    
                    // Apply the status change to the given channel
                    switch (key.action.channel_type) {
                        case 'channel': this.mixer.setChannelOn(channelNo, statusToSend); break;
                        case 'aux': this.mixer.setAuxOn(channelNo, statusToSend); break;
                        case 'bus': this.mixer.setBusOn(channelNo, statusToSend); break;
                        case 'in_group': this.mixer.setInGroupMasterOn(channelNo, statusToSend); break;
                        case 'out_group': this.mixer.setOutGroupMasterOn(channelNo, statusToSend); break;
                    }

                    // Set status constant from it's boolean status
                    key.status = status ? Key.STATUS_ACTIVE : Key.STATUS_INACTIVE;
                }
            },

            yamaha01v96_set_channel_level: {
                label: "Yamaha 01v96: Set channel fader level",
                parameters: {
                    channel_type: {
                        label: "Channel type",
                        type: "choice",
                        values: {
                            "channel": "Input channel",
                            "aux": "Aux out",
                            "bus": "Bus out",
                            "in_group": "Input group",
                            "out_group": "Output group"
                        }
                    },

                    channel: {
                        label: "Channel",
                        type: "number"
                    }
                },

                perform: function(key) {
                    let channelNo = parseInt(key.action.channel);
                    let volumePercent = (key.value * 100) / 127;

                    switch (key.action.channel_type) {
                        case 'channel': this.mixer.setChannelLevel(channelNo, volumePercent); break;
                        case 'aux': this.mixer.setAuxLevel(channelNo, volumePercent); break;
                        case 'bus': this.mixer.setBusLevel(channelNo, volumePercent); break;
                        case 'in_group': this.mixer.setInGroupMasterLevel(channelNo, volumePercent); break;
                        case 'out_group': this.mixer.setOutGroupMasterLevel(channelNo, volumePercent); break;
                    }
                }
            },

            yamaha01v96_set_solo: {
                label: "Yamaha 01v96: Set channel solo status",
                parameters: {
                    channel_type: {
                        label: "Channel type",
                        type: "choice",
                        values: {
                            "channel": "Input channel",
                            "aux": "Aux out",
                            "bus": "Bus out",
                            "in_group": "Input group",
                            "out_group": "Output group"
                        }
                    },

                    channel: {
                        label: "Channel number",
                        type: "number"
                    },

                    status: {
                        label: "Status",
                        type: "choice",
                        values: {
                            on: "On",
                            off: "Off",
                            toggle: "Toggle"
                        }
                    },
                },

                perform: function(key) {
                    let status = null;
                    let channelNo = parseInt(key.action.channel);
                    
                    if(key.action.status === "toggle") {
                        // Set the boolean status of the key from its constant reversed (toggle behavior)
                        status = key.status == Key.STATUS_INACTIVE ? true : false;
                    } else {
                        status =  key.action.status === "on" ? true : false;
                    }

                    switch (key.action.channel_type) {
                        case 'channel': this.mixer.soloChannel(channelNo, status); break;
                        case 'aux': this.mixer.soloAuxOut(channelNo, status); break;
                        case 'bus': this.mixer.soloBusOut(channelNo, status); break;
                        case 'in_group': this.mixer.soloInGroup(channelNo, status); break;
                        case 'out_group': this.mixer.soloOutGroup(channelNo, status); break;
                    }

                    // Set status constant from it's boolean status
                    key.status = status ? Key.STATUS_ACTIVE : Key.STATUS_INACTIVE;
                }
            },

            yamaha01v96_clear_solo: {
                label: "Yamaha 01v96: Clear solo",
                parameters: {},
                perform: function(key) {
                    this.mixer.clearSolo();
                }
            },

            yamaha01v96_recall_scene: {
                label: "Yamaha 01v96: Recall scene",
                parameters: {
                    index: {
                        label: "Scene index",
                        type: "number"
                    }
                },

                perform: function(key) {
                    this.mixer.recallScene(key.action.index);
                }
            },
        };
    }
}

module.exports = Yamaha01v96Module;