import React from "react";
// import "../dependencies/jquery-3.1.0.js";
import "../dependencies/config";
// import "../dependencies/cognito-auth";
const AmazonCognitoIdentity = require("amazon-cognito-identity-js");

var poolData = {
  UserPoolId: window._config.cognito.userPoolId,
  ClientId: window._config.cognito.userPoolClientId,
};

var userPool;

userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

const SignUp = () => {
  function toUsername(email) {
    return email.replace("@", "-at-");
  }

  const handleSubmit = (event) => {
    event.preventDefault();

    let email = event.target.emailInputRegister.value;
    let password = event.target.passwordInputRegister.value;
    let password2 = event.target.password2InputRegister.value;

    var onSuccess = function registerSuccess(result) {
      var cognitoUser = result.user;
      console.log("user name is " + cognitoUser.getUsername());
      var confirmation =
        "Registration successful. Please check your email inbox or spam folder for your verification code.";
      if (confirmation) {
        window.location.href = "verify.html";
      }
    };
    var onFailure = function registerFailure(err) {
      console.log(`registration failure`);
      console.log(err);
      //   alert(err);
    };

    if (password === password2) {
      register(email, password, onSuccess, onFailure);
    } else {
      alert("Passwords do not match");
    }
  };

  function register(email, password, onSuccess, onFailure) {
    console.log(`email is ${email}`);
    console.log(`password is ${password}`);
    var dataEmail = {
      Name: "email",
      Value: email,
    };
    var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(
      dataEmail
    );
    var datafamilyname = {
      Name: "family_name",
      Value: "lastnamehehe",
    };

    var attributefamilyname = new AmazonCognitoIdentity.CognitoUserAttribute(
      datafamilyname
    );

    var datafirstname = {
      Name: "given_name",
      Value: "first",
    };

    var attributegivenname = new AmazonCognitoIdentity.CognitoUserAttribute(
      datafirstname
    );

    var datausername = {
      Name: "preferred_username",
      Value: "testuser",
    };

    var attributeusername = new AmazonCognitoIdentity.CognitoUserAttribute(
      datausername
    );

    userPool.signUp(
      email,
      password,
      [
        attributeEmail,
        attributefamilyname,
        attributeusername,
        attributegivenname,
      ],
      null,
      function signUpCallback(err, result) {
        if (!err) {
          onSuccess(result);
        } else {
          onFailure(err);
        }
      }
    );
  }

  return (
    <div>
      <h2>This is the signup component</h2>

      <form onSubmit={handleSubmit}>
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
          pattern=".*"
          required
        />
        <input
          type="password"
          id="password2InputRegister"
          placeholder="Confirm Password"
          pattern=".*"
          required
        />

        <input type="submit" value="Register" />
      </form>
    </div>
  );
};

export default SignUp;
