import React from "react";
import { Route, Routes } from "react-router-dom";
import CognitoCtx from "./context/CognitoCtx";
import SignUp from "./components/SignUp";
import SignIn from "./components/SignIn";
import Verify from "./components/Verify";
import Home from "./components/Home";
import "./dependencies/config";
const AmazonCognitoIdentity = require("amazon-cognito-identity-js");

export default function App() {
  let poolData = {
    UserPoolId: window._config.cognito.userPoolId,
    ClientId: window._config.cognito.userPoolClientId,
  };

  let userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

  return (
    <>
      <div className="App">
        <h1>App component</h1>
        <CognitoCtx.Provider value={{ userPool }}>
          <Routes>
            <Route path="/" element={<Home />}></Route>
            <Route path="/signup" element={<SignUp />}></Route>
            <Route path="/signin" element={<SignIn />}></Route>
            <Route path="/verify" element={<Verify />}></Route>
          </Routes>
        </CognitoCtx.Provider>
      </div>
    </>
  );
}
