import React from "react";
import './RouteDirections.css';
import { ImLocation } from 'react-icons/im';
import { FaMapMarkedAlt } from 'react-icons/fa';

class RouteDirections extends React.Component {

  render() {
    // Calculate total distance.
    const totalDistance = typeof this.props.directions !== 'object' ? '' : <><FaMapMarkedAlt/> {`${Math.round(this.props.directions.reduce((preValue, curValue) => preValue + curValue.travelDistance, 0) * 10) / 10} miles total`}</>;

    // Build list of directions.
    const mapDirections = typeof this.props.directions !== 'object' ? '' : [...this.props.directions.map((routeLeg, idx) => (
      <div key={ routeLeg?.endCoordinates + idx }>
        <h3 key={ idx + 1 }> <ImLocation />{ ` #${idx + 1}: ` + (this.props.yelpData?.filter(yelpLocation => yelpLocation?.address?.join(', ') === routeLeg.startName)[0]?.name ?? routeLeg?.startName) }</h3>
        <h4>{ `(Next bar is ${Math.round(routeLeg.travelDistance * 10) / 10} miles away)` }</h4>
        <ul>
          { routeLeg.itineraryItems.map((step, idx) => (
            <li key={ step.instruction.text.replace(' ', '-') + idx + step.travelDistance }>{ `${step.instruction.text} (${Math.round(step.travelDistance * 10) / 10} miles)` }</li>
          )) }
        </ul>
      </div>
    )),
    <h3 key={ this.props.directions.length + 1 }>
      <ImLocation />
      { ` #${this.props.directions.length + 1}: ` + (this.props.yelpData.filter(yelpLocation => yelpLocation?.address?.join(', ') === this.props.directions[this.props.directions.length - 1]?.endName)[0]?.name ?? this.props.directions[this.props.directions.length - 1]?.endName) }
    </h3>
    ];

    return (
      <>
        <h2> { totalDistance }</h2>
        <div>{ mapDirections }</div>
      </>);
  }
}
export default RouteDirections;
