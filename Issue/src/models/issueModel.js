const mongoose = require("mongoose")

const issueSchema = new mongoose.Schema({
    project_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'projects'
    },
    ordinal_number: {
        type: Number,
        default: 1
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    issue_priority: {
        type: Number,
        default: 2
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
        ref: 'issueProcesses',
        default: null
    },
    issue_status: {
        type: Number,
        default: 0
    },
    assignees: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users'
        }
    ],
    epic_link: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'epics',
        default: null
    },
    story_point: {
        type: Number,
        default: null
    },
    fix_version: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'versions',
        default: null
    },
    current_sprint: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sprints',
        default: null
    },
    old_sprint: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'sprints',
            default: null
        }
    ],
    timeSpent: {
        type: Number,
        default: 0
    },
    timeOriginalEstimate: {
        type: Number,
        default: 0
    },
    createAt: {
        type: Date,
        default: Date.now
    },
    updateAt: {
        type: Date,
        default: Date.now
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    sub_issue_list: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'issues'
        }
    ],
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'issues'
    }
})
issueSchema.virtual('issuesRefSubIssueList', {
    ref: 'issues',
    foreignField: '_id',
    localField: 'sub_issue_list'
})
issueSchema.virtual('issuesRefParent', {
    ref: 'issues',
    foreignField: '_id',
    localField: 'parent'
})
const issueModel = mongoose.model('issues', issueSchema)


module.exports = issueModel