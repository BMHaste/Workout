const express = require('express');
const path = require('path');
const router = express.Router();
const bodyParser = require('body-parser');
const session = require('express-session');

router.use(bodyParser.urlencoded({ extended: true }));
router.use( express.static(path.join(__dirname, '..', 'views')));
router.use( express.static(path.join(__dirname, '..', 'pictures')));
router.use( express.static('../validation.js'))
router.use(session({
    secret: 'chungus',
    resave: false,
    saveUninitialized: false,
    cookie: {secure: false}
}));

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/userDataDB');
const userSchema = new mongoose.Schema({
      username: String,
      password: String,
      cateogry: [String],
      workouts: [String],
      weights: [Number],
      reps: [Number],
      sets: [Number]
    });
const User = mongoose.model('User', userSchema);

router
    .route("/signup")
    .get((req, res) => {
        res.sendFile(path.join(__dirname, '..', 'views', 'signup.html'));
    })
    .post(async (req, res) => {
        const { username, password } = req.body;
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.render('signUpErr')
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
            req.session.username = req.body.username;
            return res.redirect('/users/homepage')
        }else{
            return res.render('loginErr')
        }
      });
router
    .route("/homepage")
    .get(async (req, res) => {
        let user_data = await User.findOne({ username: req.session.username });
        return res.render('homepage', { 
            username: req.session.username,
            user: user_data
        })
    })
    .post(async (req, res) => {
        const {workout, weight } = req.body;
        current_user = req.session.username;
        let user = await User.findOne({ username: current_user });
        if (user) {
            user.workouts.push(workout);
            user.weights.push(weight);
            await user.save();
            req.session.workouts = user.workouts;
            req.session.weights = user.weights;
            return res.redirect('/users/workouts')
        }else{
            res.status(500).send('Internal Server Error');
        }
      });
router
    .route("/newWorkout")
    .get((req, res) => {
        return res.render('newWorkout', { workouts: req.session.workouts, weights: req.session.weights })
    })
    .post(async (req, res) => {
    });
router
    .route("/leaderboard")
    .get( async (req, res) => {
        const users = await User.find({})
        return res.render('leaderboard', {users})
    })
    .post(async (req, res) => {
    });



module.exports = router;