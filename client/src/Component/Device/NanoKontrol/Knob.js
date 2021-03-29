import React from "react";

class Knob extends React.Component
{
    onClick(ev)
    {
        if(this.props.onClick) {
            this.props.onClick(this);
        }
    }
    
    render()
    {
        let additionalClasses = [];

        if(this.props.selected) {
            additionalClasses.push("active");
        }

        return (
            <div 
                className={"nk-knob " + additionalClasses.join(" ")}
                onClick={this.onClick.bind(this)}>

            </div>
        );
    }
}

export default Knob;