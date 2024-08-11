const mongoose = require('mongoose')

const epicSchema = new mongoose.Schema({
    project_id: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    epic_name: {
        type: String, 
        default: null
    },
    summary: {
        type: String,
        default: null
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    tag_color: {
        type: String,
        default: '#dddd'
    },
    issues: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'issues'
        }
    ],
    issues_unestimated: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'issues'
        }
    ],
    issues_estimate: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'issues'
        }
    ],
    issues_completed: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'issues'
        }
    ],
})

const epicModel = mongoose.model('epics', epicSchema)

module.exports = epicModel