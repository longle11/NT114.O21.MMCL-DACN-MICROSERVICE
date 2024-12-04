const mongoose = require("mongoose")

const issueHistorySchema = new mongoose.Schema({
    issue_id: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    histories: [
        {
            name_status: {
                type: String,
                default: null
            },
            type_history: {
                type: String,
                default: null
            },
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

const issueHistoryModel = mongoose.model('issueHistories', issueHistorySchema)
module.exports = issueHistoryModel