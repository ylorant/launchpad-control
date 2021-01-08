import React from 'react';
import fermata from 'fermata';
import 'jquery';
import 'popper.js';
import 'bootstrap';

// Misc imports
import Config from './config';
import EventListener from './event-listener';

// Components
import Launchpad from './Component/Launchpad/Launchpad';
import SceneManager from './Component/SceneManager';
import KeyProperties from './Component/KeyProperties';

// CSS
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/main.css';
import SystemOperations from './Component/SystemOperations';

class App extends React.Component 
{
    constructor(props)
    {
        super(props);
        
        this.api = fermata.json(Config.api.host);

        this.state = { 
            currentScene: {},
            currentKey: null,
            liveView: true
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

        // Find and update the key in the scene data
        for(var i in scene.keys) {
            let key = scene.keys[i];
            if(key.x === newKey.x && key.y === newKey.y) {
                scene.keys[i] = newKey;
            }
        }

        this.setState({currentScene: scene});
    }

    onRenderSceneReceived(ev)
    {
        if(this.state.liveView) {
            this.loadSceneData(ev.params.scene);
        }
    }

    onSceneViewChange(newScene) {
        let liveViewStatus = false;

        // Change to the live view, get current scene
        if(newScene === "") {
            liveViewStatus = true;
            this.api.scenes.current.get(this.onCurrentSceneReceive.bind(this));
        } else {
            this.loadSceneData(newScene);
        }

        this.setState({
            liveView: liveViewStatus
        });
    }

    onCurrentSceneReceive(err, data, handlers)
    {
        this.loadSceneData(data);
    }

    onSceneReceived(err, data, handlers)
    {
        this.setState({currentScene: data});
    }

    onCurrentKeyChanged(key)
    {
        this.setState({
            currentKey: key
        });
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
        this.eventListener = new EventListener(Config.listener.hubUrl, Config.listener.topic);
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
                    <div className="col-md-6  col-xs-12 text-center">
                        <Launchpad
                            scene={this.state.currentScene}
                            onSelectKey={this.onCurrentKeyChanged.bind(this)}
                        />
                    </div>
                    <div className="col-md-6 col-xs-12">
                        <fieldset>
                            <legend>System</legend>
                            <SystemOperations
                                api={this.api}
                            />
                        </fieldset>
                        
                        <fieldset>
                            <legend>Scene</legend>
                            <SceneManager
                                api={this.api}
                                onSceneViewChange={this.onSceneViewChange.bind(this)}
                            />
                        </fieldset>
                        
                        <fieldset>
                            <legend>Key</legend>
                            <KeyProperties
                                api={this.api}
                                sceneId={this.state.currentScene.id}
                                currentKey={this.state.currentKey}
                            />
                        </fieldset>
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                    </div>
                </div>
            </div>
        );
    }
}

export default App;
    