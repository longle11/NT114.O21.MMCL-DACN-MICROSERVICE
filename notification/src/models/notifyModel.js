const mongoose = require("mongoose")

const notifySchema = new mongoose.Schema({
    send_from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    send_to: {
        type: mongoose.Schema.Types.ObjectId
    },
    issue_id: {
        type: mongoose.Schema.Types.ObjectId
    },
    project_id: {
        type: mongoose.Schema.Types.ObjectId
    },
    createAt: {
        type: Date,
        default: new Date()
    },
    isRead: {
        type: Boolean,
        default: false
    },
    link_url: {
        type: String
    },
    action_type: {
        type: String
    },
    content: {
        type: String
    }
})

const notifyModel = new mongoose.model('notify', notifySchema)

module.exports = notifyModel