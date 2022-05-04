import React from "react";

class Fader extends React.Component
{
    render()
    {
        let additionalClasses = [];

        if(this.props.selected) {
            additionalClasses.push("active");
        }
        
        return (
            <div 
                className="xto-fader" 
                onClick={() => this.props.onClick(this)}>
                <div className={"xto-fader-control " + (this.props.className ?? "") + " " + additionalClasses.join(" ")}></div>
            </div>
        );
    }
}

export default Fader;