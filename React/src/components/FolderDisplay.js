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
  let cognitoUser = CognitoContext.userPool.getCurrentUser();
  let username = cognitoUser.username;
  let accessToken = CognitoContext.accessToken;

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
          username,
          accessToken,
          path,
        },
        {
          headers: {
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
