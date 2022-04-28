import React, { useContext, useState, useEffect } from "react";
import CognitoCtx from "../context/CognitoCtx";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Drive = () => {
  const navigate = useNavigate();
  const CognitoContext = useContext(CognitoCtx);
  const [file, setFile] = useState();
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

  //   if (cognitoUser) {
  //     cognitoUser.getSession(function sessionCallback(err, session) {
  //       if (err) {
  //         notAuth();
  //       } else if (!session.isValid()) {
  //         notAuth();
  //       } else {
  //         console.log(`JWT TOKEN`);
  //         authToken = session.getIdToken().getJwtToken();
  //       }
  //     });
  //   } else {
  //     notAuth();
  //   }
  // ----- FUNCTIONS ----- //
  async function postFile({ file, description }) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("username", cognitoUser.username);

    const result = await axios.post("http://localhost:5001/files", formData, {
      headers: {
        Authorization: authToken,
        "Content-Type": "multipart/form-data",
      },
    });
    return result.data;
  }

  const fileSelected = (event) => {
    const file = event.target.files[0];
    console.log(event.target.files);
    setFile(file);
  };

  const uploadHandler = async () => {
    const result = await postFile({ file });
  };

  return (
    <div>
      <h4>Drive component</h4>
      {/* <p>The auth token {authToken}</p> */}

      <input onChange={fileSelected} type="file" accept="*" multiple></input>
      <input type="button" onClick={uploadHandler} value="upload"></input>

      <h3> Files View</h3>
    </div>
  );
};

export default Drive;
