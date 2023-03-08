import React from "react";
import RouteMap from "./RouteMap.js";
import RouteDirections from "./RouteDirections.js";
import Profile from "./Profile.js";
import { withAuth0 } from "@auth0/auth0-react";
import { GrRefresh } from 'react-icons/gr';
import { BsFillTrashFill, BsEyeFill } from 'react-icons/bs';
import { ImArrowRight } from 'react-icons/im';
import './SavedBars.css';
import axios from 'axios';

class SavedBars extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      savedRoutes: [],
      selectedRoute: {},
      loadingBars: false
    }
  }

  getBars = () => {
    if (this.props.auth0.isAuthenticated) {
      this.props.auth0.getIdTokenClaims().then(res => {
        // Token
        this.setState({ loadingBars: true });
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${res.jwt}`
        }

        axios.get(`https://brew-crew-backend.onrender.com/dbResults?email=${res.email}`, {
          headers: headers
        })
          .then(res => {
            this.setState({ savedRoutes: res.data });
          })
          .catch(error => console.error(error))
          .finally(() => this.setState({ loadingBars: false }));
      });
    }
  }

  refreshRoutes = (id) => {
    const selectedRoute = this.state.savedRoutes.filter(savedRoute => savedRoute._id === id)[0];

    this.setState({ selectedRoute: selectedRoute });
  }

  handleDeleteBars = (id) => {

    if (this.props.auth0.isAuthenticated) {
      this.props.auth0.getIdTokenClaims().then(res => {

        // Token
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${res.jwt}`
        }

        axios.delete(`https://brew-crew-backend.onrender.com/dbResults/${id}`, {}, {
          headers: headers
        })
          .then(res => {
            //this.getBars();


            const newList = this.state.savedRoutes.filter(route => route._id !== id);

            this.setState({ savedRoutes: newList })

            // if deleted bar id === selectedRoute id
            if (id === this.state.selectedRoute?._id) {
              // set selected route to first saved route.
              const newId = this.state.savedRoutes.find(route => route._id !== id)._id;
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

  componentDidMount() {
    this.getBars();
  }

  render() {
    const list = this.state.savedRoutes.map(route => (
      <li key={ route._id }>

        <div>
          <div>

            <div className="barResultContainer">
              <div className="barImgResultContainer">
                <img src={ route.yelpData[0].image } alt={ route.yelpData[0].name } />
              </div>
              <RouteMap directions={ route.directions } />

              <div className="barButtonResultContainer">
                <button onClick={ () => this.handleSelectedRouteClick(route._id) }><BsEyeFill /> View Route </button>
                <button className='delete' onClick={ () => this.handleDeleteBars(route._id) }><BsFillTrashFill /> Delete </button>
              </div>
            </div>

            <div>
              <div><b>{ route.directions[0].startName }</b> <ImArrowRight /> <b>{ route.directions[route.directions.length - 1].endName }</b></div>
            </div>

          </div>

        </div>
      </li>
    ));

    return (
      <>
        <h2>Saved Bars</h2>
        <div id='savedBarsContainer'>

          <div id='savedResultsList' className={ !this.state.savedRoutes.length ? 'refresh' : '' }>
            <ul className={ !this.state.savedRoutes.length ? 'refresh' : '' }>
              { list.length ? list :
                this.state.loadingBars ?
                  <>Loading routes from database...</>
                  : <li id="refreshRouteList" onClick={ this.getBars }><GrRefresh /> Click to refresh.
                  </li>
              }
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
                <RouteMap directions={ this.state?.selectedRoute?.directions } />
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
