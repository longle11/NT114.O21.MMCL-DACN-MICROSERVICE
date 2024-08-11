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
            createBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'users'
            },
            createAt: {
                type: Date,
                default: Date.now
            },
            old_status: {
                type: String,
                default: null
            },
            new_status: {
                type: String,
                default: null
            }
        }
    ]
})

const issueHistoryModel = mongoose.model('issue_history', issueHistorySchema)
module.exports = issueHistoryModel