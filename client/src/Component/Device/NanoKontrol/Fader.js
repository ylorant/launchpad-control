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
        if(this.props.keyObject && this.props.keyObject.position.element.startsWith(position)) {
            return this.props.keyObject;
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
            <div className="nk-fader-block col">
                <div className="row no-gutters">
                    <div className="col-6 offset-6 text-center">
                        <Knob 
                            device={this.props.device}
                            position={this.getPositionObject("knob:" + this.props.index)}
                            selected={this.isKeySelected("knob:" + this.props.index)}
                            keyObject={this.getKey("knob")}
                            onClick={this.onClick.bind(this)} />
                    </div>
                    <div className="w-100"></div>
                    <div className="col-12">
                        <div className="nk-fader-faderblock row no-gutters">
                            <div className="nk-fader-buttons col-6">
                                <Button
                                    key="s"
                                    device={this.props.device}
                                    position={this.getPositionObject("button:s:" + this.props.index)}
                                    selected={this.isKeySelected("button:s:" + this.props.index)}
                                    className="nk-fader-button"
                                    keyObject={this.getKey("button:s")}
                                    onClick={this.onClick.bind(this)}>
                                    S
                                </Button>
                                <Button
                                    key="m"
                                    device={this.props.device}
                                    position={this.getPositionObject("button:m:" + this.props.index)}
                                    selected={this.isKeySelected("button:m:" + this.props.index)}
                                    className="nk-fader-button"
                                    keyObject={this.getKey("button:m")}
                                    onClick={this.onClick.bind(this)}>
                                    M
                                </Button>
                                <Button
                                    key="r"
                                    device={this.props.device}
                                    position={this.getPositionObject("button:r:" + this.props.index)}
                                    selected={this.isKeySelected("button:r:" + this.props.index)}
                                    className="nk-fader-button"
                                    keyObject={this.getKey("button:r")}
                                    onClick={this.onClick.bind(this)}>
                                    R
                                </Button>
                            </div>
                            <div className="col-6">
                                <Slider
                                    device={this.props.device}
                                    position={this.getPositionObject("slider:" + this.props.index)}
                                    selected={this.isKeySelected("slider:" + this.props.index)}
                                    keyObject={this.getKey("slider")}
                                    onClick={this.onClick.bind(this)} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Fader;