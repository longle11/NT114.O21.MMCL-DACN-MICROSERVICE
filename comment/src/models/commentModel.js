const mongoose = require("mongoose")

const commentSchema = new mongoose.Schema({
    issueId: {
        type: String,
        default: null
    },
    creator: mongoose.Schema.Types.ObjectId,
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
})

const commentModel = mongoose.model("comments", commentSchema);

module.exports = commentModel