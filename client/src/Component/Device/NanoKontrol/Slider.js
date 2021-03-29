import React from "react";

class Slider extends React.Component
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
            <div className="nk-fader-fader">
                <div 
                    className={"nk-fader-fader-control " + additionalClasses.join(" ")}
                    onClick={this.onClick.bind(this)}>

                </div>
            </div>
        );
    }
}

export default Slider;