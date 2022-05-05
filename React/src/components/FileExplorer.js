import React, { useContext, useState, Fragment, useEffect } from "react";
import { Transition, Dialog } from "@headlessui/react";

import FileDisplay from "./FileDisplay";
import ExplorerCtx from "../context/ExplorerCtx";
import CognitoCtx from "../context/CognitoCtx";
import { nanoid } from "nanoid";
import axios from "axios";

const FileExplorer = () => {
  const CognitoContext = useContext(CognitoCtx);
  const ExplorerContext = useContext(ExplorerCtx);
  let accessToken = CognitoContext.accessToken;
  let cognitoUser = CognitoContext.userPool.getCurrentUser();
  let username = cognitoUser.username;
  const [uploadFile, setUploadFile] = useState();
  const [createFolerModal, setCreateFolderModal] = useState(false);
  const [uploadModal, setUploadModal] = useState(false);
  const [uploadModalStage, setUploadModalStage] = useState(0); // 0= nothing 1=uploading, 2=completed
  const [uploadModalDisplay, setUploadModalDisplay] = useState(<></>);

  let fileList = ExplorerContext.fileList;

  useEffect(() => {
    if (uploadModalStage == 1)
      setUploadModalDisplay(
        <img
          src={require("../mediaAssets/uploading.gif")}
          className="mx-auto"
        ></img>
      );
    else if (uploadModalStage == 2) {
      setUploadModalDisplay(<h1>Upload Completed</h1>);
    } else setUploadModalDisplay(<></>);
  }, [uploadModalStage]);

  const createFolderHandler = (event) => {
    event.preventDefault();
    setCreateFolderModal(false);

    let folderName = event.target.folderNameField.value;
    let username = cognitoUser.username;
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify({
        username,
        accessToken,
        path: `${fileList.currentDirectory + folderName}/`,
      }),
      redirect: "follow",
    };
    fetch("http://localhost:5001/drive/createFolder", requestOptions)
      .then((response) => {
        if (response.ok) {
          console.log(`folder created`);
          console.log(fileList.currentDirectory);
          getFileList(`${fileList.currentDirectory}`);
        } else console.log(`Error creating folder`);
      })
      .catch((error) => console.log("error", error));
  };

  const uploadHandler = async () => {
    setUploadModal(true);
    setUploadModalStage(1);
    const postFile = (file) => {
      // console.log(file);
      return new Promise(async (resolve, reject) => {
        console.log(`posting`);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("username", cognitoUser.username);
        formData.append("path", fileList.currentDirectory);
        formData.append("accessToken", accessToken);
        try {
          const result = await axios.post(
            "http://localhost:5001/drive/upload",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
          resolve(result.data);
        } catch (err) {
          reject(err);
        }
      });
    };

    for (let i = 0; i < uploadFile.length; i++) {
      await postFile(uploadFile[i]);
      if (i == uploadFile.length - 1) {
        setUploadModalStage(2);
        setTimeout(() => setUploadModal(false), 2000);
      }

      console.log(`file ${i + 1} uploaded`);
    }
  };

  const fileSelectionHandler = (event) => {
    const file = event.target.files;
    setUploadFile(file);
  };

  const getFileList = async (path) => {
    try {
      let response = await axios.post(
        "http://localhost:5001/drive/getFileList",
        {
          username,
          accessToken,
          path,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      ExplorerContext.setFileList(response.data);
    } catch (err) {
      throw new Error(err);
    }
  };

  const backHandler = () => {
    let cwd = ExplorerContext.fileList.currentDirectory;
    let arraySplit = cwd.split("/");
    let folderName = arraySplit[arraySplit.length - 2];
    let nwd = cwd.slice(0, cwd.length - (folderName.length + 1));
    getFileList(nwd);
  };

  return (
    <>
      {/* ----- MAIN PAGE ----- */}
      <div>
        <div className="md:w-2/3 flex justify-between mx-auto my-2">
          <p>Path: {fileList.currentDirectory}</p>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1.5 px-4 rounded"
            onClick={backHandler}
          >
            Back
          </button>
        </div>

        <div className="flex justify-center my-2">
          <div className="flex justify-center mb-3 w-2/3">
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1.5  rounded mx-4 w-60"
              onClick={() => setCreateFolderModal(true)}
            >
              Create Folder
            </button>
            <input
              className="form-control
    block
    w-2/3
    px-3
    py-1.5
    text-base
    font-normal
    text-gray-700
    bg-white bg-clip-padding
    border border-solid border-gray-300
    rounded
    transition
    ease-in-out
    m-0
    focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
              onChange={fileSelectionHandler}
              type="file"
              accept="*"
              multiple
              id="formFileMultiple"
              multiple
            />
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1.5 px-4 rounded mx-4"
              onClick={uploadHandler}
            >
              Upload
            </button>
          </div>
        </div>

        <hr />
        <div className="w-10/12 mx-auto">
          <div class="flex flex-wrap overflow-hidden w-full my-2 ">
            {fileList.folderList.map((folder) => (
              <div
                className="my-2 px-6 w-1/6 overflow-hidden sm:w-1 md:w-1/3 lg:w-1/6 xl:w-1/6  rounded-xl"
                onClick={() =>
                  getFileList(
                    `${ExplorerContext.fileList.currentDirectory + folder}/`
                  )
                }
              >
                <img
                  src={require("../mediaAssets/folder.png")}
                  className="mx-auto"
                ></img>
                {folder}
              </div>
            ))}
          </div>
        </div>
        <hr />

        {fileList.objectList.map((file) => (
          <FileDisplay file={file} key={nanoid()}></FileDisplay>
        ))}
      </div>

      {/* ----- CREATE FOLDER MODAL ----- */}

      <Transition appear show={createFolerModal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setCreateFolderModal(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Folder Name
                  </Dialog.Title>
                  <div className="mt-2 ">
                    <form
                      className=" flex center"
                      onSubmit={createFolderHandler}
                    >
                      <input
                        className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500 mx-auto "
                        id="inline-folerName"
                        name="folderNameField"
                        type="text"
                      />
                      <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1.5 px-4 rounded mx-4"
                      >
                        Create
                      </button>
                    </form>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* ----- UPLOAD MODAL ----- */}

      <Transition appear show={uploadModal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setUploadModal(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Upload
                  </Dialog.Title>
                  {uploadModalDisplay}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default FileExplorer;
