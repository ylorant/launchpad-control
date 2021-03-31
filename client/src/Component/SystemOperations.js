import React from "react";
import { Button } from "react-bootstrap";
import ScriptEditor from "./ScriptEditor";

class SystemOperations extends React.Component
{
    constructor(props)
    {
        super(props);

        this.state = {
            configPath: "",
            hooks: {
                setup: null,
                teardown: null
            }
        };
    }

    //// EVENTS ////

    onConfigPathReceive(err, data, handlers)
    {
        this.setState({ configPath: data });
    }

    // onScriptChange(type, newScript)
    // {
    //     let scripts = this.state.scripts;

    //     scripts[type] = newScript;

    //     this.setState({ scripts: scripts });
    //     this.props.api.scenes.scripts[type].put({ script: newScript }, () => {});
    // }

    onSaveScript(name, newScript)
    {
        this.props.api.scripts.script[name].put({ script: newScript }, () => {});

        if(this.props.onScriptsUpdate) {
            let scripts = this.props.scripts;
            scripts[name] = newScript;

            this.props.onScriptsUpdate(scripts);
        }
    }

    onHookChange(type, ev)
    {
        let newHooks = this.state.hooks;
        newHooks[type] = ev.target.value;

        this.setState({ hooks: newHooks });
        this.props.api.scripts.hooks[type].put({ script: ev.target.value }, () => {});
    }

    onHooksReceive(err, data, handlers)
    {
        this.setState({ hooks: data });
    }

    onSaveConfig()
    {
        this.props.api.system['save-config'].post({ path: this.state.configPath }, () => {});
    }

    onLoadConfig()
    {
        this.props.api.system['load-config'].post({ path: this.state.configPath }, () => {});
    }

    onReconnect()
    {
        this.props.api.system.reconnect.post({}, () => {});
    }

    //// COMPONENT LIFECYCLE ////

    componentDidMount()
    {
        this.props.api.system['config-path'].get(this.onConfigPathReceive.bind(this));
        this.props.api.scripts.hooks.get(this.onHooksReceive.bind(this));
    }

    //// UTILITY METHODS ////

    getScriptNames()
    {
        let scriptNames = [];

        for(var i in this.props.scripts) {
            scriptNames.push(i);
        }

        return scriptNames;
    }

    //// RENDER ////

    render()
    {
        let hooksOptions = [];
        let scriptNames = this.getScriptNames();

        hooksOptions.push(
            <option
                key=""
                value="">
                    -- None --
                </option>
        )

        for(var i in scriptNames) {
            hooksOptions.push(
                <option
                    key={scriptNames[i]}
                    value={scriptNames[i]}>
                    {scriptNames[i]}
                </option>
            );
        }

        return (
            <fieldset>
                <legend>System</legend>
                <div className="row-container">
                    <div className="row align-items-end">
                        <div className="col-6 form-group">
                            <label>Quick actions:</label><br />
                            <Button
                                variant="outline-primary"
                                onClick={this.onReconnect.bind(this)}
                                className="mr-3">
                                Reconnect
                            </Button>
                            <ScriptEditor
                                onSave={this.onSaveScript.bind(this)}
                                scripts={this.props.scripts} />
                        </div>
                        <div className="col-6 form-group">
                            <label>Configuration: </label>
                            <div className="input-group">
                                <input 
                                    className="form-control" 
                                    name="config-file" 
                                    placeholder="Configuration path..."
                                    value={this.state.configPath}
                                    onChange={(ev) => this.setState({  configPath: ev.target.value  })} />
                                <div className="input-group-append">
                                    <Button 
                                        variant="outline-primary"
                                        onClick={this.onLoadConfig.bind(this)}>
                                        Load
                                    </Button>
                                    <Button
                                        variant="outline-success"
                                        onClick={this.onSaveConfig.bind(this)}>
                                        Save
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-6 form-group">
                            <label>Setup script:</label>
                            <select
                                onChange={this.onHookChange.bind(this, "setup")}
                                value={this.state.hooks.setup || ""}
                                className="form-control custom-select">
                                {hooksOptions}
                            </select>
                        </div>

                        <div className="col-6 form-group">
                            <label>Teardown script:</label>
                            <select
                                onChange={this.onHookChange.bind(this, "teardown")}
                                value={this.state.hooks.teardown || ""}
                                className="form-control custom-select">
                                {hooksOptions}
                            </select>
                        </div>
                    </div>
                </div>
            </fieldset>
        );
    }
}

export default SystemOperations;