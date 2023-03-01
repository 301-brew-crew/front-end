import React from 'react';
import axios from 'axios';
import missingBarImg from '../images/missing-bar.jpg'
import './BeerMap.css';

class BeerMap extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      loadingYelp: false,
      loadingMap: false,
      baseLocation: '',
      yelpData: [],
      directions: []
    }
  }

  getYelpData = () => {
    this.setState({
      loadingYelp: true
    });

    axios.get(`http://localhost:3001/yelp/${this.state.baseLocation} `)
      .then(response => { this.setState({ yelpData: response.data }) })
      .catch(error => console.error(error))
      .finally(this.setState({ loadingYelp: false }));
  }

  handleYelpSearchSubmit = (event) => {
    event.preventDefault();
    this.setState({ yelpData: [], directions: [] })
    this.state.baseLocation && this.getYelpData();
  }

  handleFormChange = (event) => {
    console.log(event.target.name);
    console.log(event.target.value);
    this.setState({ [event.target.name]: event.target.value })
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.yelpData === this.state.yelpData) return;

    // Build Waypoint Query for Direction Search.
    const directionQuery = typeof this.state.yelpData !== 'object' ? '' : this.state.yelpData.map((location, idx) => `wp.${idx + 1}=${location.address.join(', ')}`).join('&');

    // set loading to true
    console.log('loading map');
    if (prevState.directions === this.state.directions) this.setState({ loadingMap: true });

    axios.get(`http://localhost:3001/bingDirections/${directionQuery} `).then(response => this.setState({ directions: response.data })).catch(error => console.error(error)).finally(() => {
      console.log('done loading map');
      this.setState({ loadingMap: false });
    });
  }

  render() {
    // yelp result
    const yelpList = (typeof this.state.yelpData !== 'object' && !this.state.loadingYelp) ? '' : this.state.yelpData.sort((a, b) => a.distance - b.distance).map(bar => (
      <li key={ bar.id }>
        <div><img src={ bar.image || missingBarImg } alt={ bar.name } /></div>
        <div>
          <div>{ bar.name }</div>
          <div>{ bar.address[0] }</div>
          <div>{ bar.phone }</div>
          <div><a href={ bar.review } target="_blank" rel="noreferrer">Yelp Review</a></div>
        </div>
      </li>
    ));

    // query for map image
    const mapRouteQuery = typeof this.state.directions !== 'object' ? '' : `wp.1=${this.state.directions[0]?.startCoordinates};66;1&` + this.state.directions.map((location, idx) => `wp.${idx + 2}=${location.endCoordinates};66;${idx + 2}`).join('&');

    const map = `https://dev.virtualearth.net/REST/v1/Imagery/Map/Road/Routes/Walking?${mapRouteQuery}&travelMode=Walking&optmz=distance&mapSize=400,400&key=${process.env.REACT_APP_BING}`;

    // directions
    const totalDistance = typeof this.state.directions !== 'object' ? '' : `TOTAL: ${Math.round(this.state.directions.reduce((preValue, curValue) => preValue + curValue.travelDistance, 0) * 10) / 10} miles`;

    const mapDirections = typeof this.state.directions !== 'object' ? '' : [...this.state.directions.map((routeLeg, idx) => (
      <div key={ routeLeg?.endCoordinates + idx }>
        <h3>{ `Bar #${idx + 1}: ` + (this.state.yelpData?.filter(yelpLocation => yelpLocation?.address.join(', ') === routeLeg.startName)[0]?.name ?? routeLeg?.startName) }</h3>
        <h4>{ `(Next bar is ${Math.round(routeLeg.travelDistance * 10) / 10} miles away)` }</h4>
        <ul>
          { routeLeg.itineraryItems.map((step, idx) => (
            <li key={ step.instruction.text.replace(' ', '-') + idx + step.travelDistance }>{ `${step.instruction.text} (${Math.round(step.travelDistance * 10) / 10} miles)` }</li>
          )) }
        </ul>
      </div>
    )), <h3>{ `Bar #${this.state.directions.length + 1}: ` + (this.state.yelpData.filter(yelpLocation => yelpLocation.address.join(', ') === this.state.directions[this.state.directions.length - 1]?.endName)[0]?.name ?? this.state.directions[this.state.directions.length - 1]?.endName) }</h3>, <button>Save Route</button>];

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
                { yelpList.length > 0 ? yelpList : 'some default list will go here...'}
              </ul>
            </div>
          </div>
        </div>

        <div id="routeContent">
          <div>

            { (yelpList.length > 0 && typeof this.state.directions === 'object') ?
              <img src={ map } alt='route map' /> :

              <div id='noResults'>
                { this.state.loadingMap ?
                  <div>loading!!!</div> : yelpList.length === 0 ?
                    <div>
                      <h2>Use the searchbar to find nearby bars!!!</h2>
                      <p>Beers? Beers? Beers? Beers? Beers? Beers?</p>
                      <p>Beers? Beers? Beers? Beers? Beers? Beers?</p>
                      <p>Beers? Beers? Beers? Beers? Beers? Beers?</p>
                      <p>Beers? Beers? Beers? Beers? Beers? Beers?</p>
                      <p>Beers? Beers? Beers? Beers? Beers? Beers?</p>
                    </div> : '' }
              </div>

            }

          </div>

          { (this.state.directions.length !== 0 && !this.state.loadingMap) &&
            <div id="directions">
              <h2>{ totalDistance }</h2>
              <div id='directions'>{ mapDirections }</div>
            </div>
          }

          {/*
            <div id="social">
              <div>
                <img src="https://qrtag.net/api/qr_transparent_6.svg?url=https://www.qrtag.net" alt="qrtag" />
              </div>
              <div>
                <div>facebook</div>
                <div>twitter</div>
                <div>email</div>
              </div>
            </div>
            */}
        </div>
      </div>
    )
  }
}

export default BeerMap;
