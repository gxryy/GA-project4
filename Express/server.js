"use-strict";
// IMPORTS
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const request = require("request");
const { Op } = require("sequelize");
const fs = require("fs");
const AmazonCognitoIdentity = require("amazon-cognito-identity-js");
const { getFileStream, listObjects } = require("./s3");
const { sequelize, Users, Credits, Storage, Shares } = require("./models");
const PORT = process.env.PORT || 5001;

// CONFIGURATION
const app = express();
app.use(cors());
app.use(express.json()); //input parser for JSON
app.use(express.urlencoded({ extended: false }));

// FUNCTIONS
// Main function wrapped and executed onload
(() => {
  let options = {
    method: "GET",
    url: `https://cognito-idp.${process.env.AWS_COGNITO_REGION}.amazonaws.com/${process.env.AWS_COGNITO_USERPOOLID}/.well-known/jwks.json`,
    headers: {},
  };
  request(options, (error, response) => {
    if (error) throw new Error(error);
    fs.writeFile("JWKs.txt", response.body, function (err) {
      if (err) {
        console.log(err);
      }
    });
  });
})();

const average = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;

const getUsage = async (username, year, month) => {
  let firstDay = new Date(year, month - 1, 1);
  let lastDay = new Date(year, month, 0);

  try {
    const response = await Storage.findAll({
      attributes: ["date", "storage_used"],
      where: {
        [Op.and]: [
          { username },
          { date: { [Op.between]: [firstDay, lastDay] } },
        ],
      },
    });

    let averageUsage = average(
      response.map((entry) => parseInt(entry.storage_used))
    );

    return { averageUsage, details: response };
  } catch (err) {
    console.log(err);
  }
};

const getCost = (average) => {
  const costPer100GB = 250;
  return Math.floor((average / 10 ** 11) * costPer100GB * 100) / 100;
};

// ROUTER/CONTROLLER
const dbTestController = require("./controller/dbTestController");
app.use("/", dbTestController);
const driveController = require("./controller/driveController");
app.use("/drive/", driveController);

// ROUTES

app.post("/register", (req, res) => {
  console.log(`in register ep`);

  let email = req.body.email;
  let firstName = req.body.firstName;
  let lastName = req.body.lastName;
  let password = req.body.password;

  let userPool = new AmazonCognitoIdentity.CognitoUserPool({
    UserPoolId: process.env.AWS_COGNITO_USERPOOLID,
    ClientId: process.env.AWS_COGNITO_USERPOOLCLIENTID,
  });

  let attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute({
    Name: "email",
    Value: email,
  });

  let attributeFirstName = new AmazonCognitoIdentity.CognitoUserAttribute({
    Name: "given_name",
    Value: firstName,
  });

  let attributeLastName = new AmazonCognitoIdentity.CognitoUserAttribute({
    Name: "family_name",
    Value: lastName,
  });

  userPool.signUp(
    email,
    password,
    [attributeEmail, attributeFirstName, attributeLastName],
    null,
    async function signUpCallback(err, result) {
      if (!err) {
        let username = result.userSub;
        try {
          const userResponse = await Users.create({
            username,
            first_name: firstName,
            last_name: lastName,
            email: email,
            date_joined: Date.now(),
          });

          const creditResponse = await Credits.create({
            username,
            credit_adjustment: 1000,
            date: Date.now(),
            adjustment_type: "Initial Credits",
          });

          res.sendStatus(200);
        } catch (err) {
          console.log(err);
          res.sendStatus(500);
        }
      } else {
        console.log(`registration failure`);
        console.log(err);
        if (err.code == "UsernameExistsException") res.sendStatus(201);
        else {
          res.sendStatus(500);
        }
      }
    }
  );
});

app.post("/publicfiledetails", async (req, res) => {
  console.log(`in pub file details`);
  let url_uuid = req.body.url_uuid;
  try {
    const share = await Shares.findOne({
      where: { [Op.and]: [{ url_uuid }, { is_deleted: false }] },
    });
    let s3_key = share.dataValues.s3_key;
    let arraySplit = s3_key.split("/");
    let fileName = arraySplit[arraySplit.length - 1];
    res.send(fileName);
  } catch (err) {
    console.log(err);
    res.sendStatus(400);
  }
});

app.post("/publicdownload", async (req, res) => {
  console.log(`in public download`);
  let url_uuid = req.body.url_uuid;
  // expect to receive the url_uuid
  try {
    const share = await Shares.findOne({
      where: { [Op.and]: [{ url_uuid }, { is_deleted: false }] },
    });
    let shareDetails = share?.dataValues;
    console.log(shareDetails);
    let expiry = shareDetails.expiry;
    let now = new Date();
    if (expiry > now) {
      values = { download_counter: share.download_counter + 1 };
      const response = await share.update(values);
      const key = shareDetails.s3_key;
      const readStream = getFileStream(key);
      readStream.pipe(res);
    } else {
      res.sendStatus(400);
    }
  } catch (err) {
    console.log(err);
  }

  // check for expiry before sending file
});

app.get("/test", async (req, res) => {
  console.log(`in test endpoint`);
  // console.log(req.body);
});

app.get("/logstorageused", async (req, res) => {
  try {
    const allUsers = await Users.findAll({ attributes: ["username"] });

    const getStorage = async (username) => {
      params = {
        Prefix: username + "/",
        Delimiter: "",
        MaxKeys: 1000,
      };
      let size = 0;

      let response = await listObjects(params);
      response.objectList.forEach((object) => {
        size += object.Size;
      });
      return size;
    };
    let createCounter = 0;
    let updateCounter = 0;
    for await (let user of allUsers) {
      let storage_used = await getStorage(user.username);

      const existingLog = await Storage.findOne({
        where: {
          username: user.username,
          date: Date.now(),
        },
      });
      if (existingLog) {
        await existingLog.update({ storage_used });
        updateCounter++;
      } else {
        const response = await Storage.create({
          username: user.username,
          date: Date.now(),
          storage_used,
        });
        createCounter++;
      }
    }
    res.json(`Created : ${createCounter} Updated: ${updateCounter}`);
  } catch (err) {
    console.log(err);
    res.status(500);
  }
});

app.post("/getMonthUsage", async (req, res) => {
  let response = await getUsage(
    req.body.username,
    req.body.year,
    req.body.month
  );

  res.json(response);
});

app.get("/postBill", async (req, res) => {
  try {
    const allUsers = await Users.findAll({ attributes: ["username"] });

    for await (let user of allUsers) {
      let usage = await getUsage(user.username, req.body.year, req.body.month);
      let cost = getCost(usage.averageUsage);
      console.log(`average usage is ${usage.averageUsage / 10 ** 9} GB`);
      console.log(`cost is ${cost}`);
      if (cost) {
        const response = await Credits.create({
          username: user.username,
          credit_adjustment: -parseInt(cost),
          date: Date.now(),
          adjustment_type: "Monthly Bill",
          bill_month: `${req.body.year}-${req.body.month}`,
        });
      }
    }
    res.json(`Bills Posted `);
  } catch (err) {
    console.log(err);
    res.status(500);
  }
});

// Listener
app.listen(PORT, async () => {
  console.log(`Starting Server...`);
  await sequelize.authenticate();
  console.log("Database Connected!");
  console.log(`Server started on port ${PORT}`);
});
