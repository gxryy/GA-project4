import React, { useContext, useState, useEffect } from "react";
import CognitoCtx from "../context/CognitoCtx";
import { useNavigate } from "react-router-dom";
import { nanoid } from "nanoid";

const CreditHistory = () => {
  const CognitoContext = useContext(CognitoCtx);
  let cognitoUser = CognitoContext.userPool.getCurrentUser();
  let accessToken = CognitoContext.accessToken;
  let username = cognitoUser.username;
  const navigate = useNavigate();

  const [creditHistory, setCreditHistory] = useState([]);
  const [creditRemaining, setCreditRemaining] = useState(0);

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
      getCreditHistory();
      getCreditsRemaining();
    } else {
      navigate("/");
    }
  }, []);

  useEffect(() => {
    console.log(creditHistory);
  }, [creditHistory]);

  const getCreditHistory = () => {
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

    fetch("http://localhost:5001/drive/getcredithistory", requestOptions)
      .then((response) => response.text())
      .then((result) => setCreditHistory(JSON.parse(result)))
      .catch((error) => console.log("error", error));
  };

  const getCreditsRemaining = async () => {
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

    fetch("http://localhost:5001/drive/getcredits", requestOptions)
      .then((response) => response.text())
      .then((result) => setCreditRemaining(result))
      .catch((error) => console.log("error", error));
  };

  return (
    <>
      <div>
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 table-auto">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                Date
              </th>

              <th scope="col" className="px-6 py-3">
                Credit Adjustment
              </th>
              <th scope="col" className="px-6 py-3">
                Adjustment Type
              </th>
            </tr>
          </thead>{" "}
          <tbody>
            {creditHistory.map((credit) => {
              let date = new Date(credit.date);
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
                      <p className="text-lg my-2 mb-1">{Date(credit.date)}</p>
                    </div>
                  </th>

                  <td className="px-6 py-4">
                    <p className="text-lg my-2 mb-1">
                      {credit.credit_adjustment}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex-col">
                      <p className="text-lg my-2 mb-1">
                        {credit.adjustment_type}
                      </p>
                      <p className="text-lg my-2 mb-1">{credit?.bill_month}</p>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td className="text-right">
                <p className="mr-3 text-2xl">Remaining Credits:</p>
              </td>
              <td>
                <p className="ml-3 text-2xl text-left">{creditRemaining}</p>
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </>
  );
};

export default CreditHistory;
