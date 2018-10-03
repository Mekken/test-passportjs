// Dependencies
// =============================================================
var express = require("express");
var bodyParser = require("body-parser");
var mongojs = require("mongojs");
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var path = require("path");

// Configure the local strategy for use by Passport.
//
// The local strategy require a `verify` function which receives the credentials
// (`username` and `password`) submitted by the user.  The function must verify
// that the password is correct and then invoke `done` with a user object, which
// will be set at `req.user` in route handlers after authentication.
passport.use(new Strategy(
  function(username, password, done) {
    db.users.findOne({ username: username, password: password }, function(err, user) {
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      return done(null, user);
    });
}));

// Mongojs configuration
var databaseUrl = "passportDB";
var collections = ["users"];

// Hook our mongojs config to the db var
var db = mongojs(databaseUrl, collections);
db.on("error", function(error) {
  console.log("Database Error:", error);
});


// Sets up the Express App
// =============================================================
var app = express();
var PORT = process.env.PORT || 3000;

// Use the express.static middleware to serve static content for the app from the "public" directory in the application directory.
app.use(express.static("public"));

// Sets up the Express app to handle data parsing
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Passport JS Session Setup
app.use(require('cookie-parser')('passport_cookie'));
app.use(require('express-session')({ secret: 'passport_cookie'}));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  The
// typical implementation of this is as simple as supplying the user ID when
// serializing, and querying the user record by ID from the database when
// deserializing.
passport.serializeUser(function(user, cb) {
  cb(null, user.username);
});

passport.deserializeUser(function(username, cb) {
  db.users.findOne({ username: username }, function (err, user) {
    if (err) { return cb(err); }
    cb(null, user);
  });
});

app.get("/", function(req, res) {
  res.status(200);
  res.sendFile(path.join(__dirname,"index.html"));
});

app.post("/login", 
  passport.authenticate("local"), 
  function(req, res) {
    console.log("User Info:",JSON.stringify(req.user));
    res.redirect("/profile");
});

app.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/");
});

app.get("/profile", function(req, res) {
  console.log("Profile Info:",JSON.stringify(req.user));
  res.send(req.user);
});

// function isAuthenticated(req, res, next) {
//   if(req.isAuthenticated()){
//     console.log(req.user);
//     next();
//   }
//   else
//     res.redirect("/404");
// }

app.listen(PORT, function(err) {
  if(err) throw err;
  console.log(`🌎  ==> API Server now listening on PORT ${PORT}!`);
});