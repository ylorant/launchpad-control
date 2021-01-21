import React from "react";
import set from 'set-value';
import KeyColor from "./KeyColor";
import CodeEditor from "./CodeEditor";
import Colors from "../Enum/Colors";
import _ from "underscore";

class KeyProperties extends React.Component
{
    constructor(props) {
        super(props);

        this.state = {
            codeEditorOpen: false,
            key: null,
            colorPopupOpen: false,
            colorPopupType: null
        };
    }

    onSubmit()
    {
        console.log("Submitting key", this.state.key);

        this.props.api.scenes.scene.key.put({
            scene: this.props.sceneId,
            key: this.state.key
        }, () => {});
    }

    onChange(ev)
    {
        let key = this.state.key;
        set(key, ev.target.name, ev.target.value);

        this.setState({key: key});
    }

    onCodeChange(newCode)
    {
        let key = this.state.key;
        key.action.code = newCode;

        this.setState({key: key});
    }

    onColorChange(type, newColor)
    {
        let key = this.state.key;
        key.colors[type] = newColor;

        this.setState({key: key});
    }

    static getDerivedStateFromProps(props, state)
    {
        let offCode = _.findKey(Colors.codes, (val) => val === Colors.OFF);
        // Default key object
        let keyObject = {
            x: null,
            y: null,
            label: "",
            action: {
                type: ""
            },
            colors: {
                inactive: offCode,
                active: offCode,
                pressed: offCode
            }
        };

        let out = {
            codeEditorOpen: state.codeEditorOpen
        };

        if(state.key === null || props.currentKey.props.x !== state.key.x || props.currentKey.props.y !== state.key.y) {
            if(props.currentKey === null) { // No key is selected at all
                keyObject = null;
            } else if(props.currentKey.props.keyObject) { // The selected key has a key object
                keyObject = props.currentKey.props.keyObject;
            } else { // The selected key is empty (no configuration)
                // Set the empty key object properties we can set from the Launchpad Key object
                keyObject.x = props.currentKey.props.x;
                keyObject.y = props.currentKey.props.y;
            }

            out.key = keyObject;
        }

        return out;
    }

    render()
    {
        let keyId = "";

        if(this.state.key) {
            keyId = this.state.key.x + "-" + this.state.key.y + "-" + this.props.sceneId;
        }
        
        return (
            <div>
                {this.state.key &&
                    <div className="row">
                        <div className="col">
                            {/* Position */}
                            <div>
                                Position: <br />
                                X: {this.state.key.x} / Y: {this.state.key.y}
                            </div>
                            
                            {/* Label */}
                            <div className="form-group">
                                <label htmlFor="key-label">Label:</label>
                                <input 
                                    id="key-label" 
                                    className="form-control" 
                                    name="label" 
                                    value={this.state.key.label}
                                    onChange={this.onChange.bind(this)} />
                            </div>


                            {/* Action type */}
                            <div className="form-group">
                                <label htmlFor="key-action-type">Action type:</label>
                                <select 
                                    id="key-action-type"
                                    className="form-control custom-select" 
                                    name="action.type"
                                    onChange={this.onChange.bind(this)}
                                    value={this.state.key.action.type}>
                                        <option value="">-- Select an action --</option>
                                        <option value="toggle">Toggle</option>
                                        <option value="scene">Change scene</option>
                                        <option value="eval">Code</option>
                                </select>
                            </div>


                            {/* Scene change target */}
                            {this.state.key.action.type === "scene" && 
                                <div className="form-group">
                                    <label htmlFor="key-scene">Target scene:</label>
                                    <input
                                        id="key-scene"
                                        className="form-control"
                                        name="action.scene"
                                        value={this.state.key.action.scene ?? ""}
                                        onChange={this.onChange.bind(this)} />
                                </div>
                            }

                            {/* Eval code */}
                            {this.state.key.action.type === "eval" &&
                                <CodeEditor
                                    code={this.state.key.action.code}
                                    onChange={this.onCodeChange.bind(this)} />
                            }

                            <button onClick={this.onSubmit.bind(this)} className="mt-3 btn btn-primary">
                                Apply
                            </button>
                        </div>

                        {/* Colors */}
                        <div className="col">
                            <KeyColor 
                                label="Inactive color"
                                key={"inactive-" + keyId}
                                onChange={this.onColorChange.bind(this, "inactive")}
                                color={this.state.key.colors.inactive} />

                            <KeyColor 
                                label="Active color"
                                key={"active-" + keyId}
                                onChange={this.onColorChange.bind(this, "active")}
                                color={this.state.key.colors.active} />

                            <KeyColor 
                                label="Pressed color"
                                key={"pressed-" + keyId}
                                onChange={this.onColorChange.bind(this, "pressed")}
                                color={this.state.key.colors.pressed} />
                        </div>
                    </div>
                }
                {this.state.key === null && 
                    <div>
                        No key selected.
                    </div>
                }
            </div>
        );
    }
}

export default KeyProperties;