const mongoose = require("mongoose")

const issueSchema = new mongoose.Schema({
    project_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'projects'
    },
    ordinal_number: {
        type: Number,
        default: 1
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    issue_data_type_number: {
        type: [
            {
                field_key_issue: String,
                field_name: String,
                value: Number,
                pinned: Boolean,
                is_display: Boolean,
                position: Number
            }
        ],
        default: []
    },
    issue_data_type_string: {
        type: [
            {
                field_key_issue: String,
                value: String,
                field_name: String,
                pinned: Boolean,
                is_display: Boolean,
                position: Number
            }
        ],
        default: [
            { field_key_issue: 'summary', value: null, pinned: false, is_display: true },
            { field_key_issue: 'description', value: null, pinned: false, is_display: true },
            { field_key_issue: 'start_date', value: null, pinned: false, is_display: true },
            { field_key_issue: 'end_date', value: null, pinned: false, is_display: true },
            { field_key_issue: 'actual_start', value: null, pinned: false, is_display: true },
            { field_key_issue: 'actual_end', value: null, pinned: false, is_display: true },
        ]
    },
    issue_data_type_array: {
        type: [
            {
                field_key_issue: String,
                value: Array,
                field_name: String,
                pinned: Boolean,
                is_display: Boolean,
                position: Number
            }
        ],
        default: [
            { field_key_issue: 'label', value: null, pinned: false, is_display: true },
            { field_key_issue: 'change_risk', value: null, pinned: false, is_display: true },
            { field_key_issue: 'change_reason', value: null, pinned: false, is_display: true },
            { field_key_issue: 'change_type', value: null, pinned: false, is_display: true },
            { field_key_issue: 'impact', value: null, pinned: false, is_display: true },
        ]
    },
    issue_data_type_object: {
        type: [
            {
                field_key_issue: String,
                field_name: String,
                propertyModel: {
                    type: String,
                    required: true,
                    enum: ['issueProcesses', 'users', 'sprints', 'issues', 'versions', 'epics'],
                },
                value: { type: mongoose.Schema.Types.ObjectId, ref: subdoc => subdoc.propertyModel },
                pinned: Boolean,
                is_display: Boolean,
                position: Number
            }
        ],
        default: [
            { field_key_issue: 'current_sprint', value: null, propertyModel: 'sprints', pinned: false, is_display: true },
            { field_key_issue: 'issue_type', value: null, propertyModel: 'issueProcesses', pinned: false, is_display: true },
            { field_key_issue: 'reporter', value: null, propertyModel: 'users', pinned: false, is_display: true },
            { field_key_issue: 'epic_link', value: null, propertyModel: 'epics', pinned: false, is_display: true },
            { field_key_issue: 'fix_version', value: null, propertyModel: 'versions', pinned: false, is_display: true }
        ]
    },
    issue_data_type_array_object: {
        type: [
            {
                field_key_issue: String,
                field_name: String,
                propertyModel: {
                    type: String,
                    required: true,
                    enum: ['issueProcesses', 'users', 'sprints', 'issues', 'versions', 'epics', 'components'],
                },
                value: [{ type: mongoose.Schema.Types.ObjectId, ref: subdoc => subdoc.propertyModel }],
                pinned: Boolean,
                is_display: Boolean,
                position: Number
            }
        ],
        default: [
            { field_key_issue: 'assignees', value: null, propertyModel: 'users', pinned: false, is_display: true },
            { field_key_issue: 'old_sprint', value: null, propertyModel: 'sprints', pinned: false, is_display: true },
            { field_key_issue: 'approvers', value: null, propertyModel: 'users', pinned: false, is_display: true },
        ]
    },

    isCompleted: {
        type: Boolean,
        default: false
    },
    sub_issue_list: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'issues'
        }
    ],
    voted: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users'
        }
    ],
    isFlagged: {
        type: Boolean,
        default: false
    },
    file_uploaded: [
        {
            type: mongoose.Schema.Types.ObjectId
        }
    ],
    is_permissions: {
        type: Boolean,
        default: false
    },
    createAt: {
        type: Date,
        default: Date.now
    },
    updateAt: {
        type: Date,
        default: Date.now
    },
    permissions: {
        users_belongto_issue: {
            assignees: {
                type: Array,
                default: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
            }
        },
        users_not_belongto_issue: {
            administrators: {
                user_role: {
                    type: Number,
                    default: 0
                },
                actions: {
                    type: Array,
                    default: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
                }
            },
            members: {
                user_role: {
                    type: Number,
                    default: 1
                },
                actions: {
                    type: Array,
                    default: [8, 9, 10, 11, 12]
                }
            },
            viewers: {
                user_role: {
                    type: Number,
                    default: 2
                },
                actions: {
                    type: Array,
                    default: [8, 9, 12]
                }
            }
        }
    }
})


const issueModel = mongoose.model('issues', issueSchema)
module.exports = issueModel
