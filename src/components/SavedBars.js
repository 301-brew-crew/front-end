import React from "react";
import RouteMap from "./RouteMap.js";
import RouteDirections from "./RouteDirections.js";
import Profile from "./Profile.js";
import { withAuth0 } from "@auth0/auth0-react";
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
    // Token
    if (this.props.auth0.isAuthenticated) {
      this.props.auth0.getIdTokenClaims().then(res => {
        const jwt = res.__raw;
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        }

        axios.get(`http://localhost:3001/dbResults?email=${res.email}`, {
          headers: headers
        })
          .then(res => {
            this.setState({ savedRoutes: res.data });
          })
          .catch(error => console.error(error));
      });
    }
  }

  handleDeleteBars = (id) => {
    // Token
    if (this.props.auth0.isAuthenticated) {
      this.props.auth0.getIdTokenClaims().then(res => {
        const jwt = res.__raw;
        console.log("token: ", jwt);

        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        }

        axios.delete(`http://localhost:3001/dbResults/${id}`, {}, {
          headers: headers
        })
          .then(res => {
            this.getBars();
          })
          .catch(error => console.error(error));
      });
    }
  }

  handleSelectedRouteClick = (id) => {
    const selectedRoute = this.state.savedRoutes.filter(savedRoute => savedRoute._id === id)[0];

    this.setState({ selectedRoute: selectedRoute });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState === this.state) return;
    this.getBars();

    if (prevState.selectedRoute.directions === this.state.selectedRoute.directions) return;
  }

  componentDidMount() {
    this.getBars();
  }

  render() {
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

          <div id='savedResultsList'>
            <ul>
              { list.length ? list : <li id="refreshRouteList" onClick={ this.getBars }>Click to refresh list of saved routes.</li> }
            </ul>
          </div>
          <div id='savedResultsDirections'>
            { !this.state.selectedRoute?._id ?
              <>
                <Profile />
                You are currently logged in.  Please click a route to view the directions.
              </>
              :
              <>
                <RouteMap directions={ this.state.selectedRoute.directions } />
                <RouteDirections directions={ this.state?.selectedRoute?.directions } yelpData={ this.state?.selectedRoute?.yelpData } />
              </>
            }
          </div>
        </div>
      </>
    );
  }
}

export default withAuth0(SavedBars);
