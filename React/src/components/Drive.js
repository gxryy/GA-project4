import React, { useContext, useState, useEffect } from "react";
import CognitoCtx from "../context/CognitoCtx";
import { useNavigate } from "react-router-dom";
import FileExplorer from "./FileExplorer";
import axios from "axios";

const Drive = () => {
  const navigate = useNavigate();
  const CognitoContext = useContext(CognitoCtx);
  const [uploadFile, setUploadFile] = useState();
  const [storageUsed, setStorageUsed] = useState({
    totalSize: 0,
    numberOfObjects: 0,
  });
  const [fileList, setFileList] = useState({ objectList: [], folderList: [] });
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
      getStorageUsed();
      getFileList("/");
    } else {
      navigate("/");
    }
  }, []);

  // ----- FUNCTIONS ----- //

  const uploadHandler = async () => {
    const postFile = (file) => {
      return new Promise(async (resolve, reject) => {
        console.log(`posting`);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("username", cognitoUser.username);
        try {
          const result = await axios.post(
            "http://localhost:5001/files",
            formData,
            {
              headers: {
                Authorization: authToken,
                "Content-Type": "multipart/form-data",
              },
            }
          );
          console.log(`uploaded`);
          resolve(result.data);
        } catch (err) {
          reject(err);
        }
      });
    };
    console.log(uploadFile);
    console.log(uploadFile.length);

    for (let i = 0; i < uploadFile.length; i++) {
      await postFile(uploadFile[i]);
      console.log(`file ${i + 1} uploaded`);
    }

    // const result = await postFile({ uploadFile });
  };

  const fileSelectionHandler = (event) => {
    const file = event.target.files;
    setUploadFile(file);
  };

  const getStorageUsed = async () => {
    try {
      let response = await axios.post(
        "http://localhost:5001/getStorageUsed",
        {
          username: cognitoUser.username,
        },
        {
          headers: {
            Authorization: authToken,
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

      <input
        onChange={fileSelectionHandler}
        type="file"
        accept="*"
        multiple
      ></input>
      <input type="button" onClick={uploadHandler} value="upload"></input>

      <h3> Files View</h3>
      <FileExplorer fileList={fileList} />
    </div>
  );
};

export default Drive;
