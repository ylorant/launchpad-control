import React from "react";

class Jogwheel extends React.Component
{
    render()
    {
        let additionalClasses = [];

        if(this.props.selected) {
            additionalClasses.push("active");
        }
        
        return (
            <div 
                className={"nks-jogwheel " + (this.props.className ?? "") + " " + additionalClasses.join(" ")} 
                onClick={() => this.props.onClick(this)}>
                {this.props.children}
            </div>
        );
    }
}

export default Jogwheel;