import React from 'react';
import Key from "./Key";

class Launchpad extends React.Component
{
    static TYPE = "launchpad";

    constructor(props)
    {
        super(props);

        this.state = {
            selectedKey: null,
            scene: this.props.scene
        };
    }

    onSelectKey(key)
    {
        let newSelectedKey = key;
        if(this.state.selectedKey !== null && this.state.selectedKey.props.x === key.props.x && this.state.selectedKey.props.y === key.props.y) {
            newSelectedKey = null;
        }

        if(this.props.onSelectKey) {
            this.props.onSelectKey(newSelectedKey);
        }

        this.setState({
            selectedKey: newSelectedKey
        });
    }

    getKey(x, y)
    {
        if(this.state.scene === null) {
            return null;
        }

        for(var i in this.state.scene.keys) {
            let key = this.state.scene.keys[i];
            let keyY = key.position.y === 8 ? 0 : key.position.y + 1;

            if(key.device === this.props.device.id && key.position.x === x && keyY === y) {
                return key;
            }
        }

        return null;
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
        let rows = [];

        // Generating rows
        for(let j = 0; j <= 8; j++) {
            let row = [];

            for(let i = 0; i <= 8; i++) {
                // Skipping the top right button as it doesn't exist
                if(i === 8 && j === 0) {
                    continue;
                }

                let type = i === 8 || j === 0 ? "round" : "square";
                let selected = false;
                let keyY = j === 0 ? 8 : j - 1; // Converting from visual representation to actual position

                if(this.state.selectedKey
                && this.state.selectedKey.props.x === i 
                && this.state.selectedKey.props.y === keyY) {
                    selected = true;
                }

                let key = this.getKey(i, j);
                let keyPosition = {
                    x: i, 
                    y: keyY
                };

                row.push(<Key 
                    key={i}
                    device={this.props.device}
                    position={keyPosition}
                    x={i} 
                    y={keyY} 
                    type={type}
                    selected={selected}
                    keyObject={key}
                    onClick={this.onSelectKey.bind(this)}
                />);
            }

            rows.push(
                <div key={j + 1} className="lp-row">
                    {row}
                </div>
            );
        }


        return (
            <div className="launchpad mb-4">
                {rows}
            </div>
        );
    }
}

export default Launchpad;