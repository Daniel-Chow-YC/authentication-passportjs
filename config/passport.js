const LocalStrategy = require("passport-local").Strategy;
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const passport = require("passport");

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
