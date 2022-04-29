import React, { useContext, useState, useEffect } from "react";
import CognitoCtx from "../context/CognitoCtx";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Drive = () => {
  const navigate = useNavigate();
  const CognitoContext = useContext(CognitoCtx);
  const [file, setFile] = useState();
  const [storageUsed, setStorageUsed] = useState(-1);
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
    } else {
      navigate("/");
    }
  }, []);

  // ----- FUNCTIONS ----- //
  async function postFile({ file }) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("username", cognitoUser.username);
    try {
      const result = await axios.post("http://localhost:5001/files", formData, {
        headers: {
          Authorization: authToken,
          "Content-Type": "multipart/form-data",
        },
      });
      return result.data;
    } catch (err) {
      throw new Error(err);
    }
  }

  const fileSelected = (event) => {
    const file = event.target.files[0];
    console.log(event.target.files);
    setFile(file);
  };

  const uploadHandler = async () => {
    const result = await postFile({ file });
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

      <input onChange={fileSelected} type="file" accept="*" multiple></input>
      <input type="button" onClick={uploadHandler} value="upload"></input>

      <h3> Files View</h3>
    </div>
  );
};

export default Drive;