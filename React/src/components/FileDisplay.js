import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CognitoCtx from "../context/CognitoCtx";

const FileDisplay = (props) => {
  const navigate = useNavigate();
  const CognitoContext = useContext(CognitoCtx);

  let authToken;
  let cognitoUser = CognitoContext.userPool.getCurrentUser();

  useEffect(() => {
    if (cognitoUser) {
      cognitoUser.getSession(function sessionCallback(err, session) {
        if (err) {
          navigate("/signin");
        } else if (!session.isValid()) {
          navigate("/signin");
        } else {
          authToken = session.getIdToken().getJwtToken();
        }
      });
    } else {
      navigate("/");
    }
  }, []);

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
        username: cognitoUser.username,
        Key: file.Key,
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

  return (
    <div>
      <p onClick={clickHandler}>{fileName}</p> {toReadable(file.Size)}{" "}
      {file.LastModified}
    </div>
  );
};

export default FileDisplay;
