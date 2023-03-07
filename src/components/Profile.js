import React from "react";
import { CgProfile } from 'react-icons/cg';
import { AiOutlineMail } from 'react-icons/ai';
import { useAuth0 } from "@auth0/auth0-react";

const Profile = () => {

  const { user, isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return <div>Loading ...</div>;
  }
  
  return (
    isAuthenticated && (
      <>
        <div>
          <img src={ user.picture } alt={ user.name } />
          <h2><CgProfile/> { user.name }</h2>
          <p><AiOutlineMail/> { user.email }</p>
        </div>
      </>
    )
  );
};

export default Profile;
