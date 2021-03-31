import React from 'react';
import fermata from 'fermata';
import 'jquery';
import 'popper.js';
import 'bootstrap';
import _ from "underscore";

// Misc imports
import Config from './config';
import EventListener from './event-listener';

// Components
import SceneManager from './Component/SceneManager';
import KeyProperties from './Component/KeyProperties/KeyProperties';

// CSS
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/main.css';
import SystemOperations from './Component/SystemOperations';
import DeviceManager from './Component/Device/DeviceManager';

class App extends React.Component 
{
    constructor(props)
    {
        super(props);
        
        this.api = fermata.json(Config.api.host);

        this.eventListener = new EventListener(Config.listener.hubUrl, Config.listener.topic);
        this.eventListener.on("render-scene", this.onRenderSceneReceived.bind(this));
        this.eventListener.on("render-key", this.onRenderKeyReceived.bind(this));

        this.state = { 
            currentScene: {},
            currentKey: null,
            scripts: null,
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
            if(_.isEqual(key.position, newKey.position)) {
                scene.keys[i] = newKey;
                break;
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

    onScriptsReceive(err, data, handlers)
    {
        this.setState({ scripts: data });
    }

    onCurrentKeyChanged(key)
    {
        this.setState({
            currentKey: key
        });
    }

    onKeyUpdated(newKey)
    {
        let scene = this.state.currentScene;
        let keyFound = false;

        // Find and update the key in the scene data
        for(var i in scene.keys) {
            let key = scene.keys[i];
            if(_.isEqual(key.position, newKey.position)) {
                scene.keys[i] = newKey;
                keyFound = true;
                break;
            }
        }

        if(!keyFound) {
            scene.keys.push(newKey);
        }

        this.setState({ currentScene: scene });
    }

    //// UTILITY METHODS ////

    loadSceneData(newScene)
    {
        // Query new scene details from the API
        this.api.scenes.scene(newScene).get(this.onSceneReceived.bind(this));
    }

    getScriptNames()
    {
        let scriptNames = [];

        for(var i in this.state.scripts) {
            scriptNames.push(i);
        }

        return scriptNames;
    }

    //// COMPONENT LIFECYCLE METHODS ////

    componentDidMount()
    {
        // Get the current scene to initialize the live view
        this.api.scenes.current.get(this.onCurrentSceneReceive.bind(this));
        this.api.scripts.get(this.onScriptsReceive.bind(this));
    }

    //// RENDER ////

    render()
    {
        return (
            <div className="app container-fluid mt-4">
                <div className="row">
                    <div className="col-md-6  col-xs-12 text-center">
                        <DeviceManager
                            api={this.api}
                            scene={this.state.currentScene}
                            selectedKey={this.state.currentKey}
                            onSelectKey={this.onCurrentKeyChanged.bind(this)} />
                    </div>
                    <div className="col-md-6 col-xs-12">
                        <SystemOperations
                            api={this.api}
                            scripts={this.state.scripts}
                            onScriptsUpdate={this.onScriptsReceive.bind(this, null)}
                        />
                        
                        <SceneManager
                            api={this.api}
                            eventListener={this.eventListener}
                            onSceneViewChange={this.onSceneViewChange.bind(this)}
                        />
                        
                        <KeyProperties
                            api={this.api}
                            scripts={this.getScriptNames()}
                            sceneId={this.state.currentScene.id}
                            currentKey={this.state.currentKey}
                            onKeyUpdated={this.onKeyUpdated.bind(this)}
                        />
                        <div className="footer">
                            Icons made by <a href="https://www.flaticon.com/authors/flat-icons" title="Flat Icons">Flat Icons</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a>
                        </div>
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
    