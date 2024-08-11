const mongoose = require('mongoose')

const issueSchema = new mongoose.Schema({
    issue_type: {
        type: Number,
        default: null
    },
    issue_priority: {
        type: Number,
        default: 2
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
    foreignField: 'issues_completed'
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
    foreignField: 'issues_completed'
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