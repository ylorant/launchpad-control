import React from "react";
import VirtualDeviceColors from "../Device/VirtualDevice/Colors";
import KeyColor from "./KeyColor";

class VirtualDeviceKeyProperties extends React.Component
{
    onColorChange(type, newColor)
    {
        let key = this.props.currentKey;
        key.colors[type] = newColor;

        if(this.props.onChange) {
            this.props.onChange(key);
        }
    }

    render()
    {
        let keyId = "";

        if(this.props.currentKey) {
            keyId = this.props.currentKey.position.id + "-" + this.props.sceneId;
        } else {
            keyId = "undefined";
        }

        return (
            <div className="form-group">
                <label>Colors: </label>
                {/* Colors */}
                <div className="col">
                    <KeyColor 
                        label="Inactive color"
                        colorsList={VirtualDeviceColors}
                        key={"inactive-" + keyId}
                        onChange={this.onColorChange.bind(this, "inactive")}
                        color={this.props.currentKey.colors.inactive} />

                    <KeyColor 
                        label="Active color"
                        colorsList={VirtualDeviceColors}
                        key={"active-" + keyId}
                        onChange={this.onColorChange.bind(this, "active")}
                        color={this.props.currentKey.colors.active} />

                    <KeyColor 
                        label="Pressed color"
                        colorsList={VirtualDeviceColors}
                        key={"pressed-" + keyId}
                        onChange={this.onColorChange.bind(this, "pressed")}
                        color={this.props.currentKey.colors.pressed} />
                </div>
            </div>
        )
    }
}

export default VirtualDeviceKeyProperties;