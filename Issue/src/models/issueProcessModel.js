const mongoose = require('mongoose')

const issueProcessSchema = mongoose.Schema({
    name_process: {
        type: String, 
        default: null
    },
    tag_color: {
        type: String,
        default: '#ddd'
    },
    project_id: {
        type: mongoose.Schema.Types.ObjectId,
    },
    type_process: {
        type: String,
        default: 'normal'
    }
})

const issueProcessModel = mongoose.model('issueProcesses', issueProcessSchema)

module.exports = issueProcessModel