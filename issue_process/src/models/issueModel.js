const mongoose = require("mongoose")

const issueSchema = new mongoose.Schema({
    epic_name: {
        type: String, 
        default: null
    },
    summary: {
        type: String,
        default: null
    },
    assignees: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users'
        }
    ],
    issue_priority: {
        type: Number,
        default: 2
    },
    issue_type: {
        type: Number,
        default: null
    }
})

issueSchema.virtual('issuesRefIssueList', {
    ref: 'issueProcesses',
    foreignField: '_id',
    localField: 'issue_list'
})

const issueModel = mongoose.model('issues', issueSchema)
module.exports = issueModel