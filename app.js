/////// app.js
require('dotenv').config();
const bcrypt = require('bcryptjs');
const express = require("express");
const path = require("path");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const mongoDb = `mongodb+srv://Daniel:${process.env.DB_PASS}@cluster0.uq28y.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
mongoose.connect(mongoDb, { useUnifiedTopology: true, useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));

const User = mongoose.model(
  "User",
  new Schema({
    username: { type: String, required: true },
    password: { type: String, required: true }
  })
);

const app = express();
app.set("views", __dirname);
app.set("view engine", "ejs");

// This function is what will be called when we use the passport.authenticate() function later.
// // -- we don't call these functions on our own, they’re used in the background by passport.
passport.use(
    new LocalStrategy((username, password, done) => {
      User.findOne({ username: username }, (err, user) => {
        if (err) { 
          return done(err);
        };
        if (!user) {
          return done(null, false, { msg: "Incorrect username" });
        }
        bcrypt.compare(password, user.password, (err, res) => {
          if (res) {
            // passwords match! log user in
            return done(null, user)
          } else {
            // passwords do not match!
            return done(null, false, {msg: "Incorrect password"})
          }
        });
      });
    })
);

// Sessions -  If authentication succeeds, a session will be established and maintained via a cookie set in the user's browser.
// -- we don't call these functions on our own, they’re used in the background by passport.
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
});
////

// use the middleware for express-session and passport
app.use(session({ secret: "cats", resave: false, saveUninitialized: true }));
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