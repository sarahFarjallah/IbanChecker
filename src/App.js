import './App.css';
import React, { Component } from 'react';
import IbanChecker from './IbanChecker';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };

    }

  
    render() {
      
        return(
            <div>
              <IbanChecker/>
            </div>
        );

    }

}

export default App;
