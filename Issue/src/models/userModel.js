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

userSchema.virtual('issueRefCreator', {
    ref: 'issues',
    foreignField: '_id',
    localField: 'creator'
})

userSchema.virtual('issueRefAssignees', {
    ref: 'issues',
    foreignField: '_id',
    localField: 'assignees'
})

userSchema.virtual('issueRefAssignees', {
    ref: 'issues',
    foreignField: '_id',
    localField: 'voted'
})

const userModel = new mongoose.model('users', userSchema)

module.exports = userModel