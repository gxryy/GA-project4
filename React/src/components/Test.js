import React, { useContext } from "react";
import CognitoCtx from "../context/CognitoCtx";

const Test = () => {
  const CognitoContext = useContext(CognitoCtx);

  console.log(`current user`);
  let cognitoUser = CognitoContext.userPool.getCurrentUser();

  console.log(cognitoUser);

  if (cognitoUser) {
    cognitoUser.getSession(function sessionCallback(err, session) {
      if (err) {
        console.log(err);
      } else if (!session.isValid()) {
        console.log(`invalid session`);
      } else {
        console.log(`JWT TOKEN`);
        console.log(session.getIdToken().getJwtToken());
      }
    });
  } else {
    console.log("null");
  }

  cognitoUser.getUserAttributes(function (err, result) {
    if (err) {
      alert(err.message || JSON.stringify(err));
      return;
    }
    for (let i = 0; i < result.length; i++) {
      console.log(
        "attribute " +
          result[i].getName() +
          " has value " +
          result[i].getValue()
      );
    }
  });

  const signout = () => {
    cognitoUser.signOut();
  };

  return (
    <div>
      <h1>The test component</h1>
      <input type="button" value="signout" onClick={signout} />
    </div>
  );
};

export default Test;
