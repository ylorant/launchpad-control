import React from "react";
import { Button, Modal } from "react-bootstrap";
import _ from "underscore";
import VirtualDevice from "./VirtualDevice/VirtualDevice";
import Launchpad from "./Launchpad/Launchpad";
import NanoKontrol from "./NanoKontrol/NanoKontrol";
import XTouchOne from "./XTouchOne/XTouchOne";

class DeviceManager extends React.Component
{
    constructor(props)
    {
        super(props);

        this.state = {
            devices: [],
            deviceTypes: [],
            currentDevice: null,
            devicePropertiesPopupOpen: false,
            deleteDeviceConfirmPopupOpen: false,
            newDeviceId: null,
            newDeviceType: null,
            newDeviceSettings: null,
        };
    }
    
    refreshDevices()
    {
        this.props.api.devices.get(this.onDeviceListReceive.bind(this));
        this.props.api.devices.types.get(this.onDeviceTypeListReceive.bind(this));
    }

    //// EVENTS ////

    onDeviceListReceive(err, data, handlers)
    {
        let newState = {
            devices: data
        };

        if(this.props.forceDevice) {
            newState.currentDevice = this.props.forceDevice;
        }
        else if(this.state.currentDevice === null && !_.isEmpty(data)) {
            newState.currentDevice = _.first(data).id;
        }

        this.setState(newState);
    }

    onDeviceTypeListReceive(err, data, handlers)
    {
        this.setState({ deviceTypes: data });
    }

    onCurrentDeviceChange(ev)
    {
        let newCurrentDevice = ev.target.value;

        this.setState({
            currentDevice: newCurrentDevice
        });
    }

    onConfirmDeleteDevice(ev)
    {
        this.props.api.devices.device[this.currentDevice].delete(this.onDeviceDeleted.bind(this));
    }

    onConfirmCreateDevice(ev)
    {
        let deviceData = {
            id: this.state.newDeviceId,
            type: this.state.newDeviceType
        };

        this.props.api.devices.post(deviceData, this.onDeviceCreated.bind(this));
    }

    onDeviceCreated(err, data, handlers)
    {
        this.setState({
            newDeviceId: null,
            newDeviceType: null,
            newDevicePopupOpen: false
        })

        this.refreshDevices();
    }

    onDeviceDeleted(err, data, handlers)
    {
        this.setState({ deleteSceneConfirmPopupOpen: false });
    }

    //// LIFECYCLE FUNCTIONS ////

    componentDidMount()
    {
        this.refreshDevices();
    }

    //// RENDER ////

    getDeviceComponent(deviceId)
    {
        for(var i in this.state.devices) {
            if(this.state.devices[i].id === deviceId) {
                switch(this.state.devices[i].type) {
                    case Launchpad.TYPE:
                        return (
                            <Launchpad
                                device={this.state.devices[i]}
                                selectedKey={this.props.selectedKey}
                                onSelectKey={this.props.onSelectKey}
                                viewMode={this.props.viewMode}
                                scene={this.props.scene} />
                        );

                    case NanoKontrol.TYPE:
                        return (
                            <NanoKontrol
                                device={this.state.devices[i]}
                                selectedKey={this.props.selectedKey}
                                onSelectKey={this.props.onSelectKey}
                                viewMode={this.props.viewMode}
                                scene={this.props.scene} />
                            );
                    
                    case VirtualDevice.TYPE:
                        return (
                            <VirtualDevice
                                device={this.state.devices[i]}
                                api={this.props.api}
                                selectedKey={this.props.selectedKey}
                                onSelectKey={this.props.onSelectKey}
                                viewMode={this.props.viewMode}
                                scene={this.props.scene} />
                        );
                    
                    case XTouchOne.TYPE:
                        return (
                            <XTouchOne
                                device={this.state.devices[i]}
                                selectedKey={this.props.selectedKey}
                                onSelectKey={this.props.onSelectKey}
                                viewMode={this.props.viewMode}
                                scene={this.props.scene} />
                        );

                    default:
                        return null;
                }
            }
        }

        return null;
    }

