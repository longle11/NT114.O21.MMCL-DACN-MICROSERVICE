const mongoose = require("mongoose")

const issueSchema = new mongoose.Schema({
    projectId: mongoose.Schema.Types.ObjectId,
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    issue_priority: {
        type: Number,
        default: null
    },
    summary: {
        type: String,
        default: null
    },
    description: {
        type: String,
        default: null
    },
    issue_type: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'issueProcesses'
    },
    issue_status: {
        type: Number,
        default: null
    },
    assignees: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users'
        }
    ],
    epic_link: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'epics'
    },
    story_point: {
        type: Number,
        default: null
    },
    fix_version: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'versions'
    },
    current_sprint: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sprints'
    },
    old_sprint: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sprints'
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