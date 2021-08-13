import React from 'react';
import fermata from 'fermata';
import Config from './config';
import EventListener from './event-listener';
import DeviceManager from './Component/Device/DeviceManager';
import _ from "underscore";

class ViewApp extends React.Component 
{
    constructor(props)
    {
        super(props);
        
        this.api = fermata.json(Config.api.host);

        // Initialize event listener
        this.eventListener = new EventListener(Config.listener.hubUrl, Config.listener.topic);

        this.state = { 
            currentScene: {},
            forceDevice: this.props.device ?? null
        };
    }
    
    //// EVENTS ////

    onRenderKeyReceived(ev)
    {
        if(this.state.currentScene.id !== ev.params.scene) {
            return;
        }

        let scene = this.state.currentScene;
        let newKey = ev.params.key;
        let keyUpdated = false;

        // Find and update the key in the scene data
        for(var i in scene.keys) {
            let key = scene.keys[i];
            if(_.isEqual(key.position, newKey.position)) {
                scene.keys[i] = newKey;
                keyUpdated = true;
                break;
            }
        }

        if(!keyUpdated) {
            scene.keys.push(newKey);
        }

        this.setState({currentScene: scene});
    }

    onRenderSceneReceived(ev)
    {
        this.loadSceneData(ev.params.scene);
    }

    onSceneReceived(err, data, handlers)
    {
        this.setState({ currentScene: data });
    }

    onCurrentSceneReceive(err, data, handlers)
    {
        this.loadSceneData(data);
    }

    onSelectKey(key)
    {
        if(key && key.props.keyObject) {
            this.api.scenes.current.keypress.post({ scene: this.state.currentScene.id, key: key.props.keyObject }, function() {});
        }
    }

    //// UTILITY METHODS ////

    loadSceneData(newScene)
    {
        // Query new scene details from the API
        this.api.scenes.scene(newScene).get(this.onSceneReceived.bind(this));
    }

    //// COMPONENT LIFECYCLE METHODS ////

    componentDidMount()
    {
        // Bind the live modification to the scene to events
        this.eventListener.on("render-scene", this.onRenderSceneReceived.bind(this));
        this.eventListener.on("render-key", this.onRenderKeyReceived.bind(this));

        // Get the current scene to initialize the live view
        this.api.scenes.current.get(this.onCurrentSceneReceive.bind(this));
    }

    render()
    {
        return (
            <div className="app container-fluid mt-4">
                <div className="row">
                    <div className="col-12 text-center">
                        <DeviceManager
                            api={this.api}
                            scene={this.state.currentScene}
                            selectedKey={null}
                            onSelectKey= {this.onSelectKey.bind(this)}
                            viewMode={true}
                            forceDevice={this.state.forceDevice} />
                    </div>
                </div>
            </div>
        );
    }
}

export default ViewApp;