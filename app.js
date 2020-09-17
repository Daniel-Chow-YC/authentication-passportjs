/////// app.js
require('dotenv').config();
const bcrypt = require('bcryptjs');
const express = require("express");
// const path = require("path");
const session = require("express-session");
const passport = require("passport");
const mongoose = require("mongoose");
const User = require('./models/userModel');

const mongoDb = `mongodb+srv://Daniel:${process.env.DB_PASS}@cluster0.uq28y.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
mongoose.connect(mongoDb, { useUnifiedTopology: true, useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));


const app = express();
app.set("views", __dirname);
app.set("view engine", "ejs");

// Passport config
require('./config/passport')


// use the middleware for express-session and passport
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
//---------------
app.use(express.urlencoded({ extended: false }));



// routes
app.get("/", (req, res) => {
    res.render("index", { user: req.user });
});
app.get("/sign-up", (req, res) => res.render("sign-up-form"));

app.post("/sign-up", async (req,res,next) => {
  let salt = await bcrypt.genSalt(10);
  let hash = await bcrypt.hash(req.body.password, salt);
  const user = new User({
    username: req.body.username,
    password: hash
  })
    .save(err => {
      if (err) { 
        return next(err);
      };
      res.redirect("/");
    });
});

app.post(
    "/log-in",
    passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/"
    })
);

// the passport middleware adds a logout function to the req object
app.get("/log-out", (req, res) => {
    req.logout();
    res.redirect("/");
});

app.listen(3000, () => console.log("app listening on port 3000!"));
