import React, { useContext, useState, Fragment, useEffect } from "react";
import { Transition, Dialog } from "@headlessui/react";
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
  const [loadModal, setloadModal] = useState(false);
  const [loadModalStage, setloadModalStage] = useState(0); // 0= nothing 1=uploading, 2=ul completed, 3= downloading
  const [loadModalDisplay, setloadModalDisplay] = useState(<></>);
  const [shareModal, setShareModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [shareDetails, setShareDetails] = useState({
    fileName: "",
    fileKey: "",
    expiry: "",
    url: "",
  });
  const [shareStage, setShareStage] = useState(0); // 0= nothing,  1 = expiry setter, 2=loading. 3=url page
  const [shareModalDisplay, setShareModalDisplay] = useState(<></>);
  const [fileToDelete, setFileToDelete] = useState({
    fileName: "",
    fileKey: "",
  });

  let fileList = ExplorerContext.fileList;

  useEffect(() => {
    if (loadModalStage == 1)
      setloadModalDisplay(
        <img
          src={require("../mediaAssets/uploading.gif")}
          className="mx-auto"
        ></img>
      );
    else if (loadModalStage == 2)
      setloadModalDisplay(<h1>Upload Completed</h1>);
    else if (loadModalStage == 3)
      setloadModalDisplay(
        <img
          src={require("../mediaAssets/download.gif")}
          className="mx-auto"
        ></img>
      );
    else setloadModalDisplay(<></>);
  }, [loadModalStage]);

  useEffect(() => {
    console.log(shareDetails);
  }, [shareDetails]);

  useEffect(() => {
    if (shareStage == 1)
      setShareModalDisplay(
        <>
          <p>Sharing {shareDetails.fileName}</p>
          <p>Set Expiry:</p>
          <form onSubmit={getShareURLHandler}>
            <input type="datetime-local" name="datetime"></input>

            <div>
              <input type="checkbox" name="expiryBox" />
              <label
                className="form-check-label inline-block text-gray-800"
                htmlFor="flexCheckChecked"
              >
                No Expiry
              </label>
            </div>

            <input
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1.5  rounded  mt-4 w-full"
              value="Share"
            ></input>
          </form>
        </>
      );
    else if (shareStage == 2) {
      setShareModalDisplay(
        <img
          src={require("../mediaAssets/loading_spinner.gif")}
          className="mx-auto"
        ></img>
      );
    } else if (shareStage == 3) {
      setShareModalDisplay(
        <div>
          <p>File Name: {shareDetails.fileName}</p>
          <p>
            Expiry:{" "}
            {shareDetails.expiry == "2099-12-31T00:00:00.000Z"
              ? "No Expiry"
              : shareDetails.expiry}
          </p>
          <input
            className="w-full"
            type="text"
            value={shareDetails.url}
            readOnly
          ></input>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1.5  rounded  mt-4 w-full"
            onClick={() => {
              navigator.clipboard.writeText(shareDetails.url);
              setTimeout(() => {
                setShareModal(false);
              }, 2000);
            }}
          >
            Copy to Clipboard
          </button>
        </div>
      );
    } else setShareModalDisplay(<></>);
  }, [shareStage]);

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

  const getShareURLHandler = (event) => {
    event.preventDefault();
    let expiry = new Date();
    if (event.target.expiryBox.checked) expiry = new Date("2099-12-31");
    else expiry = new Date(event.target.datetime.value);
    setShareStage(2);

    let expirystr = expiry.toISOString();

    setShareDetails((prevState) => {
      console.log(prevState);
      return { ...prevState, expiry: expirystr };
    });

    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
      username,
      s3_key: shareDetails.fileKey,
      expiry: expirystr,
      accessToken,
    });

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch("http://localhost:5001/drive/getsharelink", requestOptions)
      .then((response) => response.text())
      .then((result) => {
        let response = JSON.parse(result);
        console.log(response);

        setShareDetails((prev) => {
          return {
            ...prev,
            url: `http://localhost:3000/download/${response.url_uuid}`,
          };
        });
        setShareStage(3);
      })
      .catch((error) => console.log("error", error));

    console.log(shareDetails.expiry);
  };

  const uploadHandler = async () => {
    setloadModal(true);
    setloadModalStage(1);
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
        setloadModalStage(2);
        getFileList(ExplorerContext.currentDirectory);
        setTimeout(() => setloadModal(false), 2000);
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

  const downloadHandler = async (fileKey) => {
    setloadModalStage(3);
    setloadModal(true);

    let arraySplit = fileKey.split("/");
    let fileName = arraySplit[arraySplit.length - 1];
    // --- FETCH ---
    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    let requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify({
        username,
        Key: fileKey,
        accessToken,
      }),
      redirect: "follow",
    };

    fetch("http://127.0.0.1:5001/drive/download", requestOptions)
      .then((response) => {
        return response.blob();
      })
      .then((data) => {
        var a = document.createElement("a");
        a.href = window.URL.createObjectURL(data);
        a.download = fileName;
        a.click();
        setTimeout(() => {
          setloadModal(false);
        }, 1000);
        setTimeout(() => {
          setloadModalStage(0);
        }, 1200);
      })
      .catch((error) => console.log("error", error));
  };

  const deleteHandler = async () => {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    var raw = JSON.stringify({
      fileKey: fileToDelete.fileKey,
      username,
      accessToken,
    });
    var requestOptions = {
      method: "DELETE",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };
    fetch("http://127.0.0.1:5001/drive/delete", requestOptions)
      .then((response) => response.text())
      .then((result) => {
        setDeleteModal(false);
      })
      .catch((error) => console.log("error", error));
  };

  const shareHandler = async (fileKey) => {
    console.log(fileKey);
    let arraySplit = fileKey.split("/");
    let fileName = arraySplit[arraySplit.length - 1];
    setShareModal(true);
    setShareStage(1);
    setShareDetails((prevState) => {
      return { ...prevState, fileName, fileKey };
    });
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

        <div className="flex justify-center my-1">
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

        <div className="w-11/12 mx-auto">
          <div className="flex flex-wrap overflow-hidden w-full my-1 ">
            {fileList.folderList.map((folder) => (
              <div
                className="my-2 px-8 w-1/6 overflow-hidden sm:w-1 md:w-1/3 lg:w-1/6 xl:w-1/6  rounded-xl"
                onClick={() =>
                  getFileList(
                    `${ExplorerContext.fileList.currentDirectory + folder}/`
                  )
                }
                key={nanoid()}
              >
                <img
                  src={require("../mediaAssets/folder.png")}
                  className="mx-auto"
                ></img>
                {folder}
              </div>
            ))}
          </div>
          <hr />
          <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 table-auto">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    File name
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Size
                  </th>
                  <th scope="col" className="px-6 py-3">
                    <span className="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>
              {fileList.objectList.map((file) => {
                if (file.Size == 0) return <></>;
                let arraySplit = file.Key.split("/");
                let fileName = arraySplit[arraySplit.length - 1];

                return (
                  <tbody key={nanoid()}>
                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 transition duration-300 ease-in-out hover:bg-gray-100 dark:hover:bg-gray-600">
                      <th
                        scope="row"
                        className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap"
                      >
                        {fileName}
                      </th>
                      <td className="px-6 py-4">{toReadable(file.Size)}</td>
                      <td className="px-2 py-4 text-right">
                        <button
                          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1.5 px-2 rounded mx-2"
                          onClick={() => downloadHandler(file.Key)}
                        >
                          Download
                        </button>
                        <button
                          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1.5 px-2 rounded mx-2"
                          onClick={() => shareHandler(file.Key)}
                        >
                          Share
                        </button>
                        <button
                          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1.5 px-2 rounded mx-2"
                          onClick={() => {
                            setFileToDelete({ fileName, fileKey: file.Key });
                            setDeleteModal(true);
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  </tbody>
                );
              })}
            </table>
          </div>
        </div>
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

      {/* ----- LOAD MODAL ----- */}

      <Transition appear show={loadModal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setloadModal(false)}
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
                    {loadModalStage == 3 ? `Download` : `Upload`}
                  </Dialog.Title>
                  {loadModalDisplay}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* ----- SHARE MODAL ----- */}

      <Transition appear show={shareModal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setShareModal(false)}
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
                    Share File
                  </Dialog.Title>

                  {shareModalDisplay}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* ----- DELETE MODAL ----- */}

      <Transition appear show={deleteModal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setDeleteModal(false)}
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
                    Confirm Delete
                  </Dialog.Title>
                  <p>{fileToDelete.fileName} will be deleted.</p>
                  <div className="flex justify-center">
                    <button
                      className="bg-gray-400 hover:bg-gray-600 text-white font-bold py-1.5  rounded mx-2 mt-4 w-1/2"
                      onClick={() => setDeleteModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white font-bold py-1.5  rounded mx-2 mt-4 w-1/2"
                      onClick={deleteHandler}
                    >
                      Confirm Delete
                    </button>
                  </div>
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
