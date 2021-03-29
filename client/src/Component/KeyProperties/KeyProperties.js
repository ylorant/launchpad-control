import React from "react";
import set from 'set-value';
import _ from "underscore";
import Launchpad from "../Device/Launchpad/Launchpad";
import LaunchpadKeyProperties from "./LaunchpadKeyProperties";
import NanoKontrol from "../Device/NanoKontrol/NanoKontrol";
import NanoKontrolKeyProperties from "./NanoKontrolKeyProperties";
import { Button } from "react-bootstrap";

class KeyProperties extends React.Component
{
    constructor(props) {
        super(props);

        this.state = {
            codeEditorOpen: false,
            key: null
        };
    }

    //// CUSTOM METHODS ////

    getKeyTypeComponent()
    {
        if(this.state.key) {
            switch(this.state.key.deviceType) {
                case Launchpad.TYPE:
                    return (
                        <LaunchpadKeyProperties
                            currentKey={this.state.key}
                            onChange={this.onSpecificTypeChange.bind(this)} />
                    );

                case NanoKontrol.TYPE:
                    return (
                        <NanoKontrolKeyProperties
                            currentKey={this.state.key}
                            onChange={this.onSpecificTypeChange.bind(this)} />
                    );
                default:
                    return null;
            }
        }

        return null;
    }

    //// EVENTS ////

    onSubmit()
    {
        let keyToSend = _.clone(this.state.key);
        delete keyToSend.deviceType;

        this.props.api.scenes.scene.key.put({
            scene: this.props.sceneId,
            key: keyToSend
        }, () => {});
    }

    onChange(ev)
    {
        let key = this.state.key;
        set(key, ev.target.name, ev.target.value);

        this.setState({key: key});
    }

    onSpecificTypeChange(key)
    {
        this.setState({key: key});
    }

    onCodeChange(newCode)
    {
        let key = this.state.key;
        key.action.code = newCode;

        this.setState({key: key});
    }

    //// LIFECYCLE EVENTS ////

    static getDerivedStateFromProps(props, state)
    {
        // Default key object
        let keyObject = {
            device: null,
            deviceType: null,
            position: {},
            label: "",
            action: {
                type: ""
            },
            colors: {
                inactive: null,
                active: null,
                pressed: null
            }
        };

        let out = {};

        // Only update the key object if there has been a change in the selection from above
        if(state.key === null || props.currentKey === null || !_.isEqual(props.currentKey.props.position, state.key.position)) {
            
            if(props.currentKey === null) { // No key is selected at all
                keyObject = null;
            } else if(props.currentKey.props.keyObject) { // The selected key has a key object
                keyObject = props.currentKey.props.keyObject;
                keyObject.deviceType = props.currentKey.props.device.type;
            } else { // The selected key is empty (no configuration)
                // Set the empty key object properties we can set from the Launchpad Key object
                keyObject.position = props.currentKey.props.position;
                keyObject.device = props.currentKey.props.device.id;
                keyObject.deviceType = props.currentKey.props.device.type;
            }

            out.key = keyObject;
        }

        return out;
    }

    //// RENDER ////

    getKeyPositionDisplay(position)
    {
        let outputString = "";
        for(let i in position) {
            if(outputString.length > 0) {
                outputString += "; ";
            }
            outputString += i + ": " + position[i];
        }

        return outputString;
    }

    render()
    {
        let keyTypeComponent = this.getKeyTypeComponent(this.state.key);
        let scriptsOptions = [];

        for(var i in this.props.scripts) {
            scriptsOptions.push(
                <option value={this.props.scripts[i]}>{this.props.scripts[i]}</option>
            );
        }

        return (
            <div>
                {this.state.key &&
                    <div className="row">
                        <div className="col">
                            {/* Position */}
                            <div className="row mb-2">
                                <div className="col">
                                    Device: <br />
                                    <code className="ml-4">{this.state.key.device}</code><br />
                                    <code className="ml-4">(Type) {this.state.key.deviceType}</code>
                                </div>
                                <div className="col">
                                    Position: <br />
                                    <code className="ml-4">
                                        {this.getKeyPositionDisplay(this.state.key.position)}
                                    </code>
                                </div>
                            </div>
                            
                            {/* Label */}
                            <div className="form-group">
                                <label htmlFor="key-label">Label:</label>
                                <input 
                                    id="key-label" 
                                    className="form-control" 
                                    name="label" 
                                    value={this.state.key.label || ""}
                                    onChange={this.onChange.bind(this)} />
                            </div>

                            <div className="row">
                                {/* Action type */}
                                <div className="form-group col-6">
                                    <label htmlFor="key-action-type">Action type:</label>
                                    <select 
                                        id="key-action-type"
                                        className="form-control custom-select" 
                                        name="action.type"
                                        onChange={this.onChange.bind(this)}
                                        value={this.state.key.action.type}>
                                            <option value="">-- Select an action --</option>
                                            <option value="toggle">Toggle</option>
                                            <option value="scene">Change scene</option>
                                            <option value="script">Script</option>
                                    </select>
                                </div>


                                {/* Scene change target */}
                                {this.state.key.action.type === "scene" && 
                                    <div className="form-group col-6">
                                        <label htmlFor="key-scene">Target scene:</label>
                                        <input
                                            id="key-scene"
                                            className="form-control"
                                            name="action.scene"
                                            value={this.state.key.action.scene ?? ""}
                                            onChange={this.onChange.bind(this)} />
                                    </div>
                                }

                                {/* Eval code */}
                                {this.state.key.action.type === "script" &&
                                    <div className="form-group col-6">
                                        <label htmlFor="key-script">Script:</label>
                                        <select
                                            id="key-script"
                                            name="action.script"
                                            className="form-control custom-select"
                                            value={this.state.key.action.script}
                                            onChange={this.onChange.bind(this)}>
                                            {scriptsOptions}
                                        </select>
                                    </div>
                                }
                            </div>

                            {keyTypeComponent}

                            <Button 
                                variant="outline-primary"
                                onClick={this.onSubmit.bind(this)} 
                                className="mt-3">
                                Apply
                            </Button>
                        </div>
                    </div>
                }
                {this.state.key === null && 
                    <div>
                        No key selected.
                    </div>
                }
            </div>
        );
    }
}

export default KeyProperties;