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

userSchema.virtual('ProjectRefCategory', {
    ref: 'projects',
    localField: '_id',
    foreignField: 'category'
})

userSchema.virtual('ProjectRefProjectLeader', {
    ref: 'projects',
    localField: '_id',
    foreignField: 'project_leader'
})

userSchema.virtual('ProjectRefCreator', {
    ref: 'projects',
    localField: '_id',
    foreignField: 'user_info'
})

userSchema.virtual('ProjectRefUserRole', {
    ref: 'issues',
    localField: '_id',
    foreignField: 'user_info'
})

userSchema.virtual('IssueRefAssignees', {
    ref: 'issues',
    localField: '_id',
    foreignField: 'assignees'
})

userSchema.virtual('IssueRefCreator', {
    ref: 'issues',
    localField: '_id',
    foreignField: 'creator'
})


const userModel = new mongoose.model('users', userSchema)

module.exports = userModel