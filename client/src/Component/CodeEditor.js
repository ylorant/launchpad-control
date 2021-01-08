import React from "react";
import { Button, Modal } from "react-bootstrap";
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/ext-language_tools";

class CodeEditor extends React.Component
{
    constructor(props)
    {
        super(props);

        this.state = {
            editorOpen: false,
            code: props.code
        };
    }

    onApplyCode()
    {
        if(this.props.onChange) {
            this.props.onChange(this.state.code);
        }

        this.setState({editorOpen: false});
    }

    render()
    {
        return (
            <div>
                <div className="input-group">
                    <input
                        id="key-code"
                        className="form-control"
                        name="action.code"
                        value={this.state.code ?? ""}
                        readOnly={true} />
                    <div className="input-group-append">
                        <button 
                            className="btn btn-primary"
                            onClick={() => this.setState({editorOpen: true})}>
                            Open editor
                        </button>
                    </div>
                </div>
                
                <Modal
                    show={this.state.editorOpen}
                    onHide={() => this.setState({editorOpen: false})}
                    backdrop="static"
                    keyboard={true}
                    centered
                    size="lg">
                    <Modal.Header closeButton>
                        <Modal.Title>Code editor</Modal.Title>
                    </Modal.Header>
                
                    <Modal.Body>
                        <AceEditor
                            mode="javascript"
                            theme="monokai"
                            onChange={(newCode) => this.setState({ code: newCode})}
                            name="key-code-editor"
                            className="w-100"
                            value={this.state.code ?? ""}
                            editorProps={{ $blockScrolling: true }}
                        />
                    </Modal.Body>
                
                    <Modal.Footer>
                        <Button 
                            variant="primary"
                            onClick={this.onApplyCode.bind(this)}>
                            Apply
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}

export default CodeEditor;