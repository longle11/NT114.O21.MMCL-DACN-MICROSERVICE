const mongoose = require('mongoose')

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

userSchema.virtual('usersRefAssignees', {
    ref: 'issues',
    foreignField: '_id',
    localField: 'assignees'
})

userSchema.virtual('usersRefCreator', {
    ref: 'epics',
    foreignField: '_id',
    localField: 'creator'
})
userSchema.virtual('usersRefCreatorVersion', {
    ref: 'versions',
    foreignField: '_id',
    localField: 'creator'
})


const userModel = mongoose.model('users', userSchema)

module.exports = userModel