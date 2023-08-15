//jshint esversion:6

const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
// const passportLocal = require('passport-local');

const app = express();


app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));


//seting up session
app.use(session({
    secret: "This is a secreat.",
    resave: false,
    saveUninitialized: false
}))


//intiallizing passport
app.use(passport.initialize());

//using passport to manage session
app.use(passport.session()); 


//connecting mongodb
mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});
// to remove deprecation warning
// mongoose.set("useCreateIndex", true); 

//mongoose Schema
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

//allowing mongoose schema to use passportLocalMongoose as a plugin
userSchema.plugin(passportLocalMongoose);

//mongoose model
const User = new mongoose.model("User", userSchema);

// using passport local mongoose to create a local login Strategy
passport.use(User.createStrategy());

//seting passport to serialize and deserialize User
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/", function(req, res){
    res.render("home");
});

app.get("/login", function(req, res){
    res.render("login");
});

app.get("/register", function(req, res){
    res.render("register");
});




app.post("/register", function(req, res){
    
});

app.post("/login", async function(req, res){

})








app.listen(3000, function() {
    console.log(`Server is running on port 3000`);
});