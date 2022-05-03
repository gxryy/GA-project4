import { nanoid } from "nanoid";
import React, { useEffect, useContext, useState } from "react";
import CognitoCtx from "../context/CognitoCtx";
import LinkManager from "./LinkManager";

const ShareManager = () => {
  const CognitoContext = useContext(CognitoCtx);
  const [linkArray, setLinkArray] = useState([]);

  // shared manager to call endpoint with username, and authtoken only.
  // endpoint expected to return an array of shared links and its ecpiry

  let cognitoUser = CognitoContext.userPool.getCurrentUser();
  let accessToken = CognitoContext.accessToken;
  let username = cognitoUser.username;
  console.log(CognitoContext);

  useEffect(() => {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify({
        username,
        accessToken,
      }),
      redirect: "follow",
    };

    fetch("http://localhost:5001/drive/getallsharedlink", requestOptions)
      .then((response) => response.text())
      .then((data) => {
        setLinkArray(JSON.parse(data));
      })
      .catch((error) => console.log("error", error));
  }, []);

  useEffect(() => {
    console.log(`array updated`);
    console.log(linkArray);
  }, [linkArray]);

  return (
    <div>
      <h1> Shared Management tool</h1>
      {linkArray.map((link) => (
        <LinkManager linkDetails={link} key={nanoid()}></LinkManager>
      ))}
    </div>
  );
};

export default ShareManager;
