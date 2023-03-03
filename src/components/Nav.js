import React from "react";
import { NavLink, Outlet } from 'react-router-dom';
import './Nav.css';
import { withAuth0 } from "@auth0/auth0-react";

class Nav extends React.Component {
  render() {
    return (
      <>
        <header>
          <nav>
            <NavLink to="/">Home</NavLink>
            <div>
            <NavLink to="about">About</NavLink>
            <NavLink to="profile">Profile</NavLink>
            </div>
          </nav>
        </header>

        <main>
          <Outlet />
        </main>
      </>
    );
  }
}

export default withAuth0(Nav);
