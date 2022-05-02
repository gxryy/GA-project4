import React, { useContext } from "react";
import CognitoCtx from "../context/CognitoCtx";

const FileDisplay = (props) => {
  const CognitoContext = useContext(CognitoCtx);

  let accessToken = CognitoContext.accessToken;
  let cognitoUser = CognitoContext.userPool.getCurrentUser();
  let username = cognitoUser.username;

  let file = props.file;
  let arraySplit = file.Key.split("/");
  let fileName = arraySplit[arraySplit.length - 1];

  const toReadable = (sizeInBytes) => {
    let units = ["bytes", "KB", "MB", "GB", "TB"];
    let size = sizeInBytes;
    let counter = 0;
    while (size > 1000) {
      size = size / 1000;
      counter++;
    }
    size = (Math.round(size * 100) / 100).toFixed(2);
    return size + units[counter];
  };

  const clickHandler = async () => {
    // --- FETCH ---
    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    let requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify({
        username,
        Key: file.Key,
        accessToken,
      }),
      redirect: "follow",
    };

    fetch("http://127.0.0.1:5001/download", requestOptions)
      .then((response) => {
        return response.blob();
      })
      .then((data) => {
        var a = document.createElement("a");
        a.href = window.URL.createObjectURL(data);
        a.download = fileName;
        a.click();
      })
      .catch((error) => console.log("error", error));
  };

  const deleteHandler = async () => {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
      filename: file.Key,
      username,
      accessToken,
    });

    var requestOptions = {
      method: "DELETE",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch("http://127.0.0.1:5001/delete", requestOptions)
      .then((response) => response.text())
      .then((result) => console.log(result))
      .catch((error) => console.log("error", error));
  };

  return (
    <div>
      <p onClick={clickHandler}>{fileName}</p>{" "}
      <input type="button" value="delete" onClick={deleteHandler}></input>
      {toReadable(file.Size)} {file.LastModified}
      <hr />
    </div>
  );
};

export default FileDisplay;
