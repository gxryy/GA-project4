import React, { useContext, useState, useEffect } from "react";
import CognitoCtx from "../context/CognitoCtx";
import { useNavigate } from "react-router-dom";
import { nanoid } from "nanoid";

const UsageHistory = () => {
  const CognitoContext = useContext(CognitoCtx);
  let cognitoUser = CognitoContext.userPool.getCurrentUser();
  let accessToken = CognitoContext.accessToken;
  let username = cognitoUser.username;
  const navigate = useNavigate();

  const [usageHistory, setUsageHistory] = useState(null);
  const [usageDisplay, setUsageDisplay] = useState(<></>);

  useEffect(() => {
    if (cognitoUser) {
      cognitoUser.getSession(function sessionCallback(err, session) {
        if (err) {
          navigate("/");
        } else if (!session.isValid()) {
          navigate("/");
        } else {
          accessToken = session.getAccessToken().getJwtToken();
          CognitoContext.accessToken = accessToken;
        }
      });
    } else {
      navigate("/");
    }
  }, []);

  useEffect(() => {
    if (usageHistory) {
      setUsageDisplay(
        <div className="w-10/12 mx-auto my-3">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 table-auto">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Date
                </th>

                <th scope="col" className="px-6 py-3">
                  Storage Used
                </th>
              </tr>
            </thead>
            <tbody>
              {usageHistory.details.map((usage) => {
                return (
                  <tr
                    key={nanoid()}
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 transition duration-300 ease-in-out hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    <th
                      scope="row"
                      className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap"
                    >
                      <div className=" flex flex-col">
                        <p className="text-lg my-2 mb-1">{usage.date}</p>
                      </div>
                    </th>

                    <td className="px-6 py-4">
                      <p className="text-lg my-2 mb-1">
                        {toReadable(usage.storage_used)}
                      </p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td className="text-right">
                  <p className="mr-3 text-2xl">Average Storage:</p>
                </td>
                <td>
                  <p className="ml-3 text-2xl text-left">
                    {toReadable(usageHistory.averageUsage)}
                  </p>
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      );
    }
  }, [usageHistory]);

  const getUsageHistory = (event) => {
    event.preventDefault();
    let date = new Date(event.target.date.value);
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
      username,
      year: date.getFullYear(),
      month: date.getMonth() + 1,
    });

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch("http://127.0.0.1:5001/getMonthUsage", requestOptions)
      .then((response) => response.text())
      .then((result) => setUsageHistory(JSON.parse(result)))
      .catch((error) => console.log("error", error));
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
  return (
    <>
      <form onSubmit={getUsageHistory} className="my-3">
        <input type="month" name="date"></input>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1.5 px-2 rounded mx-2"
        >
          Get Details
        </button>
      </form>

      {usageDisplay}
    </>
  );
};

export default UsageHistory;
