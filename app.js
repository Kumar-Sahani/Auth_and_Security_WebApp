//jshint esversion:6
require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

const app = express();


mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});


//The plugin should be before the mongoose model
userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password'] });


//mongoose model
const User = new mongoose.model("User", userSchema);




app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));


app.get("/", function(req, res){
    res.render("home");
});

app.get("/login", function(req, res){
    res.render("login");
});

app.get("/register", function(req, res){
    res.render("register");
});


app.post("/register", async function(req, res){

    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });

    await newUser.save().then(saveDoc => {
        saveDoc === newUser;
    });

    res.render("secrets");
    
});

app.post("/login", async function(req, res){

    const username = req.body.username;
    const password = req.body.password;

try{
    await User.findOne({
        email: username
    }).then(foundUser => {
        if(foundUser){
            if(foundUser.password === password){
                res.render("secrets");
            }else{
                res.send("<h1>Wrong Password</h1>");
            }
        }else{
            res.send("<h1>User Not Found</h1>");
        }
    });
}
catch(err){
    console.log(err);
}


})








app.listen(3000, function() {
    console.log(`Server is running on port 3000`);
});