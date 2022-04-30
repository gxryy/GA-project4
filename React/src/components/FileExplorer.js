import React, { useContext } from "react";
import FolderDisplay from "./FolderDisplay";
import FileDisplay from "./FileDisplay";
import ExplorerCtx from "../context/ExplorerCtx";
import { nanoid } from "nanoid";

const FileExplorer = () => {
  const ExplorerContext = useContext(ExplorerCtx);
  let fileList = ExplorerContext.fileList;
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
