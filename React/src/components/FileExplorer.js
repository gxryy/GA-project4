import React from "react";
import FolderDisplay from "./FolderDisplay";
import FileDisplay from "./FileDisplay";
import { nanoid } from "nanoid";

const FileExplorer = (props) => {
  let fileList = props.fileList;
  console.log(fileList);

  return (
    <div>
      <h1> This is the file explorer</h1>
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
