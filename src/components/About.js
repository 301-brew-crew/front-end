import React from "react";
import './About.css';
import ChrisImg from '../images/Chris.jpg';
import KatiLeeImg from '../images/katiLee.jpg';
import LeahImg from '../images/Leah.png';

class About extends React.Component {
  render() {
    return (
      <>
        <h2>
          About
        </h2>
        <div id='aboutContainer'>
          <div>
            <h3>Katherine Lee</h3>
            <img src={ KatiLeeImg } alt='Katherine Lee'/>
            <p>I've spent most of my life in food service and am looking for a lateral change instead of more horizontal ones.</p>
          </div>

          <div>
            <h3>Leah Wilner</h3>
            <img src={ LeahImg } alt='Leah Wilner' />
            <p>I am a Digital Marketer and Software Developer. I am passionate about helping people and working on meaningful projects.</p>
          </div>

          <div>
            <h3>Chris Vander Linden</h3>
            <h4>cvl123abc@gmail.com</h4>
            <h4>github.com/Chris-Vander-Linden</h4>
            <img src={ ChrisImg } alt='Chris Vander Linden' />
            <p>Software developer with experience developing child themes for various content management systems, building custom scripts to process and scrape web data. Transitioning to full stack JavaScript development.</p>
          </div>
        </div>
      </>
    );
  }
}

export default About;
