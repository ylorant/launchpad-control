import React from "react";

class Encoder extends React.Component
{
    render()
    {
        let additionalClasses = [];

        if(this.props.selected) {
            additionalClasses.push("active");
        }
        
        return (
            <div 
                className={"xto-encoder " + (this.props.className ?? "") + " " + additionalClasses.join(" ")} 
                onClick={() => this.props.onClick(this)}>
                {this.props.children}
            </div>
        );
    }
}

export default Encoder;