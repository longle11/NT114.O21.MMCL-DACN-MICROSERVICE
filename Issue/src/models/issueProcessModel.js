const mongoose = require('mongoose')

const issueProcessSchema = mongoose.Schema({
    name_process: {
        type: String, 
        default: null
    },
    tag_color: {
        type: String,
        default: '#ddd'
    }
})

issueProcessSchema.virtual('issueRefissueProcessLink', {
    ref: 'issues',
    foreignField: '_id',
    localField: 'issue_type'
})

const issueProcessModel = mongoose.model('issueProcesses', issueProcessSchema)

module.exports = issueProcessModel