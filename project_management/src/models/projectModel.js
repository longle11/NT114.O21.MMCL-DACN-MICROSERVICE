const mongoose = require("mongoose")

const projectSchema = new mongoose.Schema({
    name_project: {
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
    key_name: {
        type: String,
        defaul: null
    },
    project_leader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    members: [
        {
            user_info: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'users'
            },
            status: {
                type: String,
                default: 'pending'
            }, //pending, approved
            user_role: Number
        }
    ],
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'categories'
    },
    marked: {
        type: Boolean,
        default: false
    },
    sprint_id: {
        type: mongoose.Schema.Types.ObjectId
    },
    table_issues_list: {
        type: [
            {
                title: String,
                key: String,
                til_index: Number,
                isShowed: Boolean
            }
        ],
        default: [
            { title: 'Key', key: 'ordinal_number', til_index: 0, isShowed: true },
            { title: 'Status', key: 'issue_status', til_index: 1, isShowed: true },
            { title: 'Summary', key: 'summary', til_index: 2, isShowed: true },
            { title: 'Type', key: 'issue_type', til_index: 3, isShowed: true },
            { title: 'Assignees', key: 'assignees', til_index: 4, isShowed: true },
            { title: 'Date Created', key: 'createAt', til_index: 5, isShowed: true },
            { title: 'Last Updated', key: 'updateAt', til_index: 6, isShowed: true },
            { title: 'Creator', key: 'creator', til_index: 7, isShowed: true },
            { title: 'Epic', key: 'epic_link', til_index: 8, isShowed: true },
            { title: 'Parent', key: 'parent', til_index: 9, isShowed: false },
            { title: 'Priority', key: 'issue_priority', til_index: 10, isShowed: false },
            { title: 'Fix version', key: 'fix_version', til_index: 11, isShowed: false },
            { title: 'Component', key: 'component', til_index: 12, isShowed: false },
            { title: 'Sprint', key: 'current_sprint', til_index: 13, isShowed: false },
            { title: 'Old Sprints', key: 'old_sprint', til_index: 14, isShowed: false },
            { title: 'Story point', key: 'story_point', til_index: 15, isShowed: false },
            { title: 'Start date', key: 'start_date', til_index: 16, isShowed: false },
            { title: 'End date', key: 'end_date', til_index: 17, isShowed: false },
            { title: 'Time Original Estimate', key: 'timeOriginalEstimate', til_index: 18, isShowed: false },
            { title: 'Time Spent', key: 'timeSpent', til_index: 19, isShowed: false },
            { title: 'Time Remaining', key: 'timeRemaining', til_index: 20, isShowed: false },
        ]
    },
    notification_config: {
        type: [
            {
                event_name: String,
                user_types_is_received_notifications: Array,
                notification_id: Number,
                is_activated: Boolean
            }
        ],
        default: [
            { event_name: "An issue is created", user_types_is_received_notifications: [0, 1, 2], notification_id: 0, is_activated: true },
            { event_name: "An issue is edited", user_types_is_received_notifications: [0, 1, 2], notification_id: 1, is_activated: true },
            { event_name: "You're assigned to an issue", user_types_is_received_notifications: [0, 1, 2], notification_id: 2, is_activated: true },
            { event_name: "An issue is deleted", user_types_is_received_notifications: [0, 1, 2], notification_id: 3, is_activated: true },
            { event_name: "An issue is moved", user_types_is_received_notifications: [0, 1, 2], notification_id: 4, is_activated: true },
            { event_name: "Some one made a comment", user_types_is_received_notifications: [0, 1, 2], notification_id: 5, is_activated: true },
            { event_name: "Comment is edited", user_types_is_received_notifications: [0, 1, 2], notification_id: 6, is_activated: true },
            { event_name: "Comment is deleted", user_types_is_received_notifications: [0, 1, 2], notification_id: 7, is_activated: false },
            { event_name: "Work is logged", user_types_is_received_notifications: [0, 1, 2], notification_id: 8, is_activated: true },
            { event_name: "A workflow in the issue is removed", user_types_is_received_notifications: [0, 1, 2], notification_id: 9, is_activated: true },
            { event_name: "A workflow is applied in the issue", user_types_is_received_notifications: [0, 1, 2], notification_id: 10, is_activated: false },
            { event_name: "A restriction in the issue is applied", user_types_is_received_notifications: [0, 1, 2], notification_id: 11, is_activated: false },
            { event_name: "Someone who likes the issue", user_types_is_received_notifications: [0, 1, 2], notification_id: 12, is_activated: false },
            { event_name: "A user is removed from project", user_types_is_received_notifications: [0, 1, 2], notification_id: 13, is_activated: true },
        ]
    },
    issue_config: {
        type: Object,
        default: {
            epic_panel: false,
            version_panel: false,
            issue_type_field: true,
            issue_status_field: true,
            issue_priority_field: true,
            key_field: true,
            epic_field: true,
            version_field: true,
            assignees_field: true,
            story_point_field: true,
            parent_field: true,
        }
    }
})

const projectModel = mongoose.model('projects', projectSchema)

module.exports = projectModel