import React from "react";
import RouteMap from "./RouteMap.js";
import RouteDirections from "./RouteDirections.js";
import Profile from "./Profile.js";
import { withAuth0 } from "@auth0/auth0-react";
import { GrRefresh } from 'react-icons/gr';
import { BsFillTrashFill, BsEyeFill } from 'react-icons/bs';
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

        axios.get(`https://brew-crew-backend.onrender.com/dbResults?email=${res.email}`, {
          headers: headers
        })
          .then(res => {
            this.setState({ savedRoutes: res.data });
          })
          .catch(error => console.error(error));
      });
    }
  }

  refreshRoutes = (id) => {
    const selectedRoute = this.state.savedRoutes.filter(savedRoute => savedRoute._id === id)[0];

    this.setState({ selectedRoute: selectedRoute });
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

        axios.delete(`https://brew-crew-backend.onrender.com/dbResults/${id}`, {}, {
          headers: headers
        })
          .then(res => {
            this.getBars();

            // if deleted bar id === selectedRoute id
            if (id === this.state.selectedRoute._id) {
              // set selected route to first saved route.
              const newId = this.state.savedRoutes[0]._id
              this.refreshRoutes(newId);
            }
          })
          .catch(error => console.error(error));
      });
    }
  }

  handleSelectedRouteClick = (id) => {
    this.refreshRoutes(id);
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
          <button onClick={ () => this.handleSelectedRouteClick(route._id) }><BsEyeFill /> View Route </button>

          <button onClick={ () => this.handleDeleteBars(route._id) }><BsFillTrashFill /> Delete </button>
        </div>
      </li>
    ));

    return (
      <>
        <h2>Saved Bars</h2>
        <div id='savedBarsContainer'>

          <div id='savedResultsList'>
            <ul>
              { list.length ? list : <li id="refreshRouteList" onClick={ this.getBars }><GrRefresh /> Click to refresh list of saved routes.</li> }
            </ul>
          </div>
          <div id='savedResultsDirections'>
            { !this.state.selectedRoute?._id || !this.state.savedRoutes.length ?
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
