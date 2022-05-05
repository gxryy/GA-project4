import React, { useContext, useState, useEffect } from "react";
import CognitoCtx from "../context/CognitoCtx";
import { useNavigate } from "react-router-dom";
import { nanoid } from "nanoid";

const TopUp = () => {
  const CognitoContext = useContext(CognitoCtx);
  let cognitoUser = CognitoContext.userPool.getCurrentUser();
  let accessToken = CognitoContext.accessToken;
  let username = cognitoUser.username;
  const navigate = useNavigate();

  useEffect(() => {
    if (cognitoUser) {
      cognitoUser.getSession(function sessionCallback(err, session) {
        if (err) {
          navigate("/");
        } else if (!session.isValid()) {
          navigate("/");
        } else {
          accessToken = session.getAccessToken().getJwtToken();
          CognitoContext.accessToken = accessToken;
        }
      });
    } else {
      navigate("/");
    }
  }, []);

  const topupHandler = (event) => {
    event.preventDefault();

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
      credit_adjustment: parseInt(event.target.amount.value),
      username,
      accessToken,
    });

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch("http://127.0.0.1:5001/drive/topup", requestOptions)
      .then((response) => response.text())
      .then((result) => alert("SUCCESS"))
      .catch((error) => console.log("error", error));
  };

  return (
    <>
      <div className="w-10/12 mx-auto">
        <form onSubmit={topupHandler}>
          <p>Enter amount to top up</p>
          <input type="number" name="amount"></input>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1.5 px-4 rounded"
          >
            Top Up
          </button>
        </form>
      </div>
    </>
  );
};

export default TopUp;
