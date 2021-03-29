import React from "react";
import _ from "underscore";
import Launchpad from "./Launchpad/Launchpad";
import NanoKontrol from "./NanoKontrol/NanoKontrol";

class DeviceManager extends React.Component
{
    constructor(props)
    {
        super(props);

        this.state = {
            devices: [],
            currentDevice: null
        };
    }

    //// EVENTS ////

    onDeviceListReceive(err, data, handlers)
    {
        let newState = {
            devices: data
        };

        if(this.state.currentDevice === null) {
            newState.currentDevice = _.first(data).id;
        }

        this.setState(newState);
    }

    onCurrentDeviceChange(ev)
    {
        let newCurrentDevice = ev.target.value;

        this.setState({
            currentDevice: newCurrentDevice
        });
    }

    //// LIFECYCLE FUNCTIONS ////

    componentDidMount()
    {
        this.props.api.devices.get(this.onDeviceListReceive.bind(this));
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
                                scene={this.props.scene} />
                        );

                    case NanoKontrol.TYPE:
                        return (
                            <NanoKontrol
                                device={this.state.devices[i]}
                                selectedKey={this.props.selectedKey}
                                onSelectKey={this.props.onSelectKey}
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

        for(var i in this.state.devices) {
            deviceOptions.push(
                <option 
                    value={this.state.devices[i].id}
                    key={this.state.devices[i].id}>
                    {this.state.devices[i].id + " (" + this.state.devices[i].typeName + ")"}
                </option>
            );
        }

        let deviceComponent = this.getDeviceComponent(this.state.currentDevice);

        return (
            <div>
                <fieldset>
                    <legend>Device</legend>
                    <div className="form-group">
                        <select
                            onChange={this.onCurrentDeviceChange.bind(this)}
                            className="form-control custom-select">
                            {deviceOptions}
                        </select>
                    </div>
                </fieldset>
                
                {deviceComponent}
            </div>
        );
    }
}

export default DeviceManager;