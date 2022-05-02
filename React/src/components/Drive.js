import React, { useContext, useState, useEffect } from "react";
import CognitoCtx from "../context/CognitoCtx";
import ExplorerCtx from "../context/ExplorerCtx";
import { useNavigate } from "react-router-dom";
import FileExplorer from "./FileExplorer";
import axios from "axios";

const Drive = () => {
  const navigate = useNavigate();
  const CognitoContext = useContext(CognitoCtx);

  const [storageUsed, setStorageUsed] = useState({
    totalSize: 0,
    numberOfObjects: 0,
  });
  const [fileList, setFileList] = useState({
    objectList: [],
    folderList: [],
    currentDirectory: "/",
  });

  let accessToken;
  let cognitoUser = CognitoContext.userPool.getCurrentUser();
  let username = cognitoUser.username;

  useEffect(() => {
    if (cognitoUser) {
      cognitoUser.getSession(function sessionCallback(err, session) {
        if (err) {
          navigate("/signin");
        } else if (!session.isValid()) {
          navigate("/signin");
        } else {
          accessToken = session.getAccessToken().getJwtToken();
          CognitoContext.accessToken = accessToken;
        }
      });
      getStorageUsed();
      getFileList(fileList.currentDirectory);
      console.log(cognitoUser);
      console.log(CognitoContext);
    } else {
      navigate("/");
    }
  }, []);

  // ----- FUNCTIONS ----- //

  const getStorageUsed = async () => {
    try {
      let response = await axios.post(
        "http://localhost:5001/getStorageUsed",
        {
          username,
          accessToken,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setStorageUsed(response.data);
    } catch (err) {
      throw new Error(err);
    }
  };

  const getFileList = async (path) => {
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
      setFileList(response.data);
    } catch (err) {
      throw new Error(err);
    }
  };

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

  return (
    <div>
      <h4>Drive component</h4>
      {/* <p>The auth token {authToken}</p> */}

      <h2>Total Storage Used: {toReadable(storageUsed.totalSize)}</h2>

      <ExplorerCtx.Provider value={{ fileList, setFileList }}>
        <FileExplorer />
      </ExplorerCtx.Provider>
    </div>
  );
};

export default Drive;
