import React from "react";
import { Button } from "react-bootstrap";
import NanokontrolColors from "../Device/NanoKontrol/Colors";
import KeyColor from "./KeyColor";

class NanoKontrolKeyProperties extends React.Component
{
    onColorChange(type, newColor)
    {
        let key = this.props.currentKey;
        key.colors[type] = newColor;

        if(this.props.onChange) {
            this.props.onChange(key);
        }
    }

    getTypeColorCssClass(type)
    {
        if(this.props.currentKey.colors[type] === "on") {
            return "outline-danger";
        }
        
        return "outline-secondary";
    }

    getTypeColorLabel(type)
    {
        if(this.props.currentKey.colors[type] === "on") {
            return "On";
        }

        return "Off";
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
                        colorsList={NanokontrolColors}
                        key={"inactive-" + keyId}
                        onChange={this.onColorChange.bind(this, "inactive")}
                        color={this.props.currentKey.colors.inactive} />

                    <KeyColor 
                        label="Active color"
                        colorsList={NanokontrolColors}
                        key={"active-" + keyId}
                        onChange={this.onColorChange.bind(this, "active")}
                        color={this.props.currentKey.colors.active} />

                    <KeyColor 
                        label="Pressed color"
                        colorsList={NanokontrolColors}
                        key={"pressed-" + keyId}
                        onChange={this.onColorChange.bind(this, "pressed")}
                        color={this.props.currentKey.colors.pressed} />
                </div>
            </div>
        )
    }
}

export default NanoKontrolKeyProperties;