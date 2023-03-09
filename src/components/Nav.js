import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { IoMdBeer } from 'react-icons/io';
import "./Nav.css";
import { withAuth0 } from "@auth0/auth0-react";
import LoginButton from "./Login.js"
import LogoutButton from "./Logout.js"

class Nav extends React.Component {
  render() {
    return (
      <>
        <header>
          <nav>
            <NavLink to="/"><IoMdBeer /> Trails of Ales</NavLink>
            <div>
              <NavLink to="about">About</NavLink>
              { this.props.auth0.isAuthenticated ? (
                <>
                  <NavLink to="saved-bars">Saved Bars</NavLink>
                  {/* <NavLink to="profile">Profile</NavLink> */ }
                  <LogoutButton value='Log out' />
                </>
              ) : (
                <>
                  <LoginButton value='Log in' />
                </>
              ) }
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
