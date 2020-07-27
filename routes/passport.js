const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const { User, OauthUser } = require('../models/user')

// Hash the user password
passport.serializeUser(function (user, done) {
    // this method is done( no error, here is the user)
    done(null, user)
})

// Un-hash the user password back into a string
passport.deserializeUser(function (user, done) {
    // this method is done( no error, here is the user)
    done(null, user)
})

// Initializing a Local Strategy on the User Model
passport.use(User.createStrategy())

// Create a google strategy, import package
passport.use(new GoogleStrategy({
    clientID: "157895230249-agrvo2b25jecn7isgs81hsv77khm7lfs.apps.googleusercontent.com",
    clientSecret: "QA8lxUiDJaxm6y4FeWotV73l",
    callbackURL: "https://react-gaming-backend.herokuapp.com/auth/google/callback"
},
    function (accessToken, refreshToken, profile, cb) {
        OauthUser.findOrCreate({ id: profile.id, displayName: profile.displayName }, 'googleId', function (err, user) {
            return cb(err, user)
        })
    })
)

// Set up Discord Strategy
var DiscordStrategy = require('passport-discord').Strategy

var scopes = ['identify', 'email']

passport.use(new DiscordStrategy({
    clientID: '737455304077213696',
    clientSecret: 'Xo1CmGRKZv38MXUCwm7u9p-rdM0eweQk',
    callbackURL: 'https://react-gaming-backend.herokuapp.com/auth/discord/callback',
    scope: scopes
},
    function (accessToken, refreshToken, profile, cb) {
        OauthUser.findOrCreate({ id: profile.id, displayName: profile.username }, 'discordId', function (err, user) {
            return cb(err, user)
        })
    }))