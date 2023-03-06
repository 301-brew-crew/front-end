import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();

  return (
    <>
      <h2>
        Login
      </h2>
      <div>Click below to login...</div>

      <button onClick={ () => loginWithRedirect() }>Log In</button>
    </>
  );
};

export default LoginButton;