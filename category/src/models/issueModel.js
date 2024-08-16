const mongoose = require('mongoose')

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

issueSchema.virtual('issuesRefIssueVersionModel', {
    ref: 'versions',
    foreignField: '_id',
    localField: 'issues'
})
issueSchema.virtual('issuesRefIssueCompletedVersionModel', {
    ref: 'versions',
    foreignField: '_id',
    localField: 'issues_completed'
})
issueSchema.virtual('issuesRefIssueEstimatVersionModel', {
    ref: 'versions',
    foreignField: '_id',
    localField: 'issues_estimate'
})
issueSchema.virtual('issuesRefIssueUnestimatedVersionModel', {
    ref: 'versions',
    foreignField: '_id',
    localField: 'issues_unestimated'
})


issueSchema.virtual('issuesRefIssueEpicModel', {
    ref: 'epics',
    foreignField: '_id',
    localField: 'issues'
})
issueSchema.virtual('issuesRefIssueCompletedEpicModel', {
    ref: 'epics',
    foreignField: '_id',
    localField: 'issues_completed'
})
issueSchema.virtual('issuesRefIssueEstimatEpicModel', {
    ref: 'epics',
    foreignField: '_id',
    localField: 'issues_estimate'
})
issueSchema.virtual('issuesRefIssueUnestimatedEpicModel', {
    ref: 'epics',
    foreignField: '_id',
    localField: 'issues_unestimated'
})

const issueModel = mongoose.model('issues', issueSchema)

module.exports = issueModel