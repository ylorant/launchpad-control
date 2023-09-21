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
            <div className="nks-fader-slider">
                <div 
                    className={"nks-fader-slider-control " + additionalClasses.join(" ")}
                    onClick={this.onClick.bind(this)}>

                </div>
            </div>
        );
    }
}

export default Slider;