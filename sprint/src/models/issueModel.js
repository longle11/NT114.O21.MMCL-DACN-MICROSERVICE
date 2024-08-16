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
        type: mongoose.Schema.Types.ObjectId,
        ref: 'versions'
    },
    epic_link: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'epics'
    },
    assignees: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users'
        }
    ]
})
issueSchema.virtual('sprintsRefIssueList', {
    ref: 'sprints',
    foreignField: '_id',
    localField: 'issue_list'
})

const issueModel = mongoose.model('issues', issueSchema)
module.exports = issueModel