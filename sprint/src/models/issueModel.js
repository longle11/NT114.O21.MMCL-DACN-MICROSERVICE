const mongoose = require("mongoose")

const issueSchema = new mongoose.Schema({
    epic_name: {
        type: String, 
        default: null
    },
    summary: {
        type: String,
        default: null
    },
    reporter: mongoose.Schema.Types.ObjectId,
    issueStatus: {
        type: Number,
        default: null
    },
    priority: {
        type: Number,
        default: null
    },
    version: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    }
})

const issueModel = mongoose.model('issues', issueSchema)
module.exports = issueModel