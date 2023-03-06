import React from "react";
import './SavedBars.css';
import axios from 'axios';

class SavedBars extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      savedRoutes: [],
      selectedRoute: {}
    }
  }

  getBars = () => {
    axios.get('http://localhost:3001/dbResults')
      .then(res => {
        this.setState({ savedRoutes: res.data });
      })
      .catch(error => console.error(error));
  }

  handleDeleteBars = (id) => {
    axios.delete(`http://localhost:3001/dbResults/${id}`)
      .then(res => {
        this.getBars();
      })
      .catch(error => console.error(error));
  }

  handleSelectedRouteClick = (id) => {
    const selectedRoute = this.state.savedRoutes.filter(savedRoute => savedRoute._id === id)[0];

    this.setState({ selectedRoute: selectedRoute });
  }

  componentDidMount() {
    this.getBars();
  }

  render() {
    console.log(this.state.savedRoutes);
    console.log(this.state.selectedRoute);

    const list = this.state.savedRoutes.map(route => (
      <li key={ route._id }>
        <div>
          <div>{ `${route.directions[0].startName} to ${route.directions[route.directions.length - 1].endName}` }</div>
        </div>
        <div>
          <button onClick={ () => this.handleSelectedRouteClick(route._id) }> View Route </button>
          
          <button onClick={ () => this.handleDeleteBars(route._id) }> Delete </button>
        </div>
      </li>
    ));



    return (
      <>
        <h2>Saved Bars</h2>
        <div id='savedBarsContainer'>

          <div>
            <ul>
              { list }
            </ul>
          </div>

          <div>
            { this.state.selectedRoute?._id ?? 'Click a route.'}
          </div>
        </div>
      </>
    );
  }
}

export default SavedBars;
