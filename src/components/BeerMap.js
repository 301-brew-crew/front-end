import React from 'react';
import axios from 'axios';
import missingBarImg from '../images/missing-bar.jpg'
import { GiCartwheel, GiBeerBottle, GiBrokenBottle } from 'react-icons/gi';
import {ImLocation} from 'react-icons/im';
import './BeerMap.css';

class BeerMap extends React.Component {
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

  handleBarChange = (event) => {

    // can bar be selected to be removed? We need 2 to make a route.
    const canSelect = this.state.directions.length > 1;

    const barsToUpdate = this.state.yelpData.map(bar => {
      
      // find matching bar by id of clicked item
      if(bar.id === event.currentTarget.dataset.value){
        // only select if there are no less than 2 directions
        if(canSelect && bar.selected === false){
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
    if(!directionQuery) return;

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
          <div>{bar.selected ? <GiBrokenBottle /> : <GiBeerBottle/>}</div>
        </li>
      ));

    // Build search query for map image
    const mapRouteQuery = typeof this.state.directions !== 'object' ? '' : `wp.1=${this.state.directions[0]?.startCoordinates};66;1&` + this.state.directions.map((location, idx) => `wp.${idx + 2}=${location.endCoordinates};66;${idx + 2}`).join('&');

    // Fetch map image.
    const map = `https://dev.virtualearth.net/REST/v1/Imagery/Map/Road/Routes/Walking?${mapRouteQuery}&travelMode=Walking&optmz=distance&mapSize=400,400&key=${process.env.REACT_APP_BING}`;

    // Calculate total distance.
    const totalDistance = typeof this.state.directions !== 'object' ? '' : `TOTAL: ${Math.round(this.state.directions.reduce((preValue, curValue) => preValue + curValue.travelDistance, 0) * 10) / 10} miles`;

    // Build list of directions.
    const mapDirections = typeof this.state.directions !== 'object' ? '' : [...this.state.directions.map((routeLeg, idx) => (
      <div key={ routeLeg?.endCoordinates + idx }>
        <h3 key={ idx + 1 }> <ImLocation/>{ ` #${idx + 1}: ` + (this.state.yelpData?.filter(yelpLocation => yelpLocation?.address.join(', ') === routeLeg.startName)[0]?.name ?? routeLeg?.startName) }</h3>
        <h4>{ `(Next bar is ${Math.round(routeLeg.travelDistance * 10) / 10} miles away)` }</h4>
        <ul>
          { routeLeg.itineraryItems.map((step, idx) => (
            <li key={ step.instruction.text.replace(' ', '-') + idx + step.travelDistance }>{ `${step.instruction.text} (${Math.round(step.travelDistance * 10) / 10} miles)` }</li>
          )) }
        </ul>
      </div>
    )), <h3 key={ this.state.directions.length + 1 }> <ImLocation/>{ ` #${this.state.directions.length + 1}: ` + (this.state.yelpData.filter(yelpLocation => yelpLocation.address.join(', ') === this.state.directions[this.state.directions.length - 1]?.endName)[0]?.name ?? this.state.directions[this.state.directions.length - 1]?.endName) }</h3>, <button>Save Route</button>];

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
              <div>
                <img src={ map } alt='route map' />
              </div>
              <div id="directions">
                <h2>{ totalDistance }</h2>
                <div>{ mapDirections }</div>
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
                    <li>Click the bars you want to remove or add.</li>
                    <li>In order to receive directions you must select at least 2 bars.</li>
                    <li>Click 'Save Route'.</li>
                  </ol>

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

export default BeerMap;
