const mongoose = require("mongoose")

const commentSchema = new mongoose.Schema({
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
})

commentSchema.virtual('issueRefComments', {
    ref: 'issues',
    foreignField: '_id',
    localField: 'comments'
})

commentSchema.virtual('userRefCreator', {
    ref: 'users',
    foreignField: '_id',
    localField: 'creator'
})

const commentModel = mongoose.model("comments", commentSchema);

module.exports = commentModel