import "material-design-iconic-font/dist/css/material-design-iconic-font.min.css";
import React from "react";
import Fader from "./Fader";
import Jogwheel from "./Jogwheel";
import Button from "./Button";

class NanoKontrolStudio extends React.Component
{
    static TYPE = "nanokontrol-studio";

    constructor(props)
    {
        super(props);

        this.state = {
            scene: this.props.scene
        };
    }

    onSelectKey(key)
    {
        let newSelectedKey = key;
        if(this.props.selectedKey !== null && this.props.selectedKey.props.position === key.props.position) {
            newSelectedKey = null;
        }

        if(this.props.onSelectKey) {
            this.props.onSelectKey(newSelectedKey);
        }

        this.setState({
            selectedKey: newSelectedKey
        });
    }

    static getDerivedStateFromProps(props, state)
    {
        let out = {
            scene: props.scene,
            selectedKey: props.selectedKey || null
        };

        // Reset the selected key on scene change
        if(props.scene.id !== state.scene.id) {
            if(props.onSelectKey) {
                props.onSelectKey(null);
            }
            
            out.selectedKey = null;
        } else if(props.selectedKey) {
            out.selectedKey = props.selectedKey;
        }

        return out;
    }

    getKey(position, multiple = false)
    {
        let keys = [];
        
        if(this.props.scene === null) {
            return null;
        }

        for(var i in this.props.scene.keys) {
            let key = this.props.scene.keys[i];
            
            if(key.device === this.props.device.id) {
                if(position instanceof RegExp && key.position.element.match(position)) {
                    keys.push(key);
                } else if(key.position.element === position) {
                    keys.push(key);
                }
            }

            if(keys.length > 0 && !multiple) {
                return keys[0];
            }
        }

        return multiple ? keys : null;
    }

    getPositionObject(position)
    {
        return {
            element: position
        };
    }

    isKeySelected(position)
    {
        return this.props.selectedKey && this.props.selectedKey.props.position.element === position;
    }

