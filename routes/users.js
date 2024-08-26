const express = require('express');
const path = require('path');
const router = express.Router();
const bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: true }));
router.use( express.static(path.join(__dirname, '..', 'views')));
router.use( express.static(path.join(__dirname, '..', 'pictures')));
router.use( express.static('../validation.js'))

router
    .route("/signup")
    .get((req, res) => {
        res.sendFile(path.join(__dirname, '..', 'views', 'signup.html'));
    })
    .post(async (req, res) => {
        const { username, password } = req.body;
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).sendFile(path.join(__dirname, '..', 'views', 'signupFail.html'));
        }
        const newUser = new User({ username, password });
        await newUser.save();
    
        res.sendFile(path.join(__dirname, '..', 'views', 'signupSuccess.html'));
      });

router
    .route("/login")
    .get((req, res) => {
        res.sendFile(path.join(__dirname, '..', 'views', 'login.html'));
    })
    .post(async (req, res) => {
        const { username, password } = req.body;
        const existingUser = await User.findOne({ username, password });
        if (existingUser) {
            return res.status(400).render('homepage', { username: req.body.username })
        }else{
            res.sendFile(path.join(__dirname, '..', 'views', 'incorrect.html'));
        }
      });

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/userDataDB');
const userSchema = new mongoose.Schema({
      username: String,
      password: String,
    });
const User = mongoose.model('User', userSchema);

module.exports = router;