import React from "react";
import Nav from './components/Nav.js'
import About from "./components/About.js";
import BeerMap from './components/BeerMap.js'
import Profile from './components/Profile.js'

import './App.css';

import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={ <Nav /> }>
      <Route index element={ <BeerMap /> } />
      <Route path="about" element={ <About /> } />
      <Route path="profile" element={ <Profile /> } />
    </Route>
  )
);

class App extends React.Component {
  render() {
    return <>
      <RouterProvider router={ router } />
      <footer> &copy; copyright {new Date().getFullYear()}</footer>
    </>
  }
}

export default App;
