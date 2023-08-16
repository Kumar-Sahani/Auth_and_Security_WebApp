//jshint esversion:6
require("dotenv").config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');


const app = express();


app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));


//seting up session
app.use(
    session({
        secret: "This is a secreat.",
        resave: false,
        saveUninitialized: false
    })
);


//intiallizing passport
app.use(passport.initialize());

//using passport to manage session
app.use(passport.session()); 


//connecting mongodb
mongoose.connect("mongodb://127.0.0.1:27017/userDB", {useNewUrlParser: true});

//mongoose Schema
const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    googleId: String,
    secret: String
});

//allowing mongoose schema to use passportLocalMongoose as a plugin
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

//mongoose model
const User = new mongoose.model("User", userSchema);

// using passport local mongoose to create a local login Strategy
passport.use(User.createStrategy());

// seting passport to serialize and deserialize User
passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, {
            id: user.id,
        });
    });
});
 
passport.deserializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, user);
    });
});



passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    // userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);

    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));


//get route request
app.get("/", function(req, res){
    res.render("home");
});

app.get("/login", function(req, res){
    res.render("login");
});

app.get("/register", function(req, res){
    res.render("register");
});



app.get("/secrets", function (req, res) {
    //uncomment this when authenticating via google OAUTH
    // if(req.isAuthenticated()){
    //     res.render("secrets");
    // }else{
    //     res.redirect("/login");
    // }
    
    User.find({ "secret": { $ne: null } })
        .then((foundUsers) => {
            if (foundUsers) {
                res.render("secrets", { usersWithSecrets: foundUsers });
            }
        })
        .catch((err) => {
            console.log(err);
        });
});




app.get("/logout", (req, res, next) => {
	req.logout(function(err) {
		if (err) {
			return next(err);
		} else {
		    res.redirect('/');
        }
	});
});

app.get("/submit", function(req, res){
    if(req.isAuthenticated()){
        res.render("submit");
    }else{
        res.redirect("/login");
    }
});


app.post("/submit", function(req, res){
    const submittedSecret = req.body.secret;

    User.findById(req.user.id).then(foundUser => {
        try{
            if(foundUser){
                foundUser.secret = submittedSecret;
                foundUser.save();
                res.redirect("/secrets")
            }
        }catch(err){
            console.log(err);
        }
    });
});





app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/secrets', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect secret.
    res.redirect('/secrets');
  });





//post route request
app.post("/register", function(req, res){
    User.register(
        { username: req.body.username}, 
        req.body.password, 
        function(err, user){
            if(err){
                console.log(err);
                res.redirect("/register");
            } else {
                passport.authenticate('local')(req, res, function(){
                    res.redirect("/secrets");
                });
            }
        }
    );   
});

app.post("/login", function(req, res){
    const user = new User({
        username: req.body.userName,
        password: req.body.password
    });

    req.login(user, function(err){
        if(err){
            console.log(err);
        }else{
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets");
            });
        }
    });  
});




app.listen(3000, function() {
    console.log(`Server is running on port 3000`);
});