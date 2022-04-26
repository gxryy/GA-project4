// DEPENDENCIES
require("dotenv").config();
const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");
const path = require("path");
const PORT = process.env.PORT || 5001;

// CONFIGURATION
const app = express();
app.use(express.json()); //input parser for JSON
app.use(express.urlencoded({ extended: false }));

// DATA

// ROUTES
app.get("/", (req, res) => {
  //   res.send("hello");
});

// Listener
app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});
