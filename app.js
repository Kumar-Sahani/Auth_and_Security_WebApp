//jshint esversion:6

const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');


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
    password: String
});

//allowing mongoose schema to use passportLocalMongoose as a plugin
userSchema.plugin(passportLocalMongoose);

//mongoose model
const User = new mongoose.model("User", userSchema);

// using passport local mongoose to create a local login Strategy
passport.use(User.createStrategy());

// seting passport to serialize and deserialize User
passport.serializeUser(function(user, done) {
    process.nextTick(function() {
        done(null, { id: user._id, username: user.username });
    });
});
passport.deserializeUser(function(user, done) {
    process.nextTick(function() {
        return done(null, user);
    });
});
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());



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

app.get("/secrets", function(req, res){
    if(req.isAuthenticated()){
        res.render("secrets");
    }else{
        res.redirect("/login");
    }
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