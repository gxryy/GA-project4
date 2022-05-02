import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import CognitoCtx from "../context/CognitoCtx";

const AmazonCognitoIdentity = require("amazon-cognito-identity-js");

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

    if (password === password2) {
      let myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      var raw = JSON.stringify({
        email,
        firstName,
        lastName,
        password,
      });

      var requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow",
      };

      fetch("http://localhost:5001/register", requestOptions)
        .then((response) => {
          response.status == 200
            ? navigate("/verify", { state: { email } })
            : alert("Signup failed. Please try again..");
        })
        .catch((error) => alert(error));
    } else {
      alert("Passwords do not match");
    }
  };

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
