import "material-design-iconic-font/dist/css/material-design-iconic-font.min.css";
import React from "react";
import Fader from "./Fader";
import Button from "./Button";

class NanoKontrol extends React.Component
{
    static TYPE = "nanokontrol";

    constructor(props)
    {
        super(props);

        this.state = {
            selectedKey: null,
            scene: this.props.scene
        };
    }

    onSelectKey(key)
    {
        let newSelectedKey = key;
        if(this.state.selectedKey !== null && this.state.selectedKey.props.position === key.props.position) {
            newSelectedKey = null;
        }

        if(this.props.onSelectKey) {
            this.props.onSelectKey(newSelectedKey);
        }

        this.setState({
            selectedKey: newSelectedKey
        });
    }

    getKey(position)
    {
        if(this.state.scene === null) {
            return null;
        }

        for(var i in this.state.scene.keys) {
            let key = this.state.scene.keys[i];
            
            if(key.device === this.props.device.id) {
                if(position instanceof RegExp && key.position.element.match(position)) {
                    return key;
                } else if(key.position.element === position) {
                    return key;
                }
            }
        }

        return null;
    }

    isKeySelected(position)
    {
        return this.state.selectedKey && this.state.selectedKey.props.position.element === position;
    }

    getPositionObject(position)
    {
        return {
            element: position
        };
    }

    render()
    {
        let faderColumns = [];

        // Generate columns
        for(let i = 0; i < 8; i++) {
            let faderCurrentKey = this.getKey(new RegExp("((button|slider|knob)(:(s|m|r))?:" + i + ")", "i"));
            faderColumns.push(
                <Fader
                    device={this.props.device}
                    index={i}
                    key={i}
                    onClick={this.onSelectKey.bind(this)}
                    selectedKey={this.state.selectedKey}
                    keyObject={faderCurrentKey} />
            );
        }

        return (
            <div className="nanokontrol row align-items-end no-gutters">
                <div className="nk-transport col-3">
                    <div className="row">
                        <div className="col-2">
                            <Button 
                                device={this.props.device}
                                keyObject={this.getKey("button:track:prev")}
                                position={this.getPositionObject("button:track:prev")}
                                selected={this.isKeySelected("button:track:prev")}
                                className="nk-half-size"
                                onClick={this.onSelectKey.bind(this)}>
                                <i className="zmdi zmdi-caret-left"></i>
                            </Button>
                        </div>
                        <div className="col-2">
                            <Button
                                device={this.props.device}
                                keyObject={this.getKey("button:track:next")} 
                                position={this.getPositionObject("button:track:next")}
                                selected={this.isKeySelected("button:track:next")}
                                className="nk-half-size" 
                                onClick={this.onSelectKey.bind(this)}>
                                <i className="zmdi zmdi-caret-right"></i>
                            </Button>
                        </div>

                        <div className="w-100"></div>

                        <div className="col-2">
                            <Button 
                                device={this.props.device}
                                keyObject={this.getKey("button:cycle")}
                                position={this.getPositionObject("button:cycle")}
                                selected={this.isKeySelected("button:cycle")}
                                className="nk-half-size" 
                                onClick={this.onSelectKey.bind(this)}>
                                cycle
                            </Button>
                        </div>

                        <div className="col-2 offset-2">
                            <Button 
                                device={this.props.device}
                                keyObject={this.getKey("button:marker:set")}
                                position={this.getPositionObject("button:marker:set")}
                                selected={this.isKeySelected("button:marker:set")}
                                className="nk-half-size" 
                                onClick={this.onSelectKey.bind(this)}>
                                set
                            </Button>
                        </div>
                        <div className="col-2">
                            <Button 
                                device={this.props.device}
                                keyObject={this.getKey("button:marker:prev")}
                                position={this.getPositionObject("button:marker:prev")}
                                selected={this.isKeySelected("button:marker:prev")}
                                className="nk-half-size" 
                                onClick={this.onSelectKey.bind(this)}>
                                <i className="zmdi zmdi-caret-left"></i>
                            </Button>
                        </div>
                        <div className="col-2">
                            <Button 
                                device={this.props.device}
                                keyObject={this.getKey("button:marker:next")}
                                position={this.getPositionObject("button:marker:next")}
                                selected={this.isKeySelected("button:marker:next")}
                                className="nk-half-size" 
                                onClick={this.onSelectKey.bind(this)}>
                                <i className="zmdi zmdi-caret-right"></i>
                            </Button>
                        </div>

                        <div className="w-100"></div>

                        <div className="col-2">
                            <Button
                                keyObject={this.getKey("button:prev")}
                                position={this.getPositionObject("button:prev")}
                                selected={this.isKeySelected("button:prev")}
                                onClick={this.onSelectKey.bind(this)}>
                                <i className="zmdi zmdi-fast-rewind"></i>
                            </Button>
                        </div>
                        <div className="col-2">
                            <Button 
                                device={this.props.device}
                                keyObject={this.getKey("button:next")} 
                                position={this.getPositionObject("button:next")}
                                selected={this.isKeySelected("button:next")}
                                onClick={this.onSelectKey.bind(this)}>
                                <i className="zmdi zmdi-fast-forward"></i>
                            </Button>
                        </div>
                        <div className="col-2">
                            <Button 
                                device={this.props.device}
                                keyObject={this.getKey("button:stop")} 
                                position={this.getPositionObject("button:stop")}
                                selected={this.isKeySelected("button:stop")}
                                onClick={this.onSelectKey.bind(this)}>
                                <i className="zmdi zmdi-stop"></i>
                            </Button>
                        </div>
                        <div className="col-2">
                            <Button 
                                device={this.props.device}
                                keyObject={this.getKey("button:play")} 
                                position={this.getPositionObject("button:play")}
                                selected={this.isKeySelected("button:play")}
                                onClick={this.onSelectKey.bind(this)}>
                                <i className="zmdi zmdi-play"></i>
                            </Button>
                        </div>
                        <div className="col-2">
                            <Button 
                                device={this.props.device}
                                keyObject={this.getKey("button:rec")} 
                                position={this.getPositionObject("button:rec")}
                                selected={this.isKeySelected("button:rec")}
                                onClick={this.onSelectKey.bind(this)}>
                                <i className="zmdi zmdi-dot-circle"></i>
                            </Button>
                        </div>
                    </div>
                </div>
                {faderColumns}
            </div>
        );
    }
}

export default NanoKontrol;