import React from 'react';
import { Button } from 'react-bootstrap';
import Colors from "./Colors";

class Key extends React.Component
{
    onClick(ev)
    {
        if(this.props.onClick) {
            this.props.onClick(this);
        }
    }

    getVariantFromColor()
    {
        let variant = "outline-secondary";

        if(this.props.keyObject) {
            let colorCode = this.props.keyObject.colors[this.props.keyObject.status ?? "inactive"];
            if(Array.isArray(colorCode)) {
                colorCode = colorCode[0];
            }

            variant = Colors.codes[colorCode].replace("btn-", "");

            if(this.props.selected) {
                variant = variant.replace("outline-", "");
            }
        }

        return variant;
    }

    render()
    {
        return <Button 
            variant={this.getVariantFromColor()}
            type="button"
            block
            onClick={this.onClick.bind(this)}>
            {this.props.keyObject && this.props.keyObject.label ? this.props.keyObject.label : "[unnamed]"}
        </Button>;
    }
}

export default Key;