import React from "react";
import BeerMap from './components/BeerMap.js'
import './App.css';

class App extends React.Component {
  render(){
    return (
      <div className="App">
        <BeerMap />
      </div>
    );
    }
}

export default App;
