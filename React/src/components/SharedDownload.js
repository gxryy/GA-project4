import React, { useState, useEffect, Fragment } from "react";
import { Transition, Dialog } from "@headlessui/react";

import { useParams } from "react-router-dom";

const SharedDownload = (props) => {
  const { url_uuid } = useParams();
  const [fileName, setFileName] = useState("");
  const [loadModal, setloadModal] = useState(false);
  const [expired, setExpired] = useState(false);

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
        else if (response.status == 400) setExpired(true);
      })
      .then((result) => setFileName(result))
      .catch((error) => console.log("error", error));
  };

  const downloadHandler = () => {
    setloadModal(true);
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
        setTimeout(() => {
          setloadModal(false);
        }, 1000);
      })
      .catch((error) => console.log("error", error));
  };

  return (
    <>
      <div>
        {expired ? (
          <>
            <p className="text-6xl mt-4">Link has Expired</p>
          </>
        ) : (
          <>
            <p className="text-4xl my-2">Download File</p>
            <p className="mt-3 text-xl">Filename: {fileName}</p>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1.5  rounded  mt-4 w-80"
              onClick={downloadHandler}
            >
              Download
            </button>
          </>
        )}
      </div>

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
                    Download
                  </Dialog.Title>
                  <img
                    src={require("../mediaAssets/download.gif")}
                    className="mx-auto"
                  ></img>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default SharedDownload;
