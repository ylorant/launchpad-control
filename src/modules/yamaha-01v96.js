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
            .on('channelLevel', this.onChannelLevel.bind(this))
            .on('channelOn', this.onChannelOn.bind(this))
            .on('soloChannel', this.onSoloOn.bind(this, "channel"))
            .on('soloMaster', this.onSoloOn.bind(this, "aux"))
            .on('soloMaster', this.onSoloOn.bind(this, "bus"))
            .on('soloGroup', this.onSoloOn.bind(this, "group"));

        if(this.config.faderResolution) {
            this.mixer.setFaderResolution(this.config.faderResolution);
        }

        if(this.config.faderRange) {
            this.mixer.setFaderRange(this.config.faderRange);
        }

        try {
            this.mixer.connect(midiInput, midiOutput);
            logger.info("Connected to Yamaha 01v96.");
        } catch(e) {
            logger.error("Yamaha 01v96: Cannot connect to device: " + e.message);
        }

        this.refreshKeyStatus();
    }

    refreshKeyStatus()
    {
        this.refreshKeyStatusForAction("yamaha01v96_set_channel_on", "getChannelOn");
        this.refreshKeyStatusForAction("yamaha01v96_set_channel_level", "getChannelLevel");
    }

    refreshKeyStatusForAction(action, call)
    {
        let keys = this.manager.sceneManager.getKeysByAction(action);
        let method = this.mixer[call];

        for(let key of keys) {
            method.call(this.mixer, key.action.channel);
        }
    }

    //// EVENTS ////

    onChannelLevel(event)
    {
    }

    onChannelOn(event)
    {
        let oldStatus = null;
        let keyValue = null;
        let keys = this.manager.sceneManager.getKeysByAction("yamaha01v96_set_channel_on");
        
        for(let key of keys) {
            if (key.action.channel == event.channel) {
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

        if (type == "aux") {
            event.channel -= 8;
        }
        
        for(let key of keys) {
            if (key.action.channel == event.channel && key.action.channel_type == type) {
                key.status = event.value ? Key.STATUS_ACTIVE : Key.STATUS_INACTIVE;
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
                    
                    if(key.action.status === "toggle") {
                        // Set the boolean status of the key from its constant reversed (toggle behavior)
                        status = key.status == Key.STATUS_INACTIVE ? true : false;
                    } else {
                        status =  key.action.status === "on" ? true : false;
                    }

                    // If the behavior is to have the mixer on status opposite the button, we send the opposite status
                    // to the new one defined for the button
                    statusToSend = key.action.reverse ? !status : status;
                    
                    this.mixer.setChannelOn(key.action.channel, statusToSend);

                    // Set status constant from it's boolean status
                    key.status = status ? Key.STATUS_ACTIVE : Key.STATUS_INACTIVE;
                }
            },

            yamaha01v96_set_channel_level: {
                label: "Yamaha 01v96: Set channel fader level",
                parameters: {
                    channel: {
                        label: "Channel",
                        type: "number"
                    }
                },

                perform: function(key) {
                    this.mixer.setChannelLevel(key.action.channel, (key.value * 100) / 127);
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
                    
                    if(key.action.status === "toggle") {
                        // Set the boolean status of the key from its constant reversed (toggle behavior)
                        status = key.status == Key.STATUS_INACTIVE ? true : false;
                    } else {
                        status =  key.action.status === "on" ? true : false;
                    }

                    let channelNo = parseInt(key.action.channel);

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