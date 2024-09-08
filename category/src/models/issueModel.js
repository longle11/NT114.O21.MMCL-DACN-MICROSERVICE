const mongoose = require('mongoose')

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
    issue_type: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
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
    }
})

issueSchema.virtual('issuesRefIssueVersionModel', {
    ref: 'versions',
    foreignField: '_id',
    localField: 'issue_list'
})


issueSchema.virtual('issuesRefIssueEpicModel', {
    ref: 'epics',
    foreignField: '_id',
    localField: 'issue_list'
})


const issueModel = mongoose.model('issues', issueSchema)

module.exports = issueModel