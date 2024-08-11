const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    username: {
        type: String,
        default: null
    },
    avatar: {
        type: String,
        default: null
    }
})

userSchema.virtual('issuesRefAssignees', {
    ref: 'issues',
    foreignField: '_id',
    localField: 'assignees'
})


const userModel = new mongoose.model('users', userSchema)

module.exports = userModel