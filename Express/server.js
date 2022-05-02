"use-strict";
// DEPENDENCIES
require("dotenv").config();
const express = require("express");
var cors = require("cors");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const {
  uploadFile,
  getFileStream,
  listObjects,
  createFolder,
  deleteFile,
} = require("./s3");
const PORT = process.env.PORT || 5001;
const { sequelize, Users, Credits, Storage, Shares } = require("./models");

// CONFIGURATION
const app = express();
app.use(cors());
app.use(express.json()); //input parser for JSON
app.use(express.urlencoded({ extended: false }));

// ROUTER/CONTROLLER
const dbTestController = require("./controller/dbTestController");
app.use("/", dbTestController);

//UNLINK (to delete files after upload)
const fs = require("fs");
const util = require("util");
const { response } = require("express");
const unlinkFile = util.promisify(fs.unlink);

// DATA

// ROUTES
app.post("/download", (req, res) => {
  const key = req.body.Key;
  const readStream = getFileStream(key);
  readStream.pipe(res);

  // ---EXPERIMENT---
  // res.sendFile(`${__dirname}/test_200.mp4`);
});

app.post("/upload", upload.single("file"), async (req, res) => {
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

app.delete("/delete", async (req, res) => {
  console.log(`deleting`);
  filename = req.body.filename;
  let response = await deleteFile(filename);
  res.send(response);
});

app.post("/getFileList", async (req, res) => {
  username = req.body.username;
  path = req.body.path;
  params = {
    Prefix: username + path,
    Delimiter: "/",
    MaxKeys: 1000,
  };

  let response = await listObjects(params);
  response = { ...response, currentDirectory: path };

  res.send(response);
});

app.post("/getStorageUsed", async (req, res) => {
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

app.post("/createFolder", async (req, res) => {
  username = req.body.username;
  path = req.body.path;
  let response = await createFolder(username + path);
  res.send(response);
});

// ---------- DB TESTS ----------

// Listener
app.listen(PORT, async () => {
  console.log(`server started on port ${PORT}`);

  await sequelize.authenticate();
  console.log("Database Connected!");
});
