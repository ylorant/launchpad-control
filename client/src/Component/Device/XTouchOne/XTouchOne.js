import Jogwheel from "./Jogwheel";
import React from "react";
import Button from "./Button";
import Encoder from "./Encoder";
import Fader from "./Fader";

class XTouchOne extends React.Component
{
    static TYPE = "xtouch-one";

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

    getPositionObject(position)
    {
        return {
            element: position
        };
    }

    getKey(position)
    {
        if(this.props.scene === null) {
            return null;
        }

        for(var i in this.props.scene.keys) {
            let key = this.props.scene.keys[i];
            
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
        return this.props.selectedKey && this.props.selectedKey.props.position.element === position;
    }

    render()
    {
        let buttons = [
            ["bpm", "master", "select", "mute", "ch_solo", "ch_rec"],
            ["f1", "f2", "f3", "f4", "f5", "f6"],
            ["marker", "nudge", "cycle", "drop", "replace", "click", "solo"]
        ];

        let rows = [];

        for(let btnRow of buttons) {
            let row = [];
            for(let btn of btnRow) {
                row.push(
                    <Button
                        className="float-right"
                        device={this.props.device}
                        keyObject={this.getKey("button:" + btn)}
                        position={this.getPositionObject("button:" + btn)}
                        selected={this.isKeySelected(btn)}
                        onClick={this.onSelectKey.bind(this)} />
                );
            }

            rows.push(
                <div className="row text-right mb-5">
                    <div className="col-12">
                        {row}
                    </div>
                </div>
            );
        }

        return (
            <div className="xtouch-one">
                <div className="row">
                    <div className="col-2 d-flex flex-column">
                        <div>
                            <Encoder
                                device={this.props.device}
                                keyObject={this.getKey("encoder")}
                                position={this.getPositionObject("encoder")}
                                selected={this.isKeySelected("encoder")}
                                onClick={this.onSelectKey.bind(this)} />
                        </div>
                        <div className="flex-fill pt-5">
                            <Fader
                                device={this.props.device}
                                keyObject={this.getKey("fader")}
                                position={this.getPositionObject("fader")}
                                selected={this.isKeySelected("fader")}
                                onClick={this.onSelectKey.bind(this)} />
                        </div>
                    </div>
                    <div className="col-10">
                        {rows}

                        {/* Playback controls */}
                        <div className="row text-center">
                            <div className="col-12 mb-3">
                                <Button
                                    className="float-right wide"
                                    device={this.props.device}
                                    keyObject={this.getKey("button:rec")}
                                    position={this.getPositionObject("button:rec")}
                                    selected={this.isKeySelected("button:rec")}
                                    onClick={this.onSelectKey.bind(this)}>
                                    <i className="zmdi zmdi-circle"></i>
                                </Button>
                                <Button
                                    className="float-right wide"
                                    device={this.props.device}
                                    keyObject={this.getKey("button:play")}
                                    position={this.getPositionObject("button:play")}
                                    selected={this.isKeySelected("button:play")}
                                    onClick={this.onSelectKey.bind(this)}>
                                    <i className="zmdi zmdi-play"></i>
                                </Button>
                                <Button
                                    className="float-right wide"
                                    device={this.props.device}
                                    keyObject={this.getKey("button:stop")}
                                    position={this.getPositionObject("button:stop")}
                                    selected={this.isKeySelected("button:stop")}
                                    onClick={this.onSelectKey.bind(this)}>
                                    <i className="zmdi zmdi-stop"></i>
                                </Button>
                                <Button
                                    className="float-right wide"
                                    device={this.props.device}
                                    keyObject={this.getKey("button:forward")}
                                    position={this.getPositionObject("button:forward")}
                                    selected={this.isKeySelected("button:forward")}
                                    onClick={this.onSelectKey.bind(this)}>
                                    <i className="zmdi zmdi-fast-forward"></i>
                                </Button>
                                <Button
                                    className="float-right wide"
                                    device={this.props.device}
                                    keyObject={this.getKey("button:rewind")}
                                    position={this.getPositionObject("button:rewind")}
                                    selected={this.isKeySelected("button:rewind")}
                                    onClick={this.onSelectKey.bind(this)}>
                                    <i className="zmdi zmdi-fast-rewind"></i>
                                </Button>
                            </div>
                        </div>
                        <div className="row text-right mt-2">
                            <div className="col-5">
                                {/* Fader bank nav */}
                                <div className="ml-3 pl-2 mb-3 clearfix">
                                    <Button
                                        className="float-left"
                                        device={this.props.device}
                                        keyObject={this.getKey("button:fb_prev")}
                                        position={this.getPositionObject("button:fb_prev")}
                                        selected={this.isKeySelected("button:fb_prev")}
                                        onClick={this.onSelectKey.bind(this)} />
                                    <Button
                                        className="float-left"
                                        device={this.props.device}
                                        keyObject={this.getKey("button:fb_next")}
                                        position={this.getPositionObject("button:fb_next")}
                                        selected={this.isKeySelected("button:fb_next")}
                                        onClick={this.onSelectKey.bind(this)} />
                                </div>

                                {/* Channel nav */}
                                <div className="ml-3 pl-2 mb-3 clearfix">
                                    <Button
                                        className="float-left"
                                        device={this.props.device}
                                        keyObject={this.getKey("button:ch_prev")}
                                        position={this.getPositionObject("button:ch_prev")}
                                        selected={this.isKeySelected("button:ch_prev")}
                                        onClick={this.onSelectKey.bind(this)} />
                                    <Button
                                        className="float-left"
                                        device={this.props.device}
                                        keyObject={this.getKey("button:ch_next")}
                                        position={this.getPositionObject("button:ch_next")}
                                        selected={this.isKeySelected("button:ch_next")}
                                        onClick={this.onSelectKey.bind(this)} />
                                </div>

                                {/* DPad */}
                                <div className="ml-4 pt-4 pl-2 xto-dpad">
                                    <div></div>
                                    <div>
                                        <Button
                                            className="float-right no-margin"
                                            device={this.props.device}
                                            keyObject={this.getKey("button:up")}
                                            position={this.getPositionObject("button:up")}
                                            selected={this.isKeySelected("button:up")}
                                            onClick={this.onSelectKey.bind(this)} />
                                    </div>
                                    <div></div>

                                    <div>
                                        <Button
                                            className="float-right no-margin"
                                            device={this.props.device}
                                            keyObject={this.getKey("button:left")}
                                            position={this.getPositionObject("button:left")}
                                            selected={this.isKeySelected("button:left")}
                                            onClick={this.onSelectKey.bind(this)} />
                                    </div>
                                    <div>
                                        <Button
                                            className="float-right no-margin"
                                            device={this.props.device}
                                            keyObject={this.getKey("button:enter")}
                                            position={this.getPositionObject("button:enter")}
                                            selected={this.isKeySelected("button:enter")}
                                            onClick={this.onSelectKey.bind(this)} />
                                    </div>
                                    <div>
                                        <Button
                                            className="float-right no-margin"
                                            device={this.props.device}
                                            keyObject={this.getKey("button:right")}
                                            position={this.getPositionObject("button:right")}
                                            selected={this.isKeySelected("button:right")}
                                            onClick={this.onSelectKey.bind(this)} />
                                    </div>

                                    <div></div>
                                    <div>
                                        <Button
                                            className="float-right no-margin"
                                            device={this.props.device}
                                            keyObject={this.getKey("button:down")}
                                            position={this.getPositionObject("button:down")}
                                            selected={this.isKeySelected("button:down")}
                                            onClick={this.onSelectKey.bind(this)} />
                                    </div>
                                    <div></div>
                                </div>
                            </div>
                            
                            {/* Jogwheel & scrub */}
                            <div className="col-7">
                                <div className="clearfix">
                                    <Button
                                        className="float-right no-margin"
                                        device={this.props.device}
                                        keyObject={this.getKey("button:scrub")}
                                        position={this.getPositionObject("button:scrub")}
                                        selected={this.isKeySelected("button:scrub")}
                                        onClick={this.onSelectKey.bind(this)} />
                                </div>
                                <div className="clearfix">
                                    <Jogwheel
                                        className="float-right"
                                        device={this.props.device}
                                        keyObject={this.getKey("jogwheel")}
                                        position={this.getPositionObject("jogwheel")}
                                        selected={this.isKeySelected("jogwheel")}
                                        onClick={this.onSelectKey.bind(this)} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default XTouchOne;