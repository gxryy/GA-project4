const express = require("express");
const { sequelize, Users, Credits, Storage, Shares } = require("../models");
const { Op } = require("sequelize");

const dbTest = express.Router();

// ----- USERS -----
dbTest.get("/db_createUser", async (req, res) => {
  try {
    const response = await Users.create({
      username: req.body.username,
      first_name: req.body.firstName,
      last_name: req.body.lastName,
      email: req.body.email,
      date_joined: Date.now(),
    });
    return res.json(response);
  } catch (err) {
    console.log(err);
    return res.status(500);
  }
});

dbTest.get("/db_viewAllUser", async (req, res) => {
  try {
    const response = await Users.findAll();
    return res.json(response);
  } catch (err) {
    console.log(err);
    return res.status(500);
  }
});

dbTest.get("/db_viewOneUser", async (req, res) => {
  try {
    const response = await Users.findOne({
      where: { username: req.body.username },
    });
    return res.json(response);
  } catch (err) {
    console.log(err);
    return res.status(500);
  }
});

// ----- CREDITS -----

dbTest.get("/db_createCredits", async (req, res) => {
  try {
    const response = await Credits.create({
      username: req.body.username,
      credit_adjustment: req.body.credit_adjustment,
      date: Date.now(),
      adjustment_type: req.body.adjustment_type,
      bill_month: req.body.bill_month,
    });
    return res.json(response);
  } catch (err) {
    console.log(err);
    return res.status(500);
  }
});

dbTest.get("/db_viewAllCredits", async (req, res) => {
  try {
    const response = await Credits.findAll();
    return res.json(response);
  } catch (err) {
    console.log(err);
    return res.status(500);
  }
});

dbTest.get("/db_viewAllCreditsFromUser", async (req, res) => {
  try {
    const response = await Credits.findAll({
      where: { username: req.body.username },
    });
    return res.json(response);
  } catch (err) {
    console.log(err);
    return res.status(500);
  }
});

// ----- STORAGE -----

dbTest.get("/db_createStorage", async (req, res) => {
  try {
    const response = await Storage.create({
      username: req.body.username,
      date: req.body.date,
      storage_used: req.body.storage_used,
    });
    return res.json(response);
  } catch (err) {
    console.log(err);
    return res.status(500);
  }
});

dbTest.get("/db_viewAllStorage", async (req, res) => {
  try {
    const response = await Storage.findAll();
    return res.json(response);
  } catch (err) {
    console.log(err);
    return res.status(500);
  }
});

dbTest.get("/db_viewAllStorageFromUser", async (req, res) => {
  try {
    const response = await Storage.findAll({
      where: { username: req.body.username },
    });
    return res.json(response);
  } catch (err) {
    console.log(err);
    return res.status(500);
  }
});

dbTest.get("/db_viewAllStorageFromUserAboveAmount", async (req, res) => {
  try {
    const response = await Storage.findAll({
      where: {
        [Op.and]: [
          { username: req.body.username },
          { storage_used: { [Op.gte]: req.body.min_storage } },
        ],
      },
    });
    return res.json(response);
  } catch (err) {
    console.log(err);
    return res.status(500);
  }
});

// ----- SHARES -----

dbTest.get("/db_createShare", async (req, res) => {
  try {
    const response = await Shares.create({
      username: req.body.username,
      url_uuid: req.body.url_uuid,
      s3_key: req.body.s3_key,
      expiry: req.body.expiry,
      download_counter: 0,
    });
    return res.json(response);
  } catch (err) {
    console.log(err);
    return res.status(500);
  }
});

dbTest.get("/db_viewAllShare", async (req, res) => {
  try {
    const response = await Shares.findAll();
    return res.json(response);
  } catch (err) {
    console.log(err);
    return res.status(500);
  }
});

dbTest.get("/db_viewAllShareFromUser", async (req, res) => {
  try {
    const response = await Shares.findAll({
      where: { username: req.body.username },
    });
    return res.json(response);
  } catch (err) {
    console.log(err);
    return res.status(500);
  }
});

dbTest.get("/db_increaseDLforUUID", async (req, res) => {
  try {
    const share = await Shares.findOne({
      where: { url_uuid: req.body.uuid },
    });
    values = { download_counter: share.download_counter + 1 };

    const response = share.update(values);

    return res.json("updated");
  } catch (err) {
    console.log(err);
    return res.status(500);
  }
});

module.exports = dbTest;
