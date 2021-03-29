import React from "react";
import Colors from "./Colors";

class Key extends React.Component
{
    onClick()
    {
        if(this.props.onClick) {
            this.props.onClick(this);
        }
    }

    render()
    {
        let classes = "lp-key";

        if(this.props.type === "round") {
            classes += " lp-round";
        }

        if(this.props.selected) {
            classes += " active";
        }

        if(this.props.keyObject) {
            let colorCode = this.props.keyObject.colors[this.props.keyObject.status];
            if(Array.isArray(colorCode)) {
                colorCode = colorCode[0];
            }

            classes += " " + Colors.codes[colorCode];
        }

        return (
            <div 
                className={classes}
                title={this.props.keyObject ? this.props.keyObject.label : ""}
                onClick={this.onClick.bind(this)}>
                
                </div>
        );
    }
}

export default Key;