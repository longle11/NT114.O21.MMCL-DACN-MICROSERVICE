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
        ref: 'users',
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

const epicModel = mongoose.model('epics', epicSchema)

module.exports = epicModel