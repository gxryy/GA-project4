import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import CognitoCtx from "../context/CognitoCtx";
import signUpSuccess from "../response/signUpSuccess.json";

const AmazonCognitoIdentity = require("amazon-cognito-identity-js");

// ---------- COGNITO CODES ---------- //

const SignUp = () => {
  const CognitoContext = useContext(CognitoCtx);
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();

    let firstName = event.target.firstName.value;
    let lastName = event.target.lastName.value;
    let email = event.target.emailInputRegister.value;
    let password = event.target.passwordInputRegister.value;
    let password2 = event.target.password2InputRegister.value;

    var onSuccess = function registerSuccess(result) {
      console.log(result);
      var cognitoUser = result.user;
      // console.log("user name is " + cognitoUser.getUsername());
      var confirmation =
        "Registration successful. Please check your email inbox or spam folder for your verification code.";
      if (confirmation) {
        alert(confirmation);
        navigate("/verify", { state: { email } });
      }
    };
    var onFailure = function registerFailure(err) {
      console.log(`registration failure`);
      console.log(err);
      //   alert(err);
    };

    if (password === password2) {
      let attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute({
        Name: "email",
        Value: email,
      });

      let attributeFirstName = new AmazonCognitoIdentity.CognitoUserAttribute({
        Name: "given_name",
        Value: firstName,
      });

      let attributeLastName = new AmazonCognitoIdentity.CognitoUserAttribute({
        Name: "family_name",
        Value: lastName,
      });

      register(email, password, onSuccess, onFailure, [
        attributeEmail,
        attributeFirstName,
        attributeLastName,
      ]);
    } else {
      alert("Passwords do not match");
    }
  };

  function register(email, password, onSuccess, onFailure, attributeList) {
    console.log(`email is ${email}`);
    console.log(`password is ${password}`);
    console.log(attributeList);

    CognitoContext.userPool.signUp(
      email,
      password,
      attributeList,
      null,
      function signUpCallback(err, result) {
        if (!err) {
          onSuccess(result);
        } else {
          onFailure(err);
        }
      }
    );

    // onSuccess(signUpSuccess);
  }

  return (
    <div>
      <h2>This is the signup component</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          id="firstName"
          placeholder="First Name"
          required
        ></input>
        <input
          type="text"
          id="lastName"
          placeholder="Last Name"
          required
        ></input>
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
        <input
          type="password"
          id="password2InputRegister"
          placeholder="Confirm Password"
          pattern=".{6,}"
          required
        />

        <input type="submit" value="Register" />
      </form>
    </div>
  );
};

export default SignUp;
