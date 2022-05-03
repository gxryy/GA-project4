import React, { useContext, useState, useEffect } from "react";
import CognitoCtx from "../context/CognitoCtx";

const LinkManager = ({ linkDetails }) => {
  const CognitoContext = useContext(CognitoCtx);
  let cognitoUser = CognitoContext.userPool.getCurrentUser();
  let accessToken = CognitoContext.accessToken;
  let username = cognitoUser.username;
  const [newExpiry, setNewExpiry] = useState("");

  const deleteHandler = () => {
    console.log(`delete link`);

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var requestOptions = {
      method: "DELETE",
      headers: myHeaders,
      body: JSON.stringify({
        url_uuid: linkDetails.url_uuid,
        username,
        accessToken,
      }),
      redirect: "follow",
    };

    fetch("http://localhost:5001/drive/deletelink", requestOptions)
      .then((response) => response.text())
      .then((result) => console.log(result))
      .catch((error) => console.log("error", error));
  };

  const editHandler = () => {
    console.log(newExpiry);

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify({
        url_uuid: linkDetails.url_uuid,
        newExpiry,
        username,
        accessToken,
      }),
      redirect: "follow",
    };

    fetch("http://127.0.0.1:5001/drive/editlinkexpiry", requestOptions)
      .then((response) => response.text())
      .then((result) => console.log(result))
      .catch((error) => console.log("error", error));
  };

  useEffect(() => {
    console.log(newExpiry);
  }, [newExpiry]);

  return (
    <div>
      <p>{linkDetails.fileName}</p>
      <p>{`http://localhost:5001/download/${linkDetails.url_uuid}`}</p>
      <p>{linkDetails.expiry}</p>
      <p>{linkDetails.download_counter}</p>
      <p>{linkDetails.createdAt}</p>

      <input
        type="datetime-local"
        onChange={(event) => setNewExpiry(event.target.value)}
      ></input>
      <input type="button" onClick={editHandler} value="edit"></input>

      <input type="button" value="delete" onClick={deleteHandler}></input>
      <hr></hr>
    </div>
  );
};

export default LinkManager;
