import { Button, Modal } from "react-bootstrap";
import React from "react";

class SceneManager extends React.Component
{
    constructor(props)
    {
        super(props);

        this.state = {
            scenes: [],
            currentScene: "",
            deleteSceneConfirmPopupOpen: false,
            newScenePopupOpen: false
        };
    }

    //// EVENTS ////

    onSceneListReceive(err, data, handlers)
    {
        if(data === null) {
            return;
        }

        this.setState({scenes: data});
    }

    onChangeSceneView(event)
    {
        if(this.props.onSceneViewChange) {
            this.props.onSceneViewChange(event.target.value);
        }

        this.setState({currentScene: event.target.value});
    }

    onChangeSceneButtonClick(event)
    {
        this.props.api.scenes.current.put({scene: this.state.currentScene}, () => {});
    }

    onConfirmDeleteScene(event)
    {
        this.setState({ deleteSceneConfirmPopupOpen: false });
    }

    onCreateScene(event)
    {
        this.setState({ newScenePopupOpen: false });
    }

    //// COMPONENT LIFECYCLE METHODS ////

    componentDidMount()
    {
        this.props.api.scenes.get(this.onSceneListReceive.bind(this));
    }

    render()
    {
        let scenesOptions = [];

        for(var i in this.state.scenes) {
            scenesOptions.push(
                <option key={i} value={i}>
                    {this.state.scenes[i]}
                </option>
            );
        }

        return (
            <div className="row sceneManager">
                <div className="col-10 form-group">
                    <div className="input-group">
                        <select 
                            className="form-control custom-select" 
                            onChange={this.onChangeSceneView.bind(this)}
                            value={this.state.currentScene}>
                                <option value="">
                                    Live view
                                </option>
                            {scenesOptions}
                        </select>

                        <div className="input-group-append">    
                            <button 
                                className="btn btn-primary" 
                                type="button"
                                disabled={this.state.currentScene === null}
                                onClick={this.onChangeSceneButtonClick.bind(this)}>
                                Change
                            </button>
                            <button 
                                className="btn btn-danger"
                                type="button"
                                disabled={this.state.currentScene === null}
                                onClick={() => this.setState({ deleteSceneConfirmPopupOpen: true })}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-2 text-center">
                    <button 
                        className="btn btn-success"
                        onClick={() => this.setState({ newScenePopupOpen: true})}>
                        New scene
                    </button>
                </div>

                {/* Delete scene modal */}
                <Modal
                    show={this.state.deleteSceneConfirmPopupOpen}
                    onHide={() => this.setState({ deleteSceneConfirmPopupOpen: false })}
                    backdrop="static"
                    keyboard={false}
                    centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Delete scene</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Do you really want to delete this scene ?
                    </Modal.Body>
                    <Modal.Footer>
                    <Button 
                        variant="secondary" 
                        onClick={() => this.setState({ deleteSceneConfirmPopupOpen: false })}>
                        Cancel
                    </Button>
                    <Button 
                        variant="danger"
                        onClick={this.onConfirmDeleteScene.bind(this)}>
                        Delete
                    </Button>
                    </Modal.Footer>
                </Modal>

                {/* New scene modal */}
                <Modal
                    show={this.state.newScenePopupOpen}
                    onHide={() => this.setState({ newScenePopupOpen: false })}
                    backdrop="static"
                    keyboard={false}
                    centered>
                    <Modal.Header closeButton>
                        <Modal.Title>New scene</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        
                    </Modal.Body>
                    <Modal.Footer>
                        <Button 
                            variant="secondary" 
                            onClick={() => this.setState({ newScenePopupOpen: false })}>
                            Cancel
                        </Button>
                        <Button 
                            variant="success"
                            onClick={this.onCreateScene.bind(this)}>
                            Create
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}

export default SceneManager;