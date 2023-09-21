import React from "react";

class Button extends React.Component
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

        if(this.props.keyObject) {
            let buttonColor = this.props.keyObject.colors[this.props.keyObject.status ?? "inactive"];
            
            if(Array.isArray(buttonColor)) {
                buttonColor = buttonColor[0];
            }

            additionalClasses.push(buttonColor);
        }

        if(this.props.selected) {
            additionalClasses.push("active");
        }
        
        return (
            <div 
                className={"nks-btn " + (this.props.className ?? "") + " " + additionalClasses.join(" ")} 
                onClick={this.onClick.bind(this)}>
                {this.props.children}
            </div>
        );
    }
}

export default Button;