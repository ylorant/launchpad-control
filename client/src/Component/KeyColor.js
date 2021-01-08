import React from "react";
import { Component } from "react";
import { Button, Modal } from "react-bootstrap";
import Colors from '../Enum/Colors';
import { CirclePicker } from "react-color";
import _ from 'underscore';

class KeyColor extends Component
{
    constructor(props) {
        super(props);

        this.state = {
            color: this.props.color instanceof Array ? [...this.props.color] : this.props.color,
            popupOpen: false,
            label: ""
        };
    }

    onColorChange(ev, animationIndex)
    {
        let color = this.state.color;

        if(animationIndex) {
            color[animationIndex] = _.findKey(Colors.htmlCodes, (item) => item === ev.hex);
        } else {
            color = _.findKey(Colors.htmlCodes, (item) => item === ev.hex);
        }

        this.setState({color: color});
    }

    onColorTypeChange(ev)
    {
        let color = this.state.color;

        if(ev.target.value === "static") {
            color = this.props.color instanceof Array ? null : this.props.color;
        } else {
            color = this.props.color instanceof Array ? this.props.color : [];
        }

        this.setState({color: color});
    }

    onAddAnimationFrame()
    {
        console.log(this.state.color);
        let color = this.state.color;
        color.push(null);

        this.setState({ color: color });
    }

    onRemoveAnimationFrame(index)
    {
        let color = this.state.color;
        color.splice(index, 1);

        this.setState({ color: color });
    }

    onResetColor()
    {
        this.setState({ color: this.props.color instanceof Array ? [...this.props.color] : this.props.color });
    }
    
    onApplyColor()
    {
        if(this.props.onChange) {
            this.props.onChange(this.state.color);
        }

        this.setState({ popupOpen: false });
    }

    render()
    {
        let colorLabel = null;
        let colorClasses = null;
        let animationPickers = [];

        // Generating each color's labels
        if(this.state.color instanceof Array) { // Animation
            colorLabel = "Animation";
        } else {
            colorLabel = this.state.color ? Colors.names[this.state.color] : "Off";
        }

        // Generation each color's CSS classes
        if(this.state.color instanceof Array) { // Animation, we show color of the first frame
            colorClasses = this.state.color[0] ? Colors.codes[this.state.color[0]] : Colors.OFF;
        } else { // Static color
            colorClasses = this.state.color ? Colors.codes[this.state.color] : Colors.OFF;
        }

        // Generate animation selectors
        if(this.state.color instanceof Array) {
            for(var i in this.state.color) {
                animationPickers.push(
                    <div key={i} className="row">
                        <div className="col-11">
                            <CirclePicker
                                width="550px"
                                className="mb-1"
                                color={Colors.htmlCodes[this.state.color[i]]}
                                colors={Object.keys(Colors.codesToCSSClass)}
                                onChange={((j, ev) => this.onColorChange(ev, j)).bind(this, i)} />
                        </div>

                        <div className="col-1">
                            <button
                                onClick={this.onRemoveAnimationFrame.bind(this, i)}
                                className="btn btn-danger btn-sm">
                                    &times;
                                </button>
                        </div>
                    </div>
                );
            }
        }

        return (
            <div className="form-group row">
                <div className="col-4">
                    <label htmlFor="key-color-inactive" 
                        className="align-middle mb-0">
                        {this.props.label}:
                    </label>
                </div>

                <div className="col-8">
                    <button
                        id="key-color-inactive"
                        className={"ml-2 btn btn-secondary key-color " + (colorClasses)}
                        onClick={() => this.setState({ popupOpen: true })}>
                        {colorLabel}
                    </button>
                </div>

                <Modal
                    show={this.state.popupOpen}
                    onHide={() => { this.onResetColor(); this.setState({popupOpen: false}); }}
                    backdrop="static"
                    keyboard={true}
                    centered
                    size="lg">
                    <Modal.Header closeButton>
                        <Modal.Title>Code editor</Modal.Title>
                    </Modal.Header>
                
                    <Modal.Body>
                        <div className="form-check">
                            <input 
                                className="form-check-input" 
                                type="radio" 
                                name="color.type" 
                                id="key-color-type-static"
                                value="static"
                                onChange={this.onColorTypeChange.bind(this)}
                                checked={!(this.state.color instanceof Array)} />
                            <label className="form-check-label ml-2" htmlFor="key-color-type-static">
                                Static color
                            </label>
                        </div>

                        {!(this.state.color instanceof Array) && 
                            <div className="mb-3 mt-2">
                                <CirclePicker
                                    width="550px"
                                    color={Colors.htmlCodes[this.state.color]}
                                    colors={Object.keys(Colors.codesToCSSClass)}
                                    onChange={(ev) => this.onColorChange(ev)} />
                            </div>
                        }

                        <div className="form-check">
                            <input 
                                className="form-check-input" 
                                type="radio" 
                                name="color.type" 
                                id="key-color-type-static"
                                value="animation"
                                onChange={this.onColorTypeChange.bind(this)}
                                checked={this.state.color instanceof Array} />
                            <label className="form-check-label ml-2" htmlFor="key-color-type-static">
                                Animation
                            </label>
                        </div>
                        {this.state.color instanceof Array && 
                            <div className="mt-2 mb-2">
                                {animationPickers}
                                <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={this.onAddAnimationFrame.bind(this)}>
                                    Add frame
                                </button>
                            </div>
                        }
                    </Modal.Body>
                
                    <Modal.Footer>
                        <Button
                            onClick={this.onResetColor.bind(this)}
                            variant="secondary">
                                Reset
                            </Button>
                        <Button 
                            variant="primary"
                            onClick={this.onApplyColor.bind(this)}>
                            Apply
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}

export default KeyColor;