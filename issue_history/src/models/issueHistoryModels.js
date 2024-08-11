const mongoose = require("mongoose")

const issueHistorySchema = new mongoose.Schema({
    project_id: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    issue_id: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    history: [
        {
            name_status: String,
            update_by: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'users'
            },
            createAt: Date,
            old_status: String,
            new_status: String
        }
    ]
})

const issueHistoryModel = mongoose.model('issue_history', issueHistorySchema)
module.exports = issueHistoryModel