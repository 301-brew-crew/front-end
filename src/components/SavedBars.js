import React from "react";
import './SavedBars.css';
import axios from 'axios';

class SavedBars extends React.Component {
  constructor (props) {
    super(props);
    this.state = { savedRoutes: [] }
  }

  getBars = () => {
    axios.get('https://brew-crew-backend.onrender.com/dbResults')
      .then(res => {
        console.log(res.data);
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

  componentDidMount() {
    this.getBars();
  }

  render() {
    const list = this.state.savedRoutes.map(route => (
      <li key={ route._id }>
        { route._id }
        <button onClick={ () => { this.handleDeleteBars(route._id) } }> Delete </button>
      </li>
    ));

    return (
      <ul>
        { list }
      </ul>
    );
  }
}

export default SavedBars;
