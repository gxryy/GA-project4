const express = require("express");
const multer = require("multer");
const { nanoid } = require("nanoid");
const { Op } = require("sequelize");
const jwt_decode = require("jwt-decode");
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);

const upload = multer({ dest: "uploads/" });

const { sequelize, Users, Credits, Storage, Shares } = require("../models");
const {
  uploadFile,
  getFileStream,
  listObjects,
  createFolder,
  deleteFile,
} = require("../s3");

const drive = express.Router();

let JWKs = [];

console.log(`reading txt`);
fs.readFile(`${process.cwd()}/JWKs.txt`, "utf8", (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  JWKs = JSON.parse(data);
});

const checkJWTMiddleware = (req, res, next) => {
  console.log(`in middle`);
  const invalidResponse = () => {
    res.sendStatus(404);
  };
  const ignored_routes = ["/upload"];
  if (ignored_routes.includes(req.path)) {
    next();
  } else {
    console.log(`JWT token validator`);
    token = req.body.accessToken;
    username = req.body.username;
    console.log(req.body);
    try {
      // decoding JWT
      let payload = jwt_decode(token);
      // validating kid with jwks
      let { kid, alg } = jwt_decode(token, { header: true });
      let validkid = false;
      JWKs.keys.map((key) => {
        if (!validkid) {
          key.kid === kid ? (validkid = true) : (validkid = false);
        }
      });
      if (!validkid) invalidResponse();
      // console.log(`kid valid`);
      // Validing username claim
      if (payload.username !== username) invalidResponse();
      // console.log(`username claim valid`);
      // Validing token not expired
      if (Math.floor(Date.now() / 1000) > payload.exp) invalidResponse();
      // console.log(`token not expired`);
      console.log(`passed`);
      next();
    } catch (err) {
      console.log(err);
      invalidResponse();
    }
  }
};

drive.use(checkJWTMiddleware);

drive.post("/createFolder", async (req, res) => {
  username = req.body.username;
  path = req.body.path;
  let response = await createFolder(username + path);
  res.send(response);
});

drive.post("/download", (req, res) => {
  const key = req.body.Key;
  const readStream = getFileStream(key);
  readStream.pipe(res);
});

drive.post("/upload", upload.single("file"), async (req, res) => {
  console.log(req);
  if (req.file) {
    const file = req.file;
    let username = req.body.username;
    let path = req.body.path;
    file.filename = username + path + file.originalname;
    console.log(file.filename);
    const result = await uploadFile(file);
    await unlinkFile(file.path);
    res.send(result);
  }
});

drive.post("/getsharelink", async (req, res) => {
  console.log(`in get sharelink`);
  let url_uuid = nanoid();
  console.log(req.body);

  try {
    const response = await Shares.create({
      username: req.body.username,
      url_uuid: url_uuid,
      s3_key: req.body.s3_key,
      expiry: req.body.expiry,
      download_counter: 0,
      is_deleted: false,
    });

    res.json({ url_uuid, expiry: response.dataValues.expiry });
  } catch (err) {
    console.log(err);
    res.status(500);
  }
});

drive.delete("/delete", async (req, res) => {
  fileKey = req.body.fileKey;
  let response = await deleteFile(fileKey);
  console.log(`${fileKey} has been deleted`);
  res.send(response);
});

drive.post("/getFileList", async (req, res) => {
  username = req.body.username;
  path = req.body.path;
  console.log(username);
  console.log(path);
  params = {
    Prefix: username + path,
    Delimiter: "/",
    MaxKeys: 1000,
  };

  let response = await listObjects(params);
  response = { ...response, currentDirectory: path };

  res.send(response);
});

drive.post("/getStorageUsed", async (req, res) => {
  username = req.body.username;
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

  res.send({ totalSize: size, numberOfObjects: response.objectList.length });
});

drive.post("/getallsharedlink", async (req, res) => {
  console.log(`in all links `);
  let username = req.body.username;
  let linkArray = [];
  try {
    const response = await Shares.findAll({
      where: { [Op.and]: [{ username }, { is_deleted: false }] },
    });

    for (let link of response) {
      console.log(`in a link`);
      let arraySplit = link.s3_key.split("/");
      let fileName = arraySplit[arraySplit.length - 1];
      linkArray.push({
        fileName,
        url_uuid: link.url_uuid,
        expiry: link.expiry,
        download_counter: link.download_counter,
        createdAt: link.createdAt,
      });
    }

    console.log(linkArray);

    res.json(linkArray);
  } catch (err) {
    // console.log(err);
    console.log(`error`);
    // return res.status(500);
  }

  //   res.send("ok");
});

drive.post("/editlinkexpiry", async (req, res) => {
  try {
    const link = await Shares.findOne({
      where: { url_uuid: req.body.url_uuid },
    });

    values = { expiry: req.body.newExpiry };

    link.update(values);

    return res.json("updated");
  } catch (err) {
    console.log(err);
    return res.status(500);
  }
});

drive.delete("/deletelink", async (req, res) => {
  // to update links isDeleted field
  try {
    const link = await Shares.findOne({
      where: { url_uuid: req.body.url_uuid },
    });

    values = { is_deleted: true };

    link.update(values);

    return res.json("deleted");
  } catch (err) {
    console.log(err);
    return res.status(500);
  }
});

drive.post("/getcredithistory", async (req, res) => {
  let username = req.body.username;

  try {
    const response = await Credits.findAll({
      where: { username },
    });
    console.log(response);
    res.json(response);
  } catch (err) {
    console.log(err);
    return res.status(500);
  }
});

drive.post("/getcredits", async (req, res) => {
  let username = req.body.username;

  try {
    const response = await Credits.findAll({
      where: { username },
    });
    let credits = 0;
    // console.log(response);
    for (transaction of response) {
      credits += transaction.credit_adjustment;
    }
    res.json(credits);
  } catch (err) {
    console.log(err);
    return res.status(500);
  }
});

drive.post("/topup", async (req, res) => {
  try {
    const response = await Credits.create({
      username: req.body.username,
      credit_adjustment: req.body.credit_adjustment,
      date: Date.now(),
      adjustment_type: "Top Up",
    });
    res.json(response);
  } catch (err) {
    console.log(err);
    return res.status(500);
  }
});

module.exports = drive;
