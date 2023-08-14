//jshint esversion:6
const bcrypt = require('bcrypt');
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');

const app = express();

const saltRounds = 10;

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});



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


app.post("/register", function(req, res){
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        // Store hash in your password DB.
        const newUser = new User({
            email: req.body.username,
            password: hash
        });
    
        newUser.save().then(saveDoc => {
            saveDoc === newUser;
        });
    
        res.render("secrets");
    });


    
});

app.post("/login", async function(req, res){

    const username = req.body.username;
    const password = req.body.password;

    await User.findOne({
        email: username
    }).then(foundUser => {
        if(foundUser){

            //bcryt
            bcrypt.compare(req.body.password, foundUser.password, function(err, result) {
                if(result === true){
                    res.render("secrets");
                }else{
                    res.send("<h1>Wrong Password</h1>");
                }
            });

        }else{
            res.send("<h1>User Not Found</h1>");
        }
    });

})








app.listen(3000, function() {
    console.log(`Server is running on port 3000`);
});