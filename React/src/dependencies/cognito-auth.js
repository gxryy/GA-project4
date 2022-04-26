/*global WildRydes _config AmazonCognitoIdentity AWSCognito*/
// import * as jQuery from "../dependencies/jquery-3.1.0.js";
const AmazonCognitoIdentity = require("amazon-cognito-identity-js");

var cloud = window.cloud || {};

(function scopeWrapper() {
  var signinUrl = "/signin.html";

  var poolData = {
    UserPoolId: _config.cognito.userPoolId,
    ClientId: _config.cognito.userPoolClientId,
  };

  var userPool;

  if (
    !(
      _config.cognito.userPoolId &&
      _config.cognito.userPoolClientId &&
      _config.cognito.region
    )
  ) {
    // $("#noCognitoMessage").show();
    return;
  }

  userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

  if (typeof AWSCognito !== "undefined") {
    AWSCognito.config.region = _config.cognito.region;
  }

  cloud.signOut = function signOut() {
    userPool.getCurrentUser().signOut();
  };

  cloud.authToken = new Promise(function fetchCurrentAuthToken(
    resolve,
    reject
  ) {
    var cognitoUser = userPool.getCurrentUser();

    if (cognitoUser) {
      cognitoUser.getSession(function sessionCallback(err, session) {
        if (err) {
          reject(err);
        } else if (!session.isValid()) {
          resolve(null);
        } else {
          resolve(session.getIdToken().getJwtToken());
        }
      });
    } else {
      resolve(null);
    }
  });

  /*
   * Cognito User Pool functions
   */

  function register(email, password, onSuccess, onFailure) {
    var dataEmail = {
      Name: "email",
      Value: email,
    };
    var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(
      dataEmail
    );

    userPool.signUp(
      toUsername(email),
      password,
      [attributeEmail],
      null,
      function signUpCallback(err, result) {
        if (!err) {
          onSuccess(result);
        } else {
          onFailure(err);
        }
      }
    );
  }

  function signin(email, password, onSuccess, onFailure) {
    var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(
      {
        Username: toUsername(email),
        Password: password,
      }
    );

    var cognitoUser = createCognitoUser(email);
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: onSuccess,
      onFailure: onFailure,
    });
  }

  function verify(email, code, onSuccess, onFailure) {
    createCognitoUser(email).confirmRegistration(
      code,
      true,
      function confirmCallback(err, result) {
        if (!err) {
          onSuccess(result);
        } else {
          onFailure(err);
        }
      }
    );
  }

  function createCognitoUser(email) {
    return new AmazonCognitoIdentity.CognitoUser({
      Username: toUsername(email),
      Pool: userPool,
    });
  }

  function toUsername(email) {
    return email.replace("@", "-at-");
  }

  /*
   *  Event Handlers
   */

  function handleSignin(event) {
    var email = "#emailInputSignin";
    var password = "#passwordInputSignin";
    event.preventDefault();
    signin(
      email,
      password,
      function signinSuccess() {
        console.log("Successfully Logged In");
        window.location.href = "ride.html";
      },
      function signinError(err) {
        alert(err);
      }
    );
  }

  function handleRegister(event) {
    var email = "email";
    var password = "password";
    var password2 = "password2";

    var onSuccess = function registerSuccess(result) {
      var cognitoUser = result.user;
      console.log("user name is " + cognitoUser.getUsername());
      var confirmation =
        "Registration successful. Please check your email inbox or spam folder for your verification code.";
      if (confirmation) {
        window.location.href = "verify.html";
      }
    };
    var onFailure = function registerFailure(err) {
      alert(err);
    };
    event.preventDefault();

    if (password === password2) {
      register(email, password, onSuccess, onFailure);
    } else {
      alert("Passwords do not match");
    }
  }

  function handleVerify(event) {
    var email = "ver";
    var code = "code";
    event.preventDefault();
    verify(
      email,
      code,
      function verifySuccess(result) {
        console.log("call result: " + result);
        console.log("Successfully verified");
        alert(
          "Verification successful. You will now be redirected to the login page."
        );
        window.location.href = signinUrl;
      },
      function verifyError(err) {
        alert(err);
      }
    );
  }
})();
