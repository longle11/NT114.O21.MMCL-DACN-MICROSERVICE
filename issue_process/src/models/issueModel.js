const mongoose = require("mongoose")

const issueSchema = new mongoose.Schema({
    summary: {
        type: String,
        default: null
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    issueStatus: {
        type: Number,
        default: null
    },
    issue_priority: {
        type: Number,
        default: null
    },
    fix_version: {
        type: mongoose.Schema.Types.ObjectId
    },
    epic_link: {
        type: mongoose.Schema.Types.ObjectId
    },
    assignees: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users'
        }
    ]
})

issueSchema.virtual('issuesRefIssueList', {
    ref: 'issueProcesses',
    foreignField: '_id',
    localField: 'issue_list'
})

const issueModel = mongoose.model('issues', issueSchema)
module.exports = issueModel