    render()
    {
        let lanes = [];

        for (let i = 0; i < 8; i++) {
            let faderCurrentKeys = this.getKey(new RegExp("(button|slider|knob):(lane" + i + "(mute|rec|select|solo)|" + i + ")", "i"), true);
            lanes.push(
                <Fader
                    device={this.props.device}
                    index={i}
                    key={i}
                    onClick={this.onSelectKey.bind(this)}
                    selectedKey={this.props.selectedKey}
                    keyObjects={faderCurrentKeys} />
            );
        }

        return (
            <div className="nanokontrol-studio row align-items-end">
                <div className="col-3 nks-transport d-flex flex-column align-items-end">
                    {/* MARKER */}
                    <div className="row w-100 align-items-center nks-small-btn-container">
                        <div className="col-3 px-0">
                            <Button 
                                className="nks-half-size"
                                device={this.props.device}
                                keyObject={this.getKey("button:cycle")} 
                                position={this.getPositionObject("button:cycle")}
                                selected={this.isKeySelected("button:cycle")}
                                onClick={this.onSelectKey.bind(this)}>
                                Cycle
                            </Button>
                        </div>
                        <div className="col-3 px-0">
                            <Button 
                                className="nks-half-size"
                                device={this.props.device}
                                keyObject={this.getKey("button:set")} 
                                position={this.getPositionObject("button:set")}
                                selected={this.isKeySelected("button:set")}
                                onClick={this.onSelectKey.bind(this)}>
                                Set
                            </Button>
                        </div>
                        <div className="col-3 px-0">
                            <Button 
                                className="nks-half-size"
                                device={this.props.device}
                                keyObject={this.getKey("button:marker_prev")} 
                                position={this.getPositionObject("button:marker_prev")}
                                selected={this.isKeySelected("button:marker_prev")}
                                onClick={this.onSelectKey.bind(this)}>
                                <i className="zmdi zmdi-caret-left"></i>
                            </Button>
                        </div>
                        <div className="col-3 px-0">
                            <Button 
                                className="nks-half-size"
                                device={this.props.device}
                                keyObject={this.getKey("button:marker_next")} 
                                position={this.getPositionObject("button:marker_next")}
                                selected={this.isKeySelected("button:marker_next")}
                                onClick={this.onSelectKey.bind(this)}>
                                <i className="zmdi zmdi-caret-right"></i>
                            </Button>
                        </div>
                    </div>

                    {/* TRACK */}
                    <div className="row w-100 align-items-center nks-small-btn-container">
                        <div className="col-3 px-0">
                            <Button
                                className="nks-half-size"
                                device={this.props.device}
                                keyObject={this.getKey("button:rewind")} 
                                position={this.getPositionObject("button:rewind")}
                                selected={this.isKeySelected("button:rewind")}
                                onClick={this.onSelectKey.bind(this)}>
                                <i className="zmdi zmdi-fast-rewind"></i>
                            </Button>
                        </div>
                        <div className="col-3 px-0">
                            <Button 
                                className="nks-half-size"
                                device={this.props.device}
                                keyObject={this.getKey("button:fastforward")} 
                                position={this.getPositionObject("button:fastforward")}
                                selected={this.isKeySelected("button:fastforward")}
                                onClick={this.onSelectKey.bind(this)}>
                                <i className="zmdi zmdi-fast-forward"></i>
                            </Button>
                        </div>
                        <div className="col-3 px-0">
                            <Button 
                                className="nks-half-size"
                                device={this.props.device}
                                keyObject={this.getKey("button:track_prev")} 
                                position={this.getPositionObject("button:track_prev")}
                                selected={this.isKeySelected("button:track_prev")}
                                onClick={this.onSelectKey.bind(this)}>
                                <i className="zmdi zmdi-caret-left"></i>
                            </Button>
                        </div>
                        <div className="col-3 px-0">
                            <Button 
                                className="nks-half-size"
                                device={this.props.device}
                                keyObject={this.getKey("button:track_next")} 
                                position={this.getPositionObject("button:track_next")}
                                selected={this.isKeySelected("button:track_next")}
                                onClick={this.onSelectKey.bind(this)}>
                                <i className="zmdi zmdi-caret-right"></i>
                            </Button>
                        </div>
                    </div>

                    {/* CONTROLS */}
                    <div className="row w-100 align-items-center mb-3">
                        <div className="col-3 px-0">
                            <Button 
                                device={this.props.device}
                                keyObject={this.getKey("button:previous")} 
                                position={this.getPositionObject("button:previous")}
                                selected={this.isKeySelected("button:previous")}
                                onClick={this.onSelectKey.bind(this)}>
                                <i className="zmdi zmdi-skip-previous"></i>
                            </Button>
                        </div>
                        <div className="col-3 px-0">
                            <Button 
                                device={this.props.device}
                                keyObject={this.getKey("button:stop")} 
                                position={this.getPositionObject("button:stop")}
                                selected={this.isKeySelected("button:stop")}
                                onClick={this.onSelectKey.bind(this)}>
                                <i className="zmdi zmdi-stop"></i>
                            </Button>
                        </div>
                        <div className="col-3 px-0">
                            <Button 
                                device={this.props.device}
                                keyObject={this.getKey("button:play")} 
                                position={this.getPositionObject("button:play")}
                                selected={this.isKeySelected("button:play")}
                                onClick={this.onSelectKey.bind(this)}>
                                <i className="zmdi zmdi-play"></i>
                            </Button>
                        </div>
                        <div className="col-3 px-0">
                            <Button 
                                device={this.props.device}
                                keyObject={this.getKey("button:rec")} 
                                position={this.getPositionObject("button:rec")}
                                selected={this.isKeySelected("button:rec")}
                                onClick={this.onSelectKey.bind(this)}>
                                <i className="zmdi zmdi-circle"></i>
                            </Button>
                        </div>
                    </div>

                    {/* JOGWHEEL */}
                    <div className="d-flex w-100 justify-content-center">
                        <Jogwheel
                            device={this.props.device}
                            keyObject={this.getKey("jogwheel")}
                            position={this.getPositionObject("jogwheel")}
                            selected={this.isKeySelected("jogwheel")}
                            onClick={this.onSelectKey.bind(this)} />
                    </div>
                </div>

                {/* LANES */}
                {lanes}
            </div>
        );
    }
}

export default NanoKontrolStudio;