import { Button, Modal } from "react-bootstrap";
import React from "react";
import { slugify } from "transliteration";

class SceneManager extends React.Component
{
    constructor(props)
    {
        super(props);

        this.state = {
            scenes: [],
            currentScene: "",
            deleteSceneConfirmPopupOpen: false,
            newScenePopupOpen: false,
            newSceneId: "",
            newSceneName: ""
        };
    }

    refreshSceneList()
    {
        this.props.api.scenes.get(this.onSceneListReceive.bind(this));
    }

    generateIDFromName()
    {
        return slugify(this.state.newSceneName);
    }

    //// EVENTS ////

    onSceneListReceive(err, data, handlers)
    {
        if(data === null) {
            return;
        }

        this.setState({scenes: data});
    }

    onNewSceneReceived(ev)
    {
        this.refreshSceneList();
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
        let newSceneId = this.state.newSceneId;
        if(newSceneId.length === 0) {
            newSceneId = this.generateIDFromName();
        }

        this.props.api.scenes.post({ id: newSceneId, name: this.state.newSceneName }, () => {});
        this.setState({ 
            newScenePopupOpen: false,
            newSceneId: "",
            newSceneName: ""
        });
    }

    //// COMPONENT LIFECYCLE METHODS ////

    componentDidMount()
    {
        this.props.eventListener.on("new-scene", this.onNewSceneReceived.bind(this));
        this.refreshSceneList();
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
                <div className="col-9 form-group">
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
                            <Button 
                                variant="btn btn-outline-primary" 
                                disabled={this.state.currentScene === null}
                                onClick={this.onChangeSceneButtonClick.bind(this)}>
                                Change
                            </Button>
                            <Button 
                                variant="btn btn-outline-danger"
                                disabled={this.state.currentScene === null}
                                onClick={() => this.setState({ deleteSceneConfirmPopupOpen: true })}>
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="col-3 text-center">
                    <Button 
                        variant="outline-success"
                        onClick={() => this.setState({ newScenePopupOpen: true})}>
                        New scene
                    </Button>
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
                        variant="outline-secondary" 
                        onClick={() => this.setState({ deleteSceneConfirmPopupOpen: false })}>
                        Cancel
                    </Button>
                    <Button 
                        variant="outline-danger"
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
                    keyboard={true}
                    centered>
                    <Modal.Header closeButton>
                        <Modal.Title>New scene</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="form-group">
                            <label>Name:</label>
                            <input 
                                className="form-control" 
                                type="text"
                                value={this.state.newSceneName}
                                onChange={(ev) => this.setState({ newSceneName: ev.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>ID:</label>
                            <input 
                                className="form-control" 
                                type="text"
                                placeholder={this.generateIDFromName()}
                                value={this.state.newSceneId}
                                onChange={(ev) => this.setState({ newSceneId: ev.target.value })} />
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button 
                            variant="outline-secondary" 
                            onClick={() => this.setState({ newScenePopupOpen: false })}>
                            Cancel
                        </Button>
                        <Button 
                            variant="outline-success"
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