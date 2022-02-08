import React from "react";
import { Button, Modal } from "react-bootstrap";
import _ from "underscore";

class ModuleManager extends React.Component
{
    constructor(props)
    {
        super(props);

        this.state = {
            managerOpen: false,
            availableModules: [],
            loadedModules: [],
            configModel: {},
            settings: {}
        };
    }

    reloadData()
    {
        this.props.api.modules.available.get(this.onDataReceive.bind(this, 'availableModules'));
        this.props.api.modules.loaded.get(this.onDataReceive.bind(this, 'loadedModules'));
        this.props.api.modules.configmodel.get(this.onDataReceive.bind(this, 'configModel'));
        this.props.api.modules.settings.get(this.onDataReceive.bind(this, 'settings'));
    }

    //// EVENTS ////

    onDataReceive(property, err, data, handlers)
    {
        if(data !== null) {
            let stateUpdate = {};
            stateUpdate[property] = data;

            this.setState(stateUpdate);
        }
    }

    onToggleModule(ev)
    {
        let newModules = this.state.loadedModules;

        if(newModules.includes(ev.target.name)) {
            newModules = newModules.filter((el) => (el != ev.target.name));
        } else {
            newModules.push(ev.target.name);
        }

        this.setState({
            loadedModules: newModules
        });
    }

    onSaveSettings()
    {
        this.props.api.modules.loaded.put({ modules: this.state.loadedModules }, () => {
            this.props.api.modules.settings.put({ settings: this.state.settings }, () => {
                this.reloadData();
                this.setState({ managerOpen: false });
            });
        });
    }

    onCancelSettings()
    {
        this.reloadData();
        this.setState({ managerOpen: false });
    }

    onUpdateSetting(ev)
    {
        let module, field;
        let settings = this.state.settings;
        [module, field] = ev.target.name.split('.');

        settings[module][field] = ev.target.value;

        this.setState({ settings: settings });
    }

    //// COMPONENT LIFECYCLE METHODS ////

    componentDidMount()
    {
        this.reloadData();
    }

    //// RENDER ////

    renderModuleConfiguration(module)
    {
        if(_.isEmpty(this.state.configModel[module])) {
            return null;
        }

        let fields = [];
        let moduleSettings = this.state.settings[module] ?? [];

        for(let fieldName in this.state.configModel[module]) {
            let config = this.state.configModel[module][fieldName];
            let settingValue = moduleSettings[fieldName] ?? null;
            let elementId = module + "-" + fieldName;

            switch(config.type) {
                case "string":
                    fields.push(
                        <div className="form-group" key={elementId}>
                            <label htmlFor={elementId}>{config.label}:</label>
                            <input 
                                className="form-control" 
                                type="text"
                                id={elementId} 
                                name={module + "." + fieldName} 
                                value={settingValue}
                                onChange={this.onUpdateSetting.bind(this)} />
                        </div>
                    );
                    break;
            }            
        }

        return (
            <fieldset key={module}>
                <legend>Module: {module}</legend>
                {fields}
            </fieldset>
        );
    }

    render()
    {
        let moduleCheckboxes = [];
        let modulesConfiguration = [];

        for(let i of this.state.availableModules) {
            moduleCheckboxes.push(
                <div className="col-2" key={i}>
                    <div className="form-check">
                        <input 
                            id={"toggle-module-" + i} 
                            type="checkbox" 
                            name={i}
                            checked={this.state.loadedModules.includes(i)}
                            onChange={this.onToggleModule.bind(this)} />
                        <label className="form-check-label ml-2" htmlFor={"toggle-module-" + i}>
                            {i}
                        </label>
                    </div>
                </div>
            );
        }

        for(let i of this.state.loadedModules) {
            modulesConfiguration.push(this.renderModuleConfiguration(i));
        }

        return (
            <div className="d-inline">
                <Button 
                    className="mt-2"
                    variant="outline-primary"
                    onClick={() => this.setState({managerOpen: true})}>
                    Modules configuration
                </Button>

                {/* Modules configuration modal */}
                <Modal
                    show={this.state.managerOpen}
                    backdrop="static"
                    keyboard={false}
                    size="lg"
                    onHide={this.onCancelSettings.bind(this)}
                    centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Modules configuration</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <fieldset>
                            <legend>Available modules</legend>
                            <div className="row">
                                {moduleCheckboxes}
                            </div>
                        </fieldset>

                        {modulesConfiguration}
                    </Modal.Body>

                    <Modal.Footer>
                        <Button 
                            variant="outline-secondary"
                            onClick={this.onCancelSettings.bind(this)}>
                            Cancel
                        </Button>

                        <Button 
                            variant="outline-primary"
                            onClick={this.onSaveSettings.bind(this)}>
                            Save
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}

export default ModuleManager;