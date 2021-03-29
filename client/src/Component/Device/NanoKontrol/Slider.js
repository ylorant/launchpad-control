import React from "react";

class Slider extends React.Component
{
    onSelectKey(ev)
    {
        
    }

    render()
    {
        return (
            <div className="nk-fader-fader">
                <div className="nk-fader-fader-control" onClick={this.onSelectKey.bind(this)}></div>
            </div>
        );
    }
}

export default Slider;