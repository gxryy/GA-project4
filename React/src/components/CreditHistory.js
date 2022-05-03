import React, { useContext, useState, useEffect } from "react";
import CognitoCtx from "../context/CognitoCtx";

const CreditHistory = () => {
  const CognitoContext = useContext(CognitoCtx);
  let cognitoUser = CognitoContext.userPool.getCurrentUser();
  let accessToken = CognitoContext.accessToken;
  let username = cognitoUser.username;

  const [creditHistory, setCreditHistory] = useState([]);

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

    fetch("http://localhost:5001/drive/getcredithistory", requestOptions)
      .then((response) => response.text())
      .then((result) => setCreditHistory(JSON.parse(result)))
      .catch((error) => console.log("error", error));
  }, []);

  // useEffect(() => {
  //   console.log(creditHistory);
  // }, [creditHistory]);

  return (
    <div>
      {creditHistory.map((transaction) => {
        return (
          <>
            <hr></hr>
            <p>Date: {transaction.date}</p>
            <p>Credit Adjustment: {transaction.credit_adjustment}</p>
            <p>Adjustment Type: {transaction.adjustment_type}</p>
            <hr></hr>
          </>
        );
      })}
    </div>
  );
};

export default CreditHistory;
