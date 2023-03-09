import React from 'react';
import axios from 'axios';
import LoginButton from './Login.js';
import RouteDirections from "./RouteDirections.js";
import RouteMap from "./RouteMap.js";
import { withAuth0 } from "@auth0/auth0-react";
import { NavLink } from "react-router-dom";
import { GiCartwheel, GiBeerBottle, GiBrokenBottle } from 'react-icons/gi';
import { IoMdBeer } from 'react-icons/io';
import { FaRegSave } from 'react-icons/fa';
import missingBarImg from '../images/missing-bar.jpg';
import demoGif from '../images/demo.gif';
import './BeerRouteCreate.css';

class BeerRouteCreate extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      submit: false,
      welcomeMessage: true,
      noDirections: false,
      baseLocation: '',
      yelpData: [],
      directions: []
    }
  }

  getYelpData = () => {
    axios.get(`https://brew-crew-backend.onrender.com/yelp/${this.state.baseLocation} `)
      .then(response => { this.setState({ yelpData: response.data }) })
      .catch(error => console.error(error));
  }

  handleYelpSearchSubmit = (event) => {
    event.preventDefault();
    this.setState({ yelpData: [], directions: [], submit: false });
    this.state.baseLocation && this.getYelpData();
  }

  handleFormChange = (event) => {
    this.setState({ [event.target.name]: event.target.value })
  }

  handleRouteSave = (event) => {
    this.setState({ submit: false });
    // Token
    if (this.props.auth0.isAuthenticated) {

      this.props.auth0.getIdTokenClaims().then(res => {
        const jwt = res.__raw;

        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        }

        axios.post('https://brew-crew-backend.onrender.com/dbResults', {
          yelpData: this.state.yelpData,
          directions: this.state.directions,
          email: res.email
        }, {
          headers: headers
        })
          .then((response) => {
            this.setState({ submit: true });
          })
          .catch((error) => {
            console.log(error);
          }).finally(() => {
            //this.setState({ submit: false });
          });
      });
    }

    this.setState({ submit: false });
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

    this.setState({ yelpData: barsToUpdate, submit: false });
  }

  componentDidUpdate(prevProps, prevState) {

    // Only display welcome message on page load, if search field is empty, or 2 or less bars.
    if (prevState.baseLocation !== this.state.baseLocation && this.state.baseLocation === '') { this.setState({ welcomeMessage: true, submit: false, noDirections: false }); }

    // Exit if there isn't a change with Yelp data.
    if (prevState.yelpData === this.state.yelpData) return;

    // Build waypoint query for direction search based off of Yelp data.
    const directionQuery = !this.state.yelpData.length ? '' : this.state.yelpData.filter(yelpBar => !yelpBar.selected).map((location, idx) => `wp.${idx}=${location.address.join(', ')}`).join('&');

    // If query is empty, exit.  There is no need to call API
    if (!directionQuery) return;

    // Replace welcome message with loader
    if (prevState.directions === this.state.directions) this.setState({ welcomeMessage: false, noDirections: false });

    axios.get(`https://brew-crew-backend.onrender.com/bingDirections/${directionQuery} `)
      .then(response => this.setState({ directions: response.data }))
      .catch(error => console.error(error))
      .finally(() => {

        !this.state.directions.length ? this.setState({ noDirections: true }) : this.setState({ noDirections: false })
      }
      );
  }

  componentDidMount = () => {
    this.setState({ submit: false });
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
              <input type='submit' value='&#128269; Search for bars' />
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
                    <button className={ this.state.submit ? 'submit' : '' } key={ this.state.directions.length + 1 } onClick={ this.handleRouteSave } disabled={ this.state.submit ? true : false }><FaRegSave />
                      { this.state.submit ? 'Route has been saved' : 'Save Route' }
                    </button>
                    :
                    <LoginButton value='Log in to save route' />
                }
              </div>
            </> :
            <div id='noResults' className={ this.state.welcomeMessage ? '' : 'loading' }>
              { this.state.welcomeMessage ? <div id='homeMessage'>
                <h1>< IoMdBeer />Trails of Ales</h1>
                <p>
                  Welcome to our site.  This site was created to help create the most efficient biking (or walking) route between selected bars.
                </p>

                <h2>How to use:</h2>
                <ol>
                  <li>Type your location in the searchbar.</li>
                  <li>Click the bars you want to remove or add (there must be at least 2 bars selected).</li>
                  <li>
                    { !this.props.auth0.isAuthenticated ?
                      <><LoginButton value='Log in' /> if you want to save your route.</> : <>View your <NavLink to="/saved-bars">saved bars</NavLink>.</>
                    }
                  </li>
                </ol>

                <img id='demoImg' src={ demoGif } alt='demo' />

              </div> :
                (this.state.noDirections) ? 'This route is not recommended for biking.' : <div>
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
