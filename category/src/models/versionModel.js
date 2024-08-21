const mongoose = require('mongoose')

const versionSchema = new mongoose.Schema({
    project_id: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    version_name: {
        type: String, 
        default: null
    },
    start_date: {
        type: String,
        default: null
    },
    end_date: {
        type: String,
        default: null
    },
    description: {
        type: String,
        default: null
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    progress: {
        type: Number,
        default: null
    },
    version_status: {
        type: Number,
        default: null
    },
    tag_color: {
        type: String,
        default: '#dddd'
    },
    issue_list: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'issues'
        }
    ]
})

const versionModel = mongoose.model('versions', versionSchema)

module.exports = versionModel