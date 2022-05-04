import React from "react";
import set from 'set-value';
import _ from "underscore";
import Launchpad from "../Device/Launchpad/Launchpad";
import LaunchpadKeyProperties from "./LaunchpadKeyProperties";
import NanoKontrol from "../Device/NanoKontrol/NanoKontrol";
import NanoKontrolKeyProperties from "./NanoKontrolKeyProperties";
import VirtualDevice from "../Device/VirtualDevice/VirtualDevice";
import XTouchOne from "../Device/XTouchOne/XTouchOne";
import XTouchOneKeyProperties from "./XTouchOneKeyProperties";
import VirtualDeviceKeyProperties from "./VirtualDeviceKeyProperties";
import { Button } from "react-bootstrap";

class KeyProperties extends React.Component
{
    constructor(props) {
        super(props);

        this.state = {
            codeEditorOpen: false,
            key: null,
            actions: {},
            modified: false
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

                case VirtualDevice.TYPE:
                    return (
                        <VirtualDeviceKeyProperties
                            currentKey={this.state.key}
                            onChange={this.onSpecificTypeChange.bind(this)} />
                    );
                
                case XTouchOne.TYPE:
                    return (
                        <XTouchOneKeyProperties
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
        }, this.onUpdateKeySuccess.bind(this, keyToSend));
    }

    onUpdateKeySuccess(key)
    {
        if(this.props.onKeyUpdated) {
            this.props.onKeyUpdated(key);
        }

        this.setState({ modified: false });
    }

    onChange(ev)
    {
        let key = this.state.key;
        set(key, ev.target.name, ev.target.value);

        this.setState({key: key, modified: true});
    }

    onSpecificTypeChange(key)
    {
        this.setState({key: key, modified: true});
    }

    onReceiveActions(err, data, handlers)
    {
        this.setState({ actions: data });
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

            out.modified = false;
            out.key = keyObject;
        }

        return out;
    }

    componentDidMount()
    {
        this.props.api.modules.actions.get(this.onReceiveActions.bind(this));
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
        let actionParameters = [];
        let actionOptions = [
            <option value="" key="">-- Select an action --</option>
        ];

        // Generate action list select options
        if(this.state.actions) {
            for(let i in this.state.actions) {
                actionOptions.push(
                    <option value={i} key={i}>
                        {this.state.actions[i].label}
                    </option>
                );
            }
        }

        // Generate action parameters
        if(this.state.key && this.state.key.action.type) {
            for(let i in this.state.actions[this.state.key.action.type].parameters) {
                let parameter = this.state.actions[this.state.key.action.type].parameters[i];
                let parameterFormElement = null;

                switch(parameter.type) {
                    case "script":
                        let scriptsOptions = [];

                        // Default option
                        scriptsOptions.push(
                            <option value="" key="__empty__">-- None --</option>
                        );

                        // Generate scripts select options
                        for(let k in this.props.scripts) {
                            scriptsOptions.push(
                                <option value={this.props.scripts[k]} key={k}>{this.props.scripts[k]}</option>
                            );
                        }

                        parameterFormElement = (
                            <select
                                id={"key-action-" + i}
                                name={"action." + i}
                                className="form-control custom-select"
                                value={this.state.key.action.script}
                                onChange={this.onChange.bind(this)}>
                                {scriptsOptions}
                            </select>
                        );
                        break;
                    
                    case "choice":
                        let parameterOptions = [];

                        // Default option
                        parameterOptions.push(
                            <option value="" key="__empty__">-- None --</option>
                        );

                        // Generate choice values options
                        for(let k in parameter.values) {
                            let key, value;

                            if(parameter.values instanceof Array) {
                                key = parameter.values[k];
                                value = parameter.values[k];
                            } else {
                                key = k;
                                value = parameter.values[k];
                            }

                            parameterOptions.push(<option value={key} key={k}>{value}</option>);
                        }

                        parameterFormElement = (
                            <select
                                id={"key-action-" + i}
                                className="form-control custom-select"
                                name={"action." + i}
                                value={this.state.key.action[i] ?? ""}
                                onChange={this.onChange.bind(this)}>
                                {parameterOptions}
                            </select>
                        );
                        break;
                    
                    default:
                        parameterFormElement = (
                            <input
                                id={"key-action-" + i}
                                className="form-control"
                                name={"action." + i}
                                type={parameter.type ?? "text"}
                                value={this.state.key.action[i] ?? ""}
                                onChange={this.onChange.bind(this)} />
                        );
                }

                actionParameters.push(
                    <div className="form-group col-6" key={i}>
                        <label htmlFor="key-scene">{parameter.label}:</label>
                        {parameterFormElement}
                    </div>
                );
            }
        }

        // Render block
        return (

            <fieldset className={this.state.modified ? "unsaved" : ""}>
                <legend>Key {this.state.modified ? "[modified]" : ""}</legend>
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
                                                {actionOptions}
                                        </select>
                                    </div>

                                    {/* Action parameters */}
                                    {actionParameters}
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
            </fieldset>
        );
    }
}

export default KeyProperties;