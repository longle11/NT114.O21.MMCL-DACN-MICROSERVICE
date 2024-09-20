const mongoose = require('mongoose')

const issueSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId, 
        default: null
    },
    summary: {
        type: String,
        default: null
    },
    ordinal_number: {
        type: Number,
        default: 1
    },
    project_id: {
        type: mongoose.Schema.Types.ObjectId,
        default: 'projects'
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    issue_status: {
        type: Number,
        default: null
    }
})


const issueModel = mongoose.model('issues', issueSchema)

module.exports = issueModel