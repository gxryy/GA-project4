import React, { useContext } from "react";
import FolderDisplay from "./FolderDisplay";
import FileDisplay from "./FileDisplay";
import ExplorerCtx from "../context/ExplorerCtx";
import CognitoCtx from "../context/CognitoCtx";
import { nanoid } from "nanoid";

const FileExplorer = () => {
  const CognitoContext = useContext(CognitoCtx);
  const ExplorerContext = useContext(ExplorerCtx);
  let cognitoUser = CognitoContext.userPool.getCurrentUser();

  let fileList = ExplorerContext.fileList;

  const createFolderHandler = (event) => {
    event.preventDefault();
    let folderName = event.target.folderName.value;
    let username = cognitoUser.username;
    console.log(username);
    console.log(folderName);
    console.log(ExplorerContext.fileList.currentDirectory);

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

  return (
    <div>
      <h3>File Explorer</h3>
      <p>The current path is {ExplorerContext.fileList.currentDirectory}</p>
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
