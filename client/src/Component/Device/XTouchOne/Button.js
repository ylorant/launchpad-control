import React from "react";

class Button extends React.Component
{
    render()
    {
        let additionalClasses = [];

        if(this.props.selected) {
            additionalClasses.push("active");
        }
        
        return (
            <div 
                className={"xto-btn " + (this.props.className ?? "") + " " + additionalClasses.join(" ")} 
                onClick={() => this.props.onClick(this)}>
                {this.props.children}
            </div>
        );
    }
}

export default Button;