import React from "react";
import CodeEditor from "./CodeEditor";

class SystemOperations extends React.Component
{
    constructor(props)
    {
        super(props);

        this.state = {
            configPath: "",
            scripts: {
                setup: null,
                teardown: null
            }
        };
    }

    componentDidMount()
    {
        this.props.api.system['config-path'].get(this.onConfigPathReceive.bind(this));
        this.props.api.scenes.scripts.get(this.onScriptsReceive.bind(this));
    }

    onConfigPathReceive(err, data, handlers)
    {
        this.setState({ configPath: data });
    }

    onScriptsReceive(err, data, handlers)
    {
        this.setState({ scripts: data });
    }

    onScriptChange(type, newScript)
    {
        let scripts = this.state.scripts;

        scripts[type] = newScript;

        this.setState({ scripts: scripts });
        this.props.api.scenes.scripts[type].put({ script: newScript }, () => {});
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

    render()
    {
        return (
            <div>
                <div className="row">
                    <div className="col-2 form-group">
                        <button
                            onClick={this.onReconnect.bind(this)}
                            className="btn btn-primary mr-3">
                            Reconnect
                        </button>
                    </div>
                    <div className="col-10 form-inline justify-content-center">
                        <label className="mr-2">Configuration : </label>
                        <div className="input-group">
                            <input 
                                className="form-control" 
                                name="config-file" 
                                placeholder="Configuration path..."
                                value={this.state.configPath}
                                onChange={(ev) => this.setState({  configPath: ev.target.value  })} />
                            <div className="input-group-append">
                                <button 
                                    onClick={this.onLoadConfig.bind(this)}
                                    className="btn btn-primary">
                                    Load
                                </button>
                                <button
                                    onClick={this.onSaveConfig.bind(this)}
                                    className="btn btn-success">
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-6 form-group">
                        <label>Setup script :</label>
                        <CodeEditor
                            key={this.state.scripts.setup}
                            code={this.state.scripts.setup}
                            onChange={this.onScriptChange.bind(this, "setup")} />
                    </div>

                    <div className="col-6 form-group">
                        <label>Teardown script :</label>
                        <CodeEditor
                            key={this.state.scripts.teardown}
                            code={this.state.scripts.teardown}
                            onChange={this.onScriptChange.bind(this, "teardown")} />
                    </div>
                </div>
            </div>
        );
    }
}

export default SystemOperations;