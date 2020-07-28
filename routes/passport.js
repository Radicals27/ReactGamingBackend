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
    clientID: `${process.env.GOOGLE_CLIENT_ID}`,
    clientSecret: `${process.env.GOOGLE_CLIENT_SECRET}`,
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
    clientID: `${process.env.DISCORD_CLIENT_ID}`,
    clientSecret: `${process.env.DISCORD_CLIENT_SECRET}`,
    callbackURL: 'https://react-gaming-backend.herokuapp.com/auth/discord/callback',
    scope: scopes
},
    function (accessToken, refreshToken, profile, cb) {
        OauthUser.findOrCreate({ id: profile.id, displayName: profile.username }, 'discordId', function (err, user) {
            return cb(err, user)
        })
    }))