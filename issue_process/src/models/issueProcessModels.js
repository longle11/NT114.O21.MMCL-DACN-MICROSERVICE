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
    index_col: {
        type: Number,
        default: 0
    },
    name_process: {
        type: String,
        default: null
    },
    tag_color: {
        type: String,
        default: '#dddd'
    },
    limited_number_issues: {
        type: Number,
        default: null
    },
    createAt: {
        type: Date,
        default: Date.now
    },
    type_process: {
        type: String,
        default: 'normal'
    }
})

const issueProcessModel = mongoose.model('issue_Process', issueProcessSchema)
module.exports = issueProcessModel