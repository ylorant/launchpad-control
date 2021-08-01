import React from 'react';
import { Button } from 'react-bootstrap';
import Key from './Key';

class VirtualDevice extends React.Component
{
    static TYPE = "virtual-device";

    constructor(props)
    {
        super(props);

        this.state = {
            scene: this.props.scene,
            keys: [],
        };
    }

    refreshKeys()
    {
        this.props.api.virtualdevice[this.props.device.id].buttons.get(this.onKeysReceived.bind(this));
    }
    
    getKey(id)
    {
        if(this.props.scene === null) {
            return null;
        }

        for(var i in this.props.scene.keys) {
            let key = this.props.scene.keys[i];

            if(key.device === this.props.device.id && key.position.id === id) {
                return key;
            }
        }

        return null;
    }

    isKeySelected(id)
    {
        return this.props.selectedKey && this.props.selectedKey.props.position.id === id;
    }

    //// EVENTS ////

    onKeysReceived(err, data, handlers)
    {
        this.setState({ keys: data });
    }

    onKeyClick(key)
    {
        let newSelectedKey = key;
        if(this.props.selectedKey !== null && this.props.selectedKey.props.position.id === newSelectedKey.props.position.id) {
            newSelectedKey = null;
        }

        if(this.props.onSelectKey) {
            this.props.onSelectKey(newSelectedKey);
        }

        this.setState({
            selectedKey: newSelectedKey
        });
    }

    onAddKey()
    {
        this.props.api.virtualdevice[this.props.device.id].buttons.post({}, this.onKeyAdded.bind(this));
    }

    onKeyAdded(key)
    {
        this.refreshKeys();
    }

    //// COMPONENT LIFECYCLE METHODS ////

    componentDidMount()
    {
        this.refreshKeys();
    }

    static getDerivedStateFromProps(props, state)
    {
        let out = {
            scene: props.scene,
            selectedKey: props.selectedKey || null
        };

        // Reset the selected key on scene change
        if(props.scene.id !== state.scene.id) {
            if(props.onSelectKey) {
                props.onSelectKey(null);
            }
            
            out.selectedKey = null;
        } else if(props.selectedKey) {
            out.selectedKey = props.selectedKey;
        }

        return out;
    }

    render()
    {
        let keyComponents = [];

        for(let i in this.state.keys) {
            keyComponents.push(
                <div className="col-xl-3 col-12 col-sm-6 my-2" key={this.state.keys[i].position.id}>
                    <Key
                        device={this.props.device}
                        keyObject={this.getKey(this.state.keys[i].position.id)}
                        position={this.state.keys[i].position}
                        selected={this.isKeySelected(this.state.keys[i].position.id)}
                        onClick={this.onKeyClick.bind(this)} />
                </div>
            );
        }

        return (
            <div className="virtual-device">
                <div className={"row " + (this.state.keys.length > 0 && !this.props.viewMode ? "mb-4" : "")}>
                    {keyComponents}
                </div>
                {!this.props.viewMode && 
                    <Button 
                        variant="outline-primary" 
                        type="button"
                        size="lg"
                        onClick={this.onAddKey.bind(this)}
                        block>
                        Add key
                    </Button>
                }
            </div>
        );
    }
}

export default VirtualDevice;