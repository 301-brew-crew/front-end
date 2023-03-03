import "./index.css";
import App from "./App";
import React from "react";
import ReactDOM from "react-dom";
import { Auth0Provider } from "@auth0/auth0-react";

ReactDOM.render(
  <Auth0Provider
    domain="dev-rfa4a3egya30fvin.us.auth0.com"
    clientId="yU51v36RThZsPCXWNhVIrIjX4eL5hbp3"
    authorizationParams={{
      redirect_uri: window.location.origin,
    }}
  >
    <App />
  </Auth0Provider>,
  document.getElementById("root")
);
