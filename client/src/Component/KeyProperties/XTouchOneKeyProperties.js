import React from "react";
import XTouchOneColors from "../Device/XTouchOne/Colors";
import KeyColor from "./KeyColor";

class XTouchOneKeyProperties extends React.Component
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
            keyId = this.props.currentKey.position.element;
        } else {
            keyId = "undefined";
        }

        if(!this.props.currentKey.position.element.match(/button:*/)) {
            return null;
        }

        return (
            <div className="form-group">
                <label>Colors: </label>
                {/* Colors */}
                <div className="col">
                    <KeyColor 
                        label="Inactive color"
                        colorsList={XTouchOneColors}
                        key={"inactive-" + keyId}
                        onChange={this.onColorChange.bind(this, "inactive")}
                        color={this.props.currentKey.colors.inactive} />

                    <KeyColor 
                        label="Active color"
                        colorsList={XTouchOneColors}
                        key={"active-" + keyId}
                        onChange={this.onColorChange.bind(this, "active")}
                        color={this.props.currentKey.colors.active} />

                    <KeyColor 
                        label="Pressed color"
                        colorsList={XTouchOneColors}
                        key={"pressed-" + keyId}
                        onChange={this.onColorChange.bind(this, "pressed")}
                        color={this.props.currentKey.colors.pressed} />
                </div>
            </div>
        )
    }
}

export default XTouchOneKeyProperties;