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

userSchema.virtual('issueRefCreateBy', {
    ref: 'issueHistories',
    foreignField: '_id',
    localField: 'createBy'
})

userSchema.virtual('issueRefCreator', {
    ref: 'worklogHistories',
    foreignField: '_id',
    localField: 'creator'
})

const userModel = new mongoose.model('users', userSchema)

module.exports = userModel