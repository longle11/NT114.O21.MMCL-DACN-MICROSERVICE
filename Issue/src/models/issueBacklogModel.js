const mongoose = require('mongoose')

const issueBacklogSchema = mongoose.Schema({
    project_id: {
        type: mongoose.Schema.Types.ObjectId, 
        default: null
    },
    issue_list: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'issues'
        }
    ]
})

issueBacklogSchema.virtual('issueRefIssueList', {
    ref: 'issues',
    foreignField: '_id',
    localField: 'issue_list'
})

const issueBacklogModel = mongoose.model('issueBacklog', issueBacklogSchema)

module.exports = issueBacklogModel