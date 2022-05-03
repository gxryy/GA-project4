import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const SharedDownload = (props) => {
  const { url_uuid } = useParams();
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    getFileName();
  }, []);

  const getFileName = () => {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify({
        url_uuid,
      }),
      redirect: "follow",
    };

    fetch("http://localhost:5001/publicfiledetails", requestOptions)
      .then((response) => {
        if (response.status == 200) return response.text();
      })
      .then((result) => setFileName(result))
      .catch((error) => console.log("error", error));
  };

  const downloadHandler = () => {
    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    let requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify({
        url_uuid,
      }),
      redirect: "follow",
    };

    fetch("http://localhost:5001/publicdownload", requestOptions)
      .then((response) => response.blob())
      .then((data) => {
        var a = document.createElement("a");
        a.href = window.URL.createObjectURL(data);
        a.download = fileName;
        a.click();
      })
      .catch((error) => console.log("error", error));
  };

  return (
    <div>
      <h1> In download component</h1>
      <h4>Filename: {fileName}</h4>
      <input type="button" value="download" onClick={downloadHandler}></input>
    </div>
  );
};

export default SharedDownload;