    render()
    {
        let deviceOptions = [];
        let deviceTypeOptions = [];

        for(let i in this.state.devices) {
            deviceOptions.push(
                <option 
                    value={this.state.devices[i].id}
                    key={this.state.devices[i].id}>
                    {this.state.devices[i].id + " (" + this.state.devices[i].typeName + ")"}
                </option>
            );
        }

        let deviceComponent = this.getDeviceComponent(this.state.currentDevice);

        deviceTypeOptions.push(
            <option value="" key="">-- Select a type --</option>
        );

        for(let i in this.state.deviceTypes) {
            deviceTypeOptions.push(
                <option
                    value={i}
                    key={i}>
                    {this.state.deviceTypes[i]}
                </option>
            )
        }

        return (
            <div>
                {(!this.props.viewMode || !this.props.forceDevice) &&
                    <fieldset>
                        <legend>
                            Device
                        
                            {!this.props.viewMode &&
                                <div className="float-right">
                                    <a href="/?view" target="_blank"rel="noopener noreferrer">[Show viewer]</a>
                                    <a href={"/?view&device=" + this.state.currentDevice} target="_blank" rel="noopener noreferrer">[Show device viewer]</a>
                                </div>
                            }
                        </legend>

                        <div className="row">
                            <div className={(this.props.viewMode ? "col-12" : "col-9") + " form-group"}>
                                <div className="input-group">
                                    <select
                                        onChange={this.onCurrentDeviceChange.bind(this)}
                                        className="form-control custom-select">
                                        {deviceOptions}
                                    </select>
                                    {!this.props.viewMode &&
                                        <div className="input-group-append">    
                                            <Button 
                                                variant="btn btn-outline-primary" 
                                                disabled={this.state.currentScene === null}
                                                onClick={() => this.setState({ devicePropertiesPopupOpen: true })}>
                                                Edit
                                            </Button>
                                            <Button 
                                                variant="btn btn-outline-danger"
                                                disabled={this.state.currentScene === null}
                                                onClick={() => this.setState({ deleteDeviceConfirmPopupOpen: true })}>
                                                Delete
                                            </Button>
                                        </div>
                                    }
                                </div>
                            </div>
                            {!this.props.viewMode && 
                                <div className="col-3 text-center">
                                    <Button 
                                        variant="outline-success"
                                        onClick={() => this.setState({ newDevicePopupOpen: true})}>
                                        New device
                                    </Button>
                                </div>
                            }
                        </div>
                    </fieldset>
                }
                
                {deviceComponent}

                {/* Delete device modal */}
                <Modal
                    show={this.state.deleteDeviceConfirmPopupOpen}
                    onHide={() => this.setState({ deleteDeviceConfirmPopupOpen: false })}
                    backdrop="static"
                    keyboard={false}
                    centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Delete device</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Do you really want to delete this device ? This cannot be undone.
                    </Modal.Body>
                    <Modal.Footer>
                        <Button 
                            variant="outline-secondary" 
                            onClick={() => this.setState({ deleteDeviceConfirmPopupOpen: false })}>
                            Cancel
                        </Button>
                        <Button 
                            variant="outline-danger"
                            onClick={this.onConfirmDeleteDevice.bind(this)}>
                            Delete
                        </Button>
                    </Modal.Footer>
                </Modal>

                {/* Create device modal */}
                <Modal
                    show={this.state.newDevicePopupOpen}
                    onHide={() => this.setState({ newDevicePopupOpen: false })}
                    backdrop="static"
                    keyboard={false}
                    centered>
                    <Modal.Header closeButton>
                        <Modal.Title>New device</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="form-group">
                            <label>ID:</label>
                            <input 
                                className="form-control" 
                                type="text"
                                value={this.state.newDeviceId ?? ""}
                                onChange={(ev) => this.setState({ newDeviceId: ev.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Type:</label>
                            <select 
                                className="form-control custom-select"
                                value={this.state.newDeviceType ?? ""}
                                onChange={(ev) => this.setState({ newDeviceType: ev.target.value })}>
                                {deviceTypeOptions}
                            </select>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button 
                            variant="outline-secondary" 
                            onClick={() => this.setState({ newDevicePopupOpen: false })}>
                            Cancel
                        </Button>
                        <Button
                            variant="outline-success"
                            onClick={this.onConfirmCreateDevice.bind(this)}>
                            Create
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}

export default DeviceManager;