import React from "react";
import { Button, Modal } from "react-bootstrap";
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/ext-language_tools";

class ScriptEditor extends React.Component
{
    constructor(props)
    {
        super(props);

        this.state = {
            editorOpen: false,
            scripts: {},
            originalScripts: {},
            shownScript: null,
            newScriptOpen: false,
            newScriptName: ""
        };
    }

    onShownScriptChange(ev)
    {
        this.setState({ shownScript: ev.target.value });
    }

    onNewScriptButtonClick(ev)
    {
        this.setState({ newScriptOpen: true });
    }

    onScriptCreateClick(ev)
    {
        let scripts = this.state.scripts;
        scripts[this.state.newScriptName] = "";
        
        this.setState({
            scripts: scripts,
            newScriptOpen: false,
            newScriptName: "",
            shownScript: this.state.newScriptName
        });
    }

    onScriptChange(name, newScript)
    {
        let scripts = this.state.scripts;
        scripts[name] = newScript;

        this.setState({
            scripts: scripts
        });
    }


    onSave(name)
    {
        if(this.props.onSave) {
            this.props.onSave(name, this.state.scripts[name]);
        }
    }

    onDelete(name)
    {

    }

    onClose()
    {
        this.setState({editorOpen: false});
    }

    //// LIFECYCLE EVENTS ////

    static getDerivedStateFromProps(props, state)
    {
        let firstScript = null;

        if(props.scripts) {
            for(var i in props.scripts) {
                if(firstScript === null) {
                    firstScript = i;
                }

                // Update scripts in the state only if the props differ from the original ones
                if(state.originalScripts[i] !== props.scripts[i]) {
                    state.originalScripts[i] = props.scripts[i];
                    state.scripts[i] = props.scripts[i];
                }
            }
        }

        if(!state.shownScript && firstScript) {
            state.shownScript = firstScript;
        }

        return state;
    }

    //// UTILITY METHODS ////

    getScriptNames()
    {
        let scriptNames = [];

        for(var i in this.state.scripts) {
            scriptNames.push(i);
        }

        return scriptNames;
    }

    //// RENDER ////

    render()
    {
        let tabs = [];
        let defaultTab = null;
        let scriptNames = this.getScriptNames();
        let scriptsOptions = [];

        for(let i in this.state.scripts) {
            if(!defaultTab) {
                defaultTab = i;
            }

            tabs.push(
                <div key={i} className={this.state.shownScript !== i ? "d-none" : ""}>
                    <div className="form-group">
                        <Button 
                            variant="outline-success"
                            onClick={this.onSave.bind(this, i)}>
                            Save {this.state.originalScripts[i] !== this.state.scripts[i] ? "*" : ""}
                        </Button>
                        <Button 
                            variant="outline-danger ml-2"
                            onClick={this.onDelete.bind(this, i)}>
                            Delete
                        </Button>
                    </div>
                    <AceEditor
                        mode="javascript"
                        theme="monokai"
                        onChange={this.onScriptChange.bind(this, i)}
                        name="key-code-editor"
                        className="w-100"
                        value={this.state.scripts[i]}
                        editorProps={{ $blockScrolling: true }}
                    />
                </div>
            );
        }

        for(let i in scriptNames) {
            scriptsOptions.push(
                <option
                    key={scriptNames[i]}
                    value={scriptNames[i]}>
                    {scriptNames[i]}
                </option>
            );
        }

        return (
            <div className="d-inline">
                <Button 
                    variant="outline-primary"
                    onClick={() => this.setState({editorOpen: true})}>
                    Script editor
                </Button>
                
                <Modal
                    show={this.state.editorOpen}
                    onHide={() => this.setState({editorOpen: false})}
                    backdrop="static"
                    keyboard={true}
                    centered
                    size="lg">
                    <Modal.Header closeButton>
                        <Modal.Title>Script editor</Modal.Title>
                    </Modal.Header>
                
                    <Modal.Body>
                        <div className="form-group">
                            <div className="input-group">
                                <select 
                                    className="form-control custom-select"
                                    value={this.state.shownScript}
                                    onChange={this.onShownScriptChange.bind(this)}>
                                    {scriptsOptions}
                                </select>

                                <div className="input-group-append">    
                                    <Button 
                                        variant="btn btn-outline-primary"
                                        onClick={this.onNewScriptButtonClick.bind(this)}>
                                        New script
                                    </Button>
                                </div>
                            </div>
                        </div>
                        {tabs}
                    </Modal.Body>
                
                    <Modal.Footer>
                        <Button 
                            variant="outline-secondary"
                            onClick={this.onClose.bind(this)}>
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>

                <Modal
                    show={this.state.newScriptOpen}
                    onHide={() => this.setState({newScriptName: "", newScriptOpen: false})}
                    backdrop="static"
                    keyboard={true}
                    centered
                    size="lg">
                    <Modal.Header closeButton>
                        <Modal.Title>New script</Modal.Title>
                    </Modal.Header>
                
                    <Modal.Body>
                        <div className="form-group">
                            <input
                                type="text"
                                className="form-control"
                                value={this.state.newScriptName}
                                onChange={(ev) => this.setState({newScriptName: ev.target.value})} />
                        </div>
                    </Modal.Body>
                
                    <Modal.Footer>
                        <Button 
                            variant="outline-primary"
                            onClick={this.onScriptCreateClick.bind(this)}>
                            Create
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}

export default ScriptEditor;