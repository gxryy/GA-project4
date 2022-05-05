import { nanoid } from "nanoid";
import React, { useEffect, useContext, useState, Fragment } from "react";
import { Transition, Dialog } from "@headlessui/react";

import { useNavigate } from "react-router-dom";
import CognitoCtx from "../context/CognitoCtx";

const ShareManager = () => {
  const CognitoContext = useContext(CognitoCtx);
  const [linkArray, setLinkArray] = useState([]);

  let cognitoUser = CognitoContext.userPool.getCurrentUser();
  let accessToken = CognitoContext.accessToken;
  let username = cognitoUser.username;
  const navigate = useNavigate();

  const [currentLink, setCurrentLink] = useState("");
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  useEffect(() => {
    if (cognitoUser) {
      cognitoUser.getSession(function sessionCallback(err, session) {
        if (err) {
          navigate("/signin");
        } else if (!session.isValid()) {
          navigate("/signin");
        } else {
          accessToken = session.getAccessToken().getJwtToken();
          CognitoContext.accessToken = accessToken;
        }
      });
      getLinks();
    } else {
      navigate("/");
    }
  }, []);

  const getLinks = () => {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify({
        username,
        accessToken,
      }),
      redirect: "follow",
    };

    fetch("http://localhost:5001/drive/getallsharedlink", requestOptions)
      .then((response) => response.text())
      .then((data) => {
        setLinkArray(JSON.parse(data));
      })
      .catch((error) => console.log("error", error));
  };

  const editHandler = (event) => {
    event.preventDefault();
    let expiry = new Date();
    if (event.target.expiryBox.checked) expiry = new Date("2099-12-31");
    else expiry = new Date(event.target.datetime.value);

    let expirystr = expiry.toISOString();
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify({
        url_uuid: currentLink.url_uuid,
        newExpiry: expirystr,
        username,
        accessToken,
      }),
      redirect: "follow",
    };

    fetch("http://127.0.0.1:5001/drive/editlinkexpiry", requestOptions)
      .then((response) => response.text())
      .then((result) => {
        console.log(result);
        setEditModal(false);
        getLinks();
      })
      .catch((error) => console.log("error", error));
  };

  const deleteHandler = () => {
    console.log(`in delete`);
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var requestOptions = {
      method: "DELETE",
      headers: myHeaders,
      body: JSON.stringify({
        url_uuid: currentLink.url_uuid,
        username,
        accessToken,
      }),
      redirect: "follow",
    };

    fetch("http://localhost:5001/drive/deletelink", requestOptions)
      .then((response) => response.text())
      .then((result) => {
        console.log(result);
        setDeleteModal(false);
        getLinks();
      })
      .catch((error) => console.log("error", error));
  };

  return (
    <>
      {/* ----- MAIN PAGE ----- */}
      <div>
        <div className="md:w-1/3 text-3xl">
          <p>Shared Files</p>
        </div>
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 table-auto">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                File name
              </th>

              <th scope="col" className="px-6 py-3">
                Expiry
              </th>
              <th scope="col" className="px-6 py-3">
                Download Count
              </th>
              <th scope="col" className="px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          {linkArray.map((link) => {
            return (
              <tbody key={nanoid()}>
                <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 transition duration-300 ease-in-out hover:bg-gray-100 dark:hover:bg-gray-600">
                  <th
                    scope="row"
                    className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap"
                  >
                    <div className=" flex flex-col">
                      <p className="text-2xl my-2 mb-1">{link.fileName}</p>
                      <a
                        href={`http://localhost:3000/download/${link.url_uuid}`}
                      >{`http://localhost:3000/download/${link.url_uuid}`}</a>
                    </div>
                  </th>

                  <td className="px-6 py-4">{link.expiry}</td>
                  <td className="px-6 py-4">{link.download_counter}</td>

                  <td className="px-2 py-4 text-right">
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1.5 px-2 rounded mx-2"
                      onClick={() => {
                        setCurrentLink(link);
                        setEditModal(true);
                      }}
                    >
                      Edit Expiry
                    </button>
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1.5 px-2 rounded mx-2"
                      onClick={() => {
                        setCurrentLink(link);
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

      {/* ----- EDIT MODAL ----- */}

      <Transition appear show={editModal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setEditModal(false)}
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
                    Edit Expiry
                  </Dialog.Title>

                  <form onSubmit={editHandler}>
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
                      value="Edit"
                    ></input>
                  </form>
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
                    Delete Shared Link
                  </Dialog.Title>
                  <p>{currentLink.fileName} will be deleted.</p>
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

export default ShareManager;
