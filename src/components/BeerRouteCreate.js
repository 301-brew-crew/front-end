import React from 'react';
import axios from 'axios';
import { withAuth0 } from "@auth0/auth0-react";
import { NavLink } from "react-router-dom";
import RouteDirections from "./RouteDirections.js";
import RouteMap from "./RouteMap.js";
import missingBarImg from '../images/missing-bar.jpg';
import demoGif from '../images/demo.gif';
import { GiCartwheel, GiBeerBottle, GiBrokenBottle } from 'react-icons/gi';
import './BeerRouteCreate.css';

class BeerRouteCreate extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      welcomeMessage: true,
      baseLocation: '',
      yelpData: [],
      directions: []
    }
  }

  getYelpData = () => {
    axios.get(`http://localhost:3001/yelp/${this.state.baseLocation} `)
      .then(response => { this.setState({ yelpData: response.data }) })
      .catch(error => console.error(error));
  }

  handleYelpSearchSubmit = (event) => {
    event.preventDefault();
    this.setState({ yelpData: [], directions: [] })
    this.state.baseLocation && this.getYelpData();
  }

  handleFormChange = (event) => {
    this.setState({ [event.target.name]: event.target.value })
  }

  handleRouteSave = (event) => {
    console.log(event);

    axios.post('http://localhost:3001/dbResults', {
      yelpData: this.state.directions,
      directions: this.state.directions
    })
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  handleBarChange = (event) => {

    // can bar be selected to be removed? We need 2 to make a route.
    const canSelect = this.state.directions.length > 1;

    const barsToUpdate = this.state.yelpData.map(bar => {

      // find matching bar by id of clicked item
      if (bar.id === event.currentTarget.dataset.value) {
        // only select if there are no less than 2 directions
        if (canSelect && bar.selected === false) {
          bar.selected = true;
        } else {
          bar.selected = false;
        }
      }
      return bar;
    });

    this.setState({ yelpData: barsToUpdate });
  }

  componentDidUpdate(prevProps, prevState) {

    // Only display welcome message on page load, if search field is empty, or 2 or less bars.
    if (prevState.baseLocation !== this.state.baseLocation && this.state.baseLocation === '') { this.setState({ welcomeMessage: true }); }

    // Exit if there isn't a change with Yelp data.
    if (prevState.yelpData === this.state.yelpData) return;

    // Build waypoint query for direction search based off of Yelp data.
    const directionQuery = !this.state.yelpData.length ? '' : this.state.yelpData.filter(yelpBar => !yelpBar.selected).map((location, idx) => `wp.${idx}=${location.address.join(', ')}`).join('&');

    // If query is empty, exit.  There is no need to call API
    if (!directionQuery) return;

    // Replace welcome message with loader
    if (prevState.directions === this.state.directions) this.setState({ welcomeMessage: false });

    axios.get(`http://localhost:3001/bingDirections/${directionQuery} `)
      .then(response => this.setState({ directions: response.data }))
      .catch(error => console.error(error));
  }

  render() {
    // Yelp results.  Display placeholders if there is no data.
    const yelpList = (this.state.yelpData.length < 1) ? new Array(10).fill('').map((emptyResult, idx) => (<li className='default' key={ idx + emptyResult }>
      <div>-</div>
      <div>
        <div>-</div>
        <div>-</div>
        <div>-</div>
        <div>-</div>
      </div>
      <div></div>
    </li>))
      :
      this.state.yelpData.sort((a, b) => a.distance - b.distance).map(bar => (
        <li key={ bar.id } onClick={ this.handleBarChange } data-value={ bar.id } className={ bar.selected ? 'default noSelect' : '' }>
          <div><img src={ bar.image || missingBarImg } alt={ bar.name } /></div>
          <div>
            <div>{ bar.name }</div>
            <div>{ bar.address[0] }</div>
            <div>{ bar.phone }</div>
            <div><a href={ bar.review } target="_blank" rel="noreferrer">Yelp Review</a></div>
          </div>
          <div>{ bar.selected ? <GiBrokenBottle /> : <GiBeerBottle /> }</div>
        </li>
      ));
    return (
      <div id='contentContainer'>
        <div>
          <div>
            <form onSubmit={ this.handleYelpSearchSubmit }>
              <input type='search' name='baseLocation' value={ this.state.baseLocation } onChange={ this.handleFormChange } placeholder='Type a location...' />
              <input type='submit' value='Find Bars' />
            </form>

            <div>
              <ul id='yelpBars'>
                { yelpList }
              </ul>
            </div>
          </div>
        </div>

        <div id="routeContent">
          { this.state.directions.length !== 0 && typeof this.state.directions === 'object' ?
            <>
              <RouteMap directions={ this.state.directions } yelpData={ this.state.yelpData } />

              <div id="directions">
                <RouteDirections directions={ this.state.directions } yelpData={ this.state.yelpData } />
                {
                  this.props.auth0.isAuthenticated ?
                    <button key={ this.state.directions.length + 1 } onClick={ this.handleRouteSave }>
                      Save Route
                    </button>
                    :
                    <button key={ this.state.directions.length + 1 }><NavLink to="/login">You must log in to save a route!</NavLink>
                    </button>
                }
              </div>
            </> :
            <div id='noResults' className={ this.state.welcomeMessage ? '' : 'loading' }>
              { this.state.welcomeMessage ? <div id='homeMessage'>
                <h1>Beer Route Site</h1>
                <p>
                  Welcome to our site.  This site was created to help create the most efficient biking (or walking) route between selected bars.
                </p>

                <h2>How to use:</h2>
                <ol>
                  <li>Type your location in the searchbar.</li>
                  <li>Click the bars you want to remove or add (there must be at least 2 bars selected).</li>
                  <li>
                    { !this.props.auth0.isAuthenticated ?
                      <><NavLink to="/login">Log in</NavLink> if you want to save your route.</> : <>View your <NavLink to="/saved-bars">saved bars</NavLink>.</>
                    }
                  </li>
                </ol>

                <img id='demoImg' src={ demoGif } alt='demo' />

              </div> :
                <div>
                  <div className='loader'>
                    <GiCartwheel />
                  </div>
                  <span>loading bars...</span>
                </div>
              }
            </div>
          }
        </div>
      </div>
    )
  }
}

export default withAuth0(BeerRouteCreate);