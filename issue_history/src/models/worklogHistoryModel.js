const mongoose = require('mongoose')

const worklogHistorySchema = mongoose.Schema({
    project_id: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    issue_id: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    working_date: {
        type: Date,
        default: Date.now
    },
    description: {
        type: String,
        default: null
    }
})
const worklogHistoryModel = new mongoose.model('worklogHistories', worklogHistorySchema)

module.exports = worklogHistoryModel