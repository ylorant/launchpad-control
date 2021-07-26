import React from 'react';
import queryString from "query-string";
import ViewApp from './ViewApp';
import EditApp from './EditApp';

class App extends React.Component 
{

    constructor(props)
    {
        super(props);
        
        let parsedQuery = queryString.parse(window.location.search);
        let appMode = typeof parsedQuery.view != "undefined" ? "view" : "edit";
        let forcedDevice = parsedQuery.device ?? null;

        this.state = {
            mode: appMode,
            device: forcedDevice
        };
    }
    
    render()
    {
        switch(this.state.mode) {
            case "view":
                return <ViewApp device={this.state.device} />;
            case "edit":
            default:
                return <EditApp />;
        }
    }
}

export default App;