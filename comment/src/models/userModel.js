const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        default: null
    },
    avatar: {
        type: String,
        default: null
    },
    email: {
        type: String,
        default: null
    }
})

userSchema.virtual('commentsRefCreator', {
    ref: 'comments',
    foreignField: '_id',
    localField: 'creator'
})

const userModel = new mongoose.model('users', userSchema)

module.exports = userModel