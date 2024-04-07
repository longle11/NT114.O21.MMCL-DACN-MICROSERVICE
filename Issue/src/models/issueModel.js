const mongoose = require("mongoose")

const issueSchema = new mongoose.Schema({
    projectId: mongoose.Schema.Types.ObjectId,
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    priority: {
        type: Number,
        default: null
    },
    timeSpent: {
        type: Number,
        default: null
    },
    timeRemaining: {
        type: Number,
        default: null
    },
    timeOriginalEstimate: {
        type: Number,
        default: null
    },
    description: {
        type: String,
        default: null
    },
    shortSummary: {
        type: String,
        default: null
    },
    issueType: {
        type: Number,
        default: null
    },
    issueStatus: {
        type: Number,
        default: null
    },
    assignees: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users'
        }
    ],
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'comments'
        }
    ],
    createAt: {
        type: Date,
        default: Date.now
    },
    updateAt: {
        type: Date,
        default: Date.now
    }
})

const issueModel = mongoose.model('issues', issueSchema)

module.exports = issueModel