import React, { useState } from "react";
import { Route, Routes } from "react-router-dom";
import CognitoCtx from "./context/CognitoCtx";
import SignUp from "./components/SignUp";
import SignIn from "./components/SignIn";
import Signout from "./components/Signout";
import Verify from "./components/Verify";
import Home from "./components/Home";
import Test from "./components/Test";
import Drive from "./components/Drive";
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
        <h4>App Component</h4>
        <a href="/signup"> Sign Up </a>
        <a href="/signin"> Sign In </a>
        <a href="/signout"> Sign Out </a>
        <a href="/verify"> Verify </a>
        <a href="/test"> Test </a>
        <a href="/drive"> Drive </a>
        <CognitoCtx.Provider value={{ userPool }}>
          <Routes>
            <Route path="/" element={<Home />}></Route>
            <Route path="/signup" element={<SignUp />}></Route>
            <Route path="/signin" element={<SignIn />}></Route>
            <Route path="/signout" element={<Signout />}></Route>
            <Route path="/verify" element={<Verify />}></Route>
            <Route path="/test" element={<Test />}></Route>
            <Route path="/drive" element={<Drive />}></Route>
          </Routes>
        </CognitoCtx.Provider>
      </div>
    </>
  );
}
