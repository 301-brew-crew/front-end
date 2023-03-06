import React from "react";
import './RouteMap.css';

class RouteMap extends React.Component {

  render() {
    // Build search query for map image
    const mapRouteQuery = typeof this.props.directions !== 'object' ? '' : `wp.1=${this.props.directions[0]?.startCoordinates};66;1&` + this.props.directions.map((location, idx) => `wp.${idx + 2}=${location.endCoordinates};66;${idx + 2}`).join('&');

    // Fetch map image.
    const map = `https://dev.virtualearth.net/REST/v1/Imagery/Map/Road/Routes/Walking?${mapRouteQuery}&travelMode=Walking&optmz=distance&mapSize=400,400&key=${process.env.REACT_APP_BING}`;

    return <div>
      <img src={ map } alt='route map' />
    </div>;
  }
}
export default RouteMap;
