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
  const [credits, setCredits] = useState(0);
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
      getCreditsRemaining();
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
        "http://localhost:5001/drive/getStorageUsed",
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

  const getCreditsRemaining = async () => {
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

    fetch("http://localhost:5001/drive/getcredits", requestOptions)
      .then((response) => response.text())
      .then((result) => setCredits(result))
      .catch((error) => console.log("error", error));
  };

  const getFileList = async (path) => {
    try {
      let response = await axios.post(
        "http://localhost:5001/drive/getFileList",
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
      <div className="flex justify-around text-lg bg-gray-200">
        <p>Total Storage Used: {toReadable(storageUsed.totalSize)}</p>
        <p onClick={() => navigate("/credithistory")}>
          Credits remaining: {credits}
        </p>
      </div>
      <div className="md:w-1/3 text-3xl">
        <p>My Drive</p>
      </div>

      <ExplorerCtx.Provider value={{ fileList, setFileList, getFileList }}>
        <FileExplorer />
      </ExplorerCtx.Provider>
      <input
        type="button"
        value="manage"
        onClick={() => navigate("/shareManager")}
      ></input>
    </div>
  );
};

export default Drive;
