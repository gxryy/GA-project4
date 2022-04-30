import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import CognitoCtx from "../context/CognitoCtx";
import ExplorerCtx from "../context/ExplorerCtx";
import axios from "axios";

const FolderDisplay = (props) => {
  const ExplorerContext = useContext(ExplorerCtx);
  const CognitoContext = useContext(CognitoCtx);
  const navigate = useNavigate();
  let folder = props.folder;
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

  const clickHandler = (event) => {
    let folder = event.target.innerText;
    console.log(folder);
    // console.log(ExplorerContext.fileList.currentDirectory);

    getFileList(`${ExplorerContext.fileList.currentDirectory + folder}/`);
  };

  const getFileList = async (path) => {
    console.log(`in get file list`);
    // Common Function from drive component
    try {
      let response = await axios.post(
        "http://localhost:5001/getFileList",
        {
          username: cognitoUser.username,
          path,
        },
        {
          headers: {
            Authorization: authToken,
            "Content-Type": "application/json",
          },
        }
      );
      ExplorerContext.setFileList(response.data);
    } catch (err) {
      throw new Error(err);
    }
  };

  return (
    <div>
      <h1>
        <a onClick={clickHandler}>{folder}</a>
      </h1>
    </div>
  );
};

export default FolderDisplay;
