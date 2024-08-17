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
        type: Date,
        default: Date.now
    },
    end_Date: {
        type: Date,
        default: Date.now
    },
    description: {
        type: String,
        default: null
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
        type: Number,
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