import React, { useContext } from "react";
import CognitoCtx from "../context/CognitoCtx";

const Signout = () => {
  const CognitoContext = useContext(CognitoCtx);

  let cognitoUser = CognitoContext.userPool.getCurrentUser();
  cognitoUser.signOut();

  return <div></div>;
};

export default Signout;
