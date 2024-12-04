const mongoose = require("mongoose")

const commentSchema = new mongoose.Schema({
    issueId: {
        type: String,
        default: null
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    content: {
        type: String,
        default: null
    },
    timeStamp: {
        type: Date,
        default: Date.now
    },
    isModified: {
        type: Boolean,
        default: false
    }
}, { suppressReservedKeysWarning: true })

const commentModel = mongoose.model("comments", commentSchema);

module.exports = commentModel