import React from "react";
import { Route, Routes } from "react-router-dom";
import CognitoCtx from "./context/CognitoCtx";
import Home from "./components/Home";
import Drive from "./components/Drive";
import ShareManager from "./components/ShareManager";
import CreditHistory from "./components/CreditHistory";
import SharedDownload from "./components/SharedDownload";
import NavBar from "./components/NavBar";
import UsageHistory from "./components/UsageHistory";

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
        <CognitoCtx.Provider value={{ userPool }}>
          <NavBar></NavBar>
          <Routes>
            <Route path="/" element={<Home />}></Route>
            <Route path="/drive" element={<Drive />}></Route>
            <Route path="/credithistory" element={<CreditHistory />}></Route>
            <Route path="/usagehistory" element={<UsageHistory />}></Route>
            <Route path="/shareManager" element={<ShareManager />}></Route>
            <Route
              path="/download/:url_uuid"
              element={<SharedDownload />}
            ></Route>
          </Routes>
        </CognitoCtx.Provider>
      </div>
    </>
  );
}
