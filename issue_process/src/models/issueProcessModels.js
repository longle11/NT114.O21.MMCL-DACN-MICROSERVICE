const mongoose = require("mongoose")

const issueProcessSchema = new mongoose.Schema({
    project_id: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    sprint_id: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    name_process: {
        type: String,
        default: null
    },
    issue_list: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'issues'
        }
    ],
    createAt: {
        type: Date,
        default: Date.now
    }
})

const issueProcessModel = mongoose.model('issue_Process', issueProcessSchema)
module.exports = issueProcessModel