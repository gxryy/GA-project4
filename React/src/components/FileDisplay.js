import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CognitoCtx from "../context/CognitoCtx";
import axios from "axios";
import AxiosStream from "axios-stream";

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
    try {
      let downFileName = fileName;
      let extensionName = "";
      let axiosConfig = {
        method: "post",
        url: "http://localhost:5001/download",
        // responseType: "stream",
        headers: {
          Authorization: authToken,
          "Content-Type": "application/json",
        },
        data: {
          username: cognitoUser.username,
          Key: file.Key,
        },
      };
      AxiosStream.download(downFileName, extensionName, axiosConfig);

      // let response = await axios({
      //   method: "get",
      //   url: "http://localhost:5001/download",
      //   // responseType: "stream",
      //   headers: {
      //     Authorization: authToken,
      //     "Content-Type": "application/json",
      //   },
      //   data: {
      //     username: cognitoUser.username,
      //     Key: file.Key,
      //   },
      // });
      // console.log(response);

      // download(response.data, fileName);

      // response.data.pipe(fs.createWriteStream("/temp/my.pdf"));

      // const blob = new Blob([response.data], {
      //   type: "application/octet-stream",
      // });

      // saveAs(blob, fileName);

      // console.log(response);
    } catch (err) {
      throw new Error(err);
    }
  };

  return (
    <div>
      <p onClick={clickHandler}>{fileName}</p> {toReadable(file.Size)}{" "}
      {file.LastModified}
    </div>
  );
};

export default FileDisplay;
