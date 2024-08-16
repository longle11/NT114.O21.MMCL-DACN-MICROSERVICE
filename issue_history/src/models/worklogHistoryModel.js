const mongoose = require('mongoose')

const worklogHistorySchema = mongoose.Schema({
    issue_id: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    working_date: {
        type: String,
        default: null
    },
    description: {
        type: String,
        default: null
    },
    timeSpent: {
        type: String,
        default: null
    }
})
const worklogHistoryModel = new mongoose.model('worklogHistories', worklogHistorySchema)

module.exports = worklogHistoryModel