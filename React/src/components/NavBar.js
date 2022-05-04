import React, { useContext, useState, useEffect } from "react";
import CognitoCtx from "../context/CognitoCtx";
import { useNavigate } from "react-router-dom";
import { Fragment } from "react";
import { Disclosure, Menu, Transition, Dialog } from "@headlessui/react";
import { MenuIcon, XIcon } from "@heroicons/react/outline";
import { nanoid } from "nanoid";
const AmazonCognitoIdentity = require("amazon-cognito-identity-js");

const NavBar = () => {
  const navigate = useNavigate();
  const CognitoContext = useContext(CognitoCtx);
  let cognitoUser = CognitoContext.userPool.getCurrentUser();
  let username = cognitoUser?.username;

  // DISPLAY CONFIG

  const navItemsLoggedIn = [
    { name: "Home", path: "/", action: function () {} },
    { name: "Drive", path: "/drive", action: function () {} },
  ];
  const navItemsLoggedOut = [
    { name: "Home", path: "/", action: function () {} },
    {
      name: "Register",
      path: "/",
      action: function () {
        setRegisterModal(true);
      },
    },
    {
      name: "Sign In",
      path: "/",
      action: function () {
        setSignInModal(true);
      },
    },
  ];
  const menuItemsLoggedIn = [
    {
      name: "Sign Out",
      path: "/",
      action: function () {
        cognitoUser?.signOut();
        setLoggedIn(0);
      },
    },
    {
      name: "Tester",
      path: "/signin",
    },
  ];
  const menuItemsLoggedOut = [
    {
      name: "Register",
      path: "",
      action: function () {
        setRegisterModal(true);
      },
    },
    {
      name: "Sign In",
      path: "",
      action: function () {
        setSignInModal(true);
      },
    },
  ];

  // STATES
  const [navigation, setNavItems] = useState(navItemsLoggedOut);
  const [menuItems, setMenuItems] = useState(menuItemsLoggedOut);

  const [loggedIn, setLoggedIn] = useState(0); // 0 = not logged in , 1 = logged in, 2 = logging in, 3 = auth error
  const [signInModal, setSignInModal] = useState(false);
  const [signinModalDisplay, setSigninModalDisplay] = useState(<></>);

  const [registrationStage, setRegistrationStage] = useState(0); // 0 = new sign up , 1 = verification, 2= OTP wrong,3 = loading, 4=requirements fail, 5=registration successful
  const [registerModal, setRegisterModal] = useState(false);
  const [registerModalDisplay, setRegisterModalDisplay] = useState(<></>);
  const [regFormDetails, setRegFormDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  // USE EFFECT HOOKS

  useEffect(() => {
    cognitoUser ? setLoggedIn(1) : setLoggedIn(0);
  }, []);

  useEffect(() => {
    if (loggedIn == 1) {
      //LOGGED IN
      setNavItems(navItemsLoggedIn);
      setMenuItems(menuItemsLoggedIn);
      setSignInModal(false);
    } else {
      // NOT LOGGED IN
      setNavItems(navItemsLoggedOut);
      setMenuItems(menuItemsLoggedOut);
      // display main sign in page if not logged in or there is an auth error
      if (loggedIn == 0 || loggedIn == 3) {
        setSigninModalDisplay(
          <form className="w-full max-w-sm" onSubmit={signInHandler}>
            {loggedIn == 3 ? (
              <font color="red">Invalid Credentials</font>
            ) : (
              <></>
            )}
            <div className="md:flex md:items-center mb-6">
              <div className="md:w-1/3">
                <label
                  className="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
                  htmlFor="inline-full-name"
                >
                  Email
                </label>
              </div>
              <div className="md:w-2/3">
                <input
                  className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
                  id="inline-email"
                  name="emailField"
                  type="text"
                />
              </div>
            </div>
            <div className="md:flex md:items-center mb-6">
              <div className="md:w-1/3">
                <label
                  className="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
                  htmlFor="inline-password"
                >
                  Password
                </label>
              </div>
              <div className="md:w-2/3">
                <input
                  className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
                  id="inline-password"
                  name="passwordField"
                  type="password"
                />
              </div>
            </div>
            <div className="md:flex md:items-center justify-center">
              <div className="md:w-1/3">
                <button
                  type="submit"
                  className="shadow bg-purple-500 hover:bg-purple-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded"
                >
                  Sign In
                </button>
              </div>
            </div>
          </form>
        );
      } else {
        // show loading
        setSigninModalDisplay(
          <img
            src={require("../mediaAssets/loading_spinner.gif")}
            className="mx-auto"
          ></img>
        );
      }
    }
  }, [loggedIn]);

  useEffect(() => {
    if (registrationStage == 0 || registrationStage == 4) {
      // DISPLAY MAIN REGISTRATION PAGE
      setRegisterModalDisplay(
        <form className="w-full max-w-lg" onSubmit={registrationHandler}>
          <div className="flex flex-wrap -mx-3 mb-6">
            <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
              <label
                className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                htmlFor="grid-first-name"
              >
                First Name
              </label>
              <input
                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-red-500 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                id="grid-first-name"
                type="text"
                name="firstNameField"
                required
                defaultValue={regFormDetails.firstName}
              />
            </div>
            <div className="w-full md:w-1/2 px-3">
              <label
                className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                htmlFor="grid-last-name"
              >
                Last Name
              </label>
              <input
                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                id="grid-last-name"
                type="text"
                name="lastNameField"
                required
                defaultValue={regFormDetails.lastName}
              />
            </div>
          </div>
          <div className="flex flex-wrap -mx-3 mb-6">
            <div className="w-full md:w-full px-3 mb-6 md:mb-0">
              <label
                className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                htmlFor="grid-email"
              >
                Email
              </label>
              <input
                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-red-500 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                id="grid-email"
                type="text"
                name="emailField"
                required
                defaultValue={regFormDetails.email}
              />
            </div>
          </div>
          <div className="flex flex-wrap -mx-3 mb-6">
            <div className="w-full px-3">
              <label
                className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                htmlFor="grid-password"
              >
                Password
              </label>
              <input
                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                id="grid-password"
                type="password"
                name="passwordField"
                required
                pattern=".{6,}"
              />
            </div>
            <div className="w-full px-3">
              <label
                className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                htmlFor="grid-password2"
              >
                confirm password
              </label>
              <input
                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                id="grid-password2"
                type="password"
                name="password2Field"
                required
                pattern=".{6,}"
              />
            </div>
          </div>
          <div className="md:flex md:items-center justify-center">
            <div className="md:w-1/3">
              <button
                type="submit"
                className="shadow bg-purple-500 hover:bg-purple-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded"
              >
                Register
              </button>
            </div>
          </div>
        </form>
      );
    } else if (registrationStage == 1 || registrationStage == 2) {
      // VERIFICATION
      setRegisterModalDisplay(
        <>
          <div
            id="otp"
            className="flex flex-row justify-center text-center px-2 mt-3"
          >
            <h2>Enter the Verification Code sent to {regFormDetails.email}</h2>
          </div>
          {registrationStage == 2 ? (
            <>
              <div className="  justify-center text-center px-2 mt-3">
                <font color="red">Invalid Verification Code</font>
                <p onClick={resendHandler}>Resend Verification Code</p>
              </div>
            </>
          ) : (
            <></>
          )}
          <form onSubmit={OTPHandler}>
            <div
              id="otp"
              className="flex flex-row justify-center text-center px-2 mt-3"
            >
              <input
                className="m-2 border h-10 w-1/2 text-center form-control rounded"
                type="text"
                id="otp"
                name="otp"
                maxLength="6"
              />
            </div>
            <div className="md:flex md:items-center justify-center mt-3">
              <div className="md:w-1/3">
                <button
                  type="submit"
                  className="shadow bg-purple-500 hover:bg-purple-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded"
                >
                  Verify
                </button>
              </div>
            </div>
          </form>
        </>
      );
    } else if (registrationStage == 5) {
      setRegisterModalDisplay(<h1>Registration Successful</h1>);
    } else {
      setRegisterModalDisplay(
        <img
          src={require("../mediaAssets/loading_spinner.gif")}
          className="mx-auto"
        ></img>
      );
    }
  }, [registrationStage]);

  function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
  }

  // EVENT HANDLERS

  const signInHandler = (event) => {
    setLoggedIn(2);
    event.preventDefault();
    let email = event.target.emailField.value;
    let password = event.target.passwordField.value;
    let authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(
      { Username: email, Password: password }
    );
    let userData = {
      Username: email,
      Pool: CognitoContext.userPool,
    };

    let cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: function (result) {
        var accessToken = result.getAccessToken().getJwtToken();
        CognitoContext.accessToken = accessToken;
        console.log(`accessToken is ${accessToken}`);
        setLoggedIn(1);
        navigate("/drive");
      },

      onFailure: function (err) {
        console.log(`login FAILED`);
        if (err.code == "UserNotConfirmedException") {
          setRegFormDetails({ email });
          setRegistrationStage(1);
          setSignInModal(false);
          setRegisterModal(true);
          resendHandler();
        } else {
          setLoggedIn(3);
        }
        setLoggedIn(3);
      },
    });
  };

  const registrationHandler = (event) => {
    let field = event.target;
    let email = field.emailField.value;
    let firstName = field.firstNameField.value;
    let lastName = field.lastNameField.value;
    let password = field.passwordField.value;
    let password2 = field.password2Field.value;
    setRegFormDetails({
      email: email,
      firstName: firstName,
      lastName: lastName,
    });

    event.preventDefault();
    if (password === password2) {
      setRegistrationStage(3);
      let myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      let raw = JSON.stringify({
        email,
        firstName,
        lastName,
        password,
      });

      var requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow",
      };

      fetch("http://localhost:5001/register", requestOptions)
        .then((response) => {
          if (response.status == 200 || response.status == 201)
            setRegistrationStage(1);
        })
        .catch((error) => alert(error));
    } else setRegistrationStage(4);
  };

  const OTPHandler = (event) => {
    event.preventDefault();
    cognitoUser = new AmazonCognitoIdentity.CognitoUser({
      Username: regFormDetails.email,
      Pool: CognitoContext.userPool,
    });
    setRegistrationStage(3);
    let verificationCode = event.target.otp.value;

    cognitoUser.confirmRegistration(
      verificationCode,
      true,
      function (err, result) {
        if (err) {
          setRegistrationStage(2);
          return;
        }

        setRegistrationStage(5);
      }
    );
  };

  const resendHandler = () => {
    cognitoUser = new AmazonCognitoIdentity.CognitoUser({
      Username: regFormDetails.email,
      Pool: CognitoContext.userPool,
    });

    cognitoUser.resendConfirmationCode(function (err, result) {
      if (err) {
        alert(err.message || JSON.stringify(err));
        return;
      }
    });
  };

  return (
    <>
      {/* ----- NAVBAR ----- */}
      <Disclosure as="nav" className="bg-gray-800">
        {({ open }) => (
          <>
            <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
              <div className="relative flex items-center justify-between h-16">
                <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                  {/* Mobile menu button*/}
                  <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
                <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
                  <div className="flex-shrink-0 flex items-center">
                    <img
                      className="block lg:hidden h-8 w-auto"
                      src="https://tailwindui.com/img/logos/workflow-mark-indigo-500.svg"
                      alt="A la cloud"
                    />
                    <img
                      className="hidden lg:block h-8 w-auto"
                      src="https://tailwindui.com/img/logos/workflow-logo-indigo-500-mark-white-text.svg"
                      alt="A la cloud"
                    />
                  </div>
                  <div className="hidden sm:block sm:ml-6">
                    <div className="flex space-x-6">
                      {navigation.map((item) => (
                        <button
                          key={item.name}
                          onClick={() => {
                            item.action();
                            navigate(item.path);
                          }}
                          className={classNames(
                            "text-gray-300 hover:bg-gray-700 hover:text-whitepx-3 py-2 rounded-md text-sm font-medium px-5"
                          )}
                          aria-current={item.current ? "page" : undefined}
                        >
                          {item.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                  {/* Profile dropdown */}
                  <Menu as="div" className="ml-3 relative">
                    <div>
                      <Menu.Button className="bg-gray-800 flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                        <span className="sr-only">Open user menu</span>
                        <img
                          className="h-8 w-8 rounded-full"
                          src="https://toppng.com/uploads/preview/roger-berry-avatar-placeholder-11562991561rbrfzlng6h.png"
                          alt=""
                        />
                      </Menu.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                        {menuItems.map((item) => (
                          <Menu.Item key={nanoid()}>
                            {({ active }) => (
                              <button
                                onClick={() => {
                                  item?.action();
                                  navigate(item.path);
                                }}
                                className={classNames(
                                  active ? "bg-gray-100" : "text-gray-900",
                                  "group flex w-full items-center rounded-md px-2 py-2 text-sm"
                                )}
                              >
                                {item.name}
                              </button>
                            )}
                          </Menu.Item>
                        ))}
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
              </div>
            </div>

            <Disclosure.Panel className="sm:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navigation.map((item) => (
                  <Disclosure.Button
                    key={item.name}
                    as="a"
                    href={item.href}
                    onClick={() => {
                      item.action();
                      navigate(item.path);
                    }}
                    className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                    aria-current={item.current ? "page" : undefined}
                  >
                    {item.name}
                  </Disclosure.Button>
                ))}
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>

      {/* ----- SIGN IN MODAL ----- */}

      <Transition appear show={signInModal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setSignInModal(false)}
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
                    Sign In
                  </Dialog.Title>
                  <div className="mt-2">{signinModalDisplay}</div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* ----- REGISTER MODAL ----- */}

      <Transition appear show={registerModal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setRegisterModal(false)}
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
                    Register
                  </Dialog.Title>
                  <div className="mt-2">{registerModalDisplay}</div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default NavBar;
