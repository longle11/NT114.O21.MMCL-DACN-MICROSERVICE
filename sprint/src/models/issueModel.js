const mongoose = require("mongoose")

const issueSchema = new mongoose.Schema({
    summary: {
        type: String,
        default: null
    },
    ordinal_number: {
        type: Number,
        default: 1
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    issue_status: {
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
    issue_type: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'issueProcesses'
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'issues'
    },
    current_sprint: {
        type: mongoose.Schema.Types.ObjectId
    },
    assignees: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users'
        }
    ],
    story_point: {
        type: Number,
        default: null
    },
    sub_issue_list: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'issues'
        }
    ],
    isFlagged: {
        type: Boolean,
        default: false
    }
})
issueSchema.virtual('sprintsRefIssueList', {
    ref: 'sprints',
    foreignField: '_id',
    localField: 'issue_list'
})
issueSchema.virtual('sprintsRefCompletedIssueList', {
    ref: 'sprints',
    foreignField: '_id',
    localField: 'completed_issue_list'
})

issueSchema.virtual('issuesRefSubIssueList', {
    ref: 'issues',
    foreignField: '_id',
    localField: 'sub_issue_list'
})

const issueModel = mongoose.model('issues', issueSchema)
module.exports = issueModel