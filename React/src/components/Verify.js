import React, { useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CognitoCtx from "../context/CognitoCtx";

const AmazonCognitoIdentity = require("amazon-cognito-identity-js");

const Verify = (props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const CognitoContext = useContext(CognitoCtx);

  let email = location.state?.email;

  const submitHandler = (event) => {
    event.preventDefault();
    let userVerificationCode = event.target.verificationField.value;

    if (email) {
      let userData = {
        Username: email,
        Pool: CognitoContext.userPool,
      };

      let cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
      console.log(cognitoUser);
      cognitoUser.confirmRegistration(
        userVerificationCode,
        true,
        function (err, result) {
          if (err) {
            alert(err.message || JSON.stringify(err));
            return;
          }
          console.log("call result: " + result);
          alert("SUCCESS");
          navigate("/");
        }
      );
    }
  };

  return (
    <div>
      <h1>Verify component</h1>
      <h2>Verification code has been sent to {email}</h2>
      <h3>Enter Verification Code: </h3>
      <form onSubmit={submitHandler}>
        <input type="number" pattern="[0-9]{6}" id="verificationField"></input>
        <input type="submit"></input>
      </form>
    </div>
  );
};

export default Verify;
