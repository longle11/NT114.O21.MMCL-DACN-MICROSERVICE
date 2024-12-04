const mongoose = require("mongoose")

const issueSchema = new mongoose.Schema({
    summary: {
        type: String,
        default: null
    },
    ordinal_number: {
        type: Number,
        default: 1
    },
    issue_data_type_number: {
        type: [
            {
                field_key_issue: String,
                value: Number
            }
        ],
        default: [
            { field_key_issue: 'story_point', value: null },
            { field_key_issue: 'issue_status', value: null },
            { field_key_issue: 'issue_priority', value: 2 },
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
    },
    issue_data_type_object: {
        type: [
            {
                field_key_issue: String,
                propertyModel: {
                    type: String,
                    enum: ['issueProcesses', 'users', 'sprints', 'issues', 'versions', 'epics'],
                },
                value: { type: mongoose.Schema.Types.ObjectId }
            }
        ],
        default: [
            { field_key_issue: 'issue_type', value: null, propertyModel: 'issueProcesses' },
            { field_key_issue: 'epic_link', value: null, propertyModel: 'epics' },
            { field_key_issue: 'fix_version', value: null, propertyModel: 'versions' },
            { field_key_issue: 'parent', value: null, propertyModel: 'issues' },
        ]
    },
    issue_data_type_array_object: {
        type: [
            {
                field_key_issue: String,
                propertyModel: {
                    type: String,
                    enum: ['issueProcesses', 'users', 'sprints', 'issues', 'versions', 'epics', 'components'],
                },
                value: [{ type: mongoose.Schema.Types.ObjectId, refPath: 'propertyModel' }],
                pinned: Boolean
            }
        ],
        default: [
            { field_key_issue: 'assignees', value: null, propertyModel: 'users' },
        ]
    },

})

issueSchema.virtual('issuesRefIssueList', {
    ref: 'issueProcesses',
    foreignField: '_id',
    localField: 'issue_list'
})

const issueModel = mongoose.model('issues', issueSchema)
module.exports = issueModel