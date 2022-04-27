import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import * as AWS from "aws-sdk/global";
import CognitoCtx from "../context/CognitoCtx";

const AmazonCognitoIdentity = require("amazon-cognito-identity-js");

const SignIn = () => {
  const navigate = useNavigate();
  const CognitoContext = useContext(CognitoCtx);

  const signInHandler = (event) => {
    event.preventDefault();

    let email = event.target.emailInputRegister.value;
    let password = event.target.passwordInputRegister.value;

    let authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(
      { Username: email, Password: password }
    );
    let userData = {
      Username: email,
      Pool: CognitoContext.userPool,
    };

    let cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    // CognitoContext.setCognitoUser(cognitoUser);
    console.log(CognitoContext);
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: function (result) {
        console.log(`successful login`);
        console.log(result);
        var accessToken = result.getAccessToken().getJwtToken();
        console.log(`accessToken is ${accessToken}`);
        navigate("/drive");
      },

      onFailure: function (err) {
        console.log(`login FAILED`);
        alert(err.message || JSON.stringify(err));
      },
    });
  };

  return (
    <div>
      <h1> Sign in Here</h1>
      <form onSubmit={signInHandler}>
        <input
          type="email"
          id="emailInputRegister"
          placeholder="Email"
          pattern=".*"
          required
        />
        <input
          type="password"
          id="passwordInputRegister"
          placeholder="Password"
          pattern=".{6,}"
          title="Six or more characters"
          required
        />
        <input type="submit" value="Sign In" />
      </form>
    </div>
  );
};

export default SignIn;
