import React, { useContext, useState } from "react";
import FolderDisplay from "./FolderDisplay";
import FileDisplay from "./FileDisplay";
import ExplorerCtx from "../context/ExplorerCtx";
import CognitoCtx from "../context/CognitoCtx";
import { nanoid } from "nanoid";
import axios from "axios";

const FileExplorer = () => {
  const CognitoContext = useContext(CognitoCtx);
  const ExplorerContext = useContext(ExplorerCtx);
  let cognitoUser = CognitoContext.userPool.getCurrentUser();
  const [uploadFile, setUploadFile] = useState();

  let authToken;
  let fileList = ExplorerContext.fileList;

  const createFolderHandler = (event) => {
    event.preventDefault();
    let folderName = event.target.folderName.value;
    let username = cognitoUser.username;

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify({
        username: username,
        path: `${ExplorerContext.fileList.currentDirectory + folderName}/`,
      }),
      redirect: "follow",
    };

    fetch("http://localhost:5001/createFolder", requestOptions)
      .then((response) => {
        if (response.ok) {
          console.log(`folder created`);
        } else console.log(`Error creating folder`);
      })
      .catch((error) => console.log("error", error));
  };

  const uploadHandler = async () => {
    const postFile = (file) => {
      console.log(file);
      return new Promise(async (resolve, reject) => {
        console.log(`posting`);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("username", cognitoUser.username);
        formData.append("path", fileList.currentDirectory);
        try {
          const result = await axios.post(
            "http://localhost:5001/upload",
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

  return (
    <div>
      <h3>File Explorer</h3>
      <p>The current path is {fileList.currentDirectory}</p>
      <input
        onChange={fileSelectionHandler}
        type="file"
        accept="*"
        multiple
      ></input>
      <input type="button" onClick={uploadHandler} value="upload"></input>
      <form onSubmit={createFolderHandler}>
        <input type="text" name="folderName"></input>
        <input type="submit" value="Create Folder"></input>
      </form>

      <hr />
      {fileList.folderList.map((folder) => (
        <FolderDisplay folder={folder} key={nanoid()}></FolderDisplay>
      ))}
      {fileList.objectList.map((file) => (
        <FileDisplay file={file} key={nanoid()}></FileDisplay>
      ))}
    </div>
  );
};

export default FileExplorer;
