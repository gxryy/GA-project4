import React, { useState } from "react";
import { Route, Routes } from "react-router-dom";
import CognitoCtx from "./context/CognitoCtx";
import Home from "./components/Home";
import Drive from "./components/Drive";
import ShareManager from "./components/ShareManager";
import CreditHistory from "./components/CreditHistory";
import SharedDownload from "./components/SharedDownload";
import NavBar from "./components/NavBar";
import ServerTest from "./components/ServerTest";

import "./dependencies/config";
import FolderDisplay from "./components/FolderDisplay";
const AmazonCognitoIdentity = require("amazon-cognito-identity-js");

export default function App() {
  let poolData = {
    UserPoolId: window._config.cognito.userPoolId,
    ClientId: window._config.cognito.userPoolClientId,
  };

  const [fileList, setFileList] = useState({ objectList: [], folderList: [] });

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
        <a href="/servertest"> Server Test </a>
        <a href="/download">Public Download </a>

        <CognitoCtx.Provider value={{ userPool }}>
          <NavBar></NavBar>
          <Routes>
            <Route path="/" element={<Home />}></Route>
            <Route path="/drive" element={<Drive />}></Route>
            <Route path="/credithistory" element={<CreditHistory />}></Route>
            <Route path="/shareManager" element={<ShareManager />}></Route>
            <Route
              path="/download/:url_uuid"
              element={<SharedDownload />}
            ></Route>
            <Route path="/servertest" element={<ServerTest />}></Route>
          </Routes>
        </CognitoCtx.Provider>
      </div>
    </>
  );
}
