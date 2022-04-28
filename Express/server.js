// DEPENDENCIES
require("dotenv").config();
const express = require("express");
const session = require("express-session");
var cors = require("cors");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const { uploadFile, getFileStream, listObjects } = require("./s3");
const PORT = process.env.PORT || 5001;

// CONFIGURATION
const app = express();
app.use(cors());
app.use(express.json()); //input parser for JSON
app.use(express.urlencoded({ extended: false }));

//UNLINK (to delete files after upload)
const fs = require("fs");
const util = require("util");
const { response } = require("express");
const unlinkFile = util.promisify(fs.unlink);

// DATA

// ROUTES
app.get("/download/:key", (req, res) => {
  const key = req.params.key;
  const readStream = getFileStream(key);
  readStream.pipe(res);
});

app.post("/files", upload.single("file"), async (req, res) => {
  console.log(`something came in`);
  if (req.file) {
    const file = req.file;
    let username = req.body.username;
    file.filename = username + "/" + file.originalname;
    console.log(file);
    const result = await uploadFile(file);
    await unlinkFile(file.path);
    // console.log(result);
    res.send(`ok`);
  }
});

app.post("/getObjects", async (req, res) => {
  console.log(`in get objects endpoint`);
  username = req.body.username;
  path = req.body.path;
  params = {
    Prefix: username + path,
    Delimiter: "/",
    MaxKeys: 1000,
  };

  let response = await listObjects(params);
  console.log(response);

  res.send("ok");
});

app.post("/test", async (req, res) => {
  console.log(`in test endpoint`);
  response = await listObjects();

  res.send("response");
});

// Listener
app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});
