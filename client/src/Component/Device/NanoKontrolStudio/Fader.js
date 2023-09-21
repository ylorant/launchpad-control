import React from "react";
import Button from "./Button";
import Knob from "./Knob";
import Slider from "./Slider";

class Fader extends React.Component
{
    onClick(element)
    {
        // Proxify the onClick trigger (since the child is always a custom element, 
        // we directly get the key that's pressed)
        if(this.props.onClick) {
            this.props.onClick(element);
        }
    }

    getKey(position)
    {
        for(var i in this.props.keyObjects) {
            let key = this.props.keyObjects[i];
            if(key.position.element.includes(position)) {
                return key;
            }
        }

        return null;
    }

    isKeySelected(position)
    {
        return this.props.selectedKey && this.props.selectedKey.props.position.element === position;
    }

    getPositionObject(position)
    {
        return {
            element: position
        };
    }

    render()
    {
        return (
            <div className="nks-fader-block col">
                <div className="row no-gutters">
                    <div className="col-12 text-center">
                    <Button
                        key="mute"
                        device={this.props.device}  
                        position={this.getPositionObject("button:lane" + this.props.index + "mute")}
                        selected={this.isKeySelected("button:lane" + this.props.index + "mute")}
                        className="nks-fader-button"
                        keyObject={this.getKey("mute")}
                        onClick={this.onClick.bind(this)}>
                        Mute
                    </Button>
                    <Button
                        key="solo"
                        device={this.props.device}
                        position={this.getPositionObject("button:lane" + this.props.index + "solo")}
                        selected={this.isKeySelected("button:lane" + this.props.index + "solo")}
                        className="nks-fader-button"
                        keyObject={this.getKey("solo")}
                        onClick={this.onClick.bind(this)}>
                        Solo
                    </Button>
                    <Button
                        key="rec"
                        device={this.props.device}
                        position={this.getPositionObject("button:lane" + this.props.index + "rec")}
                        selected={this.isKeySelected("button:lane" + this.props.index + "rec")}
                        className="nks-fader-button"
                        keyObject={this.getKey("rec")}
                        onClick={this.onClick.bind(this)}>
                        Rec
                    </Button>
                    <Button
                        key="select"
                        device={this.props.device}
                        position={this.getPositionObject("button:lane" + this.props.index + "select")}
                        selected={this.isKeySelected("button:lane" + this.props.index + "select")}
                        className="nks-fader-button"
                        keyObject={this.getKey("select")}
                        onClick={this.onClick.bind(this)}>
                        Select
                    </Button>
                    </div>
                    <div className="col-12 text-center">
                        <Knob
                            device={this.props.device}
                            position={this.getPositionObject("knob:" + this.props.index)}
                            selected={this.isKeySelected("knob:" + this.props.index)}
                            keyObject= {this.getKey("knob")}
                            onClick={this.onClick.bind(this)} />
                    </div>
                    <div className="col-12 text-center">
                        <Slider
                            device={this.props.device}
                            position={this.getPositionObject("slider:" + this.props.index)}
                            selected={this.isKeySelected("slider:" + this.props.index)}
                            keyObject={this.getKey("slider")}
                            onClick={this.onClick.bind(this)} />
                    </div>
                </div>
            </div>
        );
    }
}

export default Fader;