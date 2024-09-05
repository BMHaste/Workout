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
    secret: 'lonelymoose',
    resave: false,
    saveUninitialized: true,
    cookie: {secure: false}
}));

require('dotenv').config();
const mongoose = require('mongoose');
// mongoose.connect('mongodb://localhost:27017/userDataDB');
mongoose.connect(process.env.MONGODB_URI);

const userSchema = new mongoose.Schema({
      username: String,
      password: String,
      category: [String],
      workouts: [String],
      weights: [Number],
      reps: [Number],
      sets: [Number]
    });
const User = mongoose.model('User', userSchema);

router
    .route("/signup")
    .get((req, res) => {
        res.sendFile(path.join(__dirname, '..', 'views', 'index.html'));
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
      });
router
    .route("/newWorkout")
    .get((req, res) => {
        return res.render('newWorkout')
    })
    .post(async (req, res) => {
        const {category, workout, weight, reps, sets } = req.body;
        current_user = req.session.username;
        let user = await User.findOne({ username: current_user });
        if (user) {
            user.category.push(category);
            user.workouts.push(workout);
            user.weights.push(weight);
            user.reps.push(reps);
            user.sets.push(sets);
            await user.save();
            req.session.category = user.category;
            req.session.workouts = user.workouts;
            req.session.weights = user.weights;
            req.session.reps = user.reps;
            req.session.sets = user.sets;
            return res.redirect('/users/homepage')
        }else{
            res.status(500).send('Internal Server Error');
        }
    });
router
    .route("/leaderboard")
    .get( async (req, res) => {
        const users = await User.find({})
        return res.render('leaderboard', {users})
    })
    .post(async (req, res) => {
    });
router
    .route("/removeWorkout")
    .get( async (req, res) => {
        const users = await User.find({})
        return res.render('removeWorkout', {users})
    })
    .post(async (req, res) => {
        const {category, workout} = req.body;
        current_user = req.session.username;
        let user = await User.findOne({ username: current_user });
        if (user) {
            let index = -1; 
            for (let i = 0; i < user.workouts.length; i++) {
                if (user.workouts[i] === workout && user.category[i] === category) {
                    index = i;
                    break; 
                }
            }
            if (index !== -1) { 
                user.workouts.splice(index, 1);
                user.category.splice(index, 1);
                user.weights.splice(index, 1);
                user.reps.splice(index, 1);
                user.sets.splice(index, 1);
                
                await user.save();
                req.session.category = user.category;
                req.session.workouts = user.workouts;
                req.session.weights = user.weights;
                req.session.reps = user.reps;
                req.session.sets = user.sets;
            }
            return res.redirect('/users/homepage')
        }else{
            res.status(500).send('Internal Server Error');
        }
    });
router
    .route("/logout")
    .get( (req, res) => {
        req.session.destroy(err => {
            if (err) {
                return res.status(500).send('Failed to log out.');
            }
            res.redirect('/users/login');
        });
    })
    .post(async (req, res) => {
    });


module.exports = router;