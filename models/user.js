const mongoose = require('mongoose')
const passportLocalMongoose = require("passport-local-mongoose")


const UserSchema = new mongoose.Schema({
    // Need to create an id field for each one of the oauth providers
    googleId: {
        type: String
    },
    discordId: {
        type: String
    },
    displayName: {
        type: String
    },
})

// Create a clone of UserSchema, before we plugin the passportLocalMongoose addons
const OauthUserSchema = UserSchema.clone()

// Plugin a username and password required fields, as well as some special functions provided by passportLocalMongoose
UserSchema.plugin(passportLocalMongoose)


// Create a method on our OauthUserSchema that will try to find a OauthUser 
OauthUserSchema.statics.findOrCreate = function findOrCreate(profile, provider, cb) {
    // Need to create an empty userObj that is an instance of a new OauthSchema
    var userObj = new this()
    // [provider] is not an array, this is how we insert a variable as a key in an object
    // Eg is provider is 'googleId' then the object will be => {googleId: profile.id}
    this.findOne({ [provider]: profile.id }, function (err, result) {
        // If no user exists
        if (!result) {
            // We set the provider and the id
            // Eg if provider is 'discordId' then the userObj = {discordId: profile.id}
            userObj[provider] = profile.id
            // Set the display name so we can render something on the front end
            userObj.displayName = profile.displayName
            // Save the userObj in the database as an instance of a new OauthUserSchema
            userObj.save(cb)
        } else {
            // If we find a user, we call the callback, pass an error(which should be null) and the result of this.findOne
            cb(err, result)
        }
    })
}

module.exports = {
    User: mongoose.model('users', UserSchema),
    OauthUser: mongoose.model('OauthUsers', OauthUserSchema)
}