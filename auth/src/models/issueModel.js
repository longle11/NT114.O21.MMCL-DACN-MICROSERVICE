const mongoose = require('mongoose')

const issueSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId, 
        default: null
    },
    ordinal_number: {
        type: Number,
        default: 1
    },
    project_id: {
        type: mongoose.Schema.Types.ObjectId,
        default: 'projects'
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    issue_data_type_number: {
        type: [
            {
                field_key_issue: String,
                value: Number
            }
        ],
        default: [
            { field_key_issue: 'issue_status', value: null},
        ]
    },
    issue_data_type_string: {
        type: [
            {
                field_key_issue: String,
                value: String
            }
        ],
        default: [
            { field_key_issue: 'summary', value: null, pinned: null },
        ]
    }
})


const issueModel = mongoose.model('issues', issueSchema)

module.exports = issueModel