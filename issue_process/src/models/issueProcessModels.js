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
    type_processes: [
        {
            name_progress: String,
            issues_progress: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'issues'
                }
            ],
            createAt: Date
        }
    ]

})

const issueProcessModel = mongoose.model('issue_Process', issueProcessSchema)
module.exports = issueProcessModel