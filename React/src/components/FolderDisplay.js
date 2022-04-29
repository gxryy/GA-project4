import React from "react";

const FolderDisplay = (props) => {
  let folder = props.folder;
  return (
    <div>
      <h1>{folder}</h1>
    </div>
  );
};

export default FolderDisplay;
