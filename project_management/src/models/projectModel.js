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
    members: [
        {
            user_info: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'users'
            },
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
            { title: 'Status', key: 'issue_status', til_index: 0, isShowed: true },
            { title: 'Summary', key: 'summary', til_index: 1, isShowed: true },
            { title: 'Type', key: 'issue_type', til_index: 2, isShowed: true },
            { title: 'Assignees', key: 'assignees', til_index: 3, isShowed: true },
            { title: 'Date Created', key: 'createAt', til_index: 4, isShowed: true },
            { title: 'Last Updated', key: 'updateAt', til_index: 5, isShowed: true },
            { title: 'Creator', key: 'creator', til_index: 6, isShowed: true },
            { title: 'Epic', key: 'epic_link', til_index: 7, isShowed: true },
            { title: 'Parent', key: 'parent', til_index: 8, isShowed: false },
            { title: 'Priority', key: 'issue_priority', til_index: 9, isShowed: false },
            { title: 'Fix version', key: 'fix_version', til_index: 10, isShowed: false },
            { title: 'Component', key: 'component', til_index: 11, isShowed: false },
            { title: 'Sprint', key: 'current_sprint', til_index: 12, isShowed: false },
            { title: 'Old Sprints', key: 'old_sprint', til_index: 13, isShowed: false },
            { title: 'Story point', key: 'story_point', til_index: 14, isShowed: false },
            { title: 'Start date', key: 'start_date', til_index: 15, isShowed: false },
            { title: 'End date', key: 'end_date', til_index: 16, isShowed: false },
            { title: 'Time Original Estimate', key: 'timeOriginalEstimate', til_index: 17, isShowed: false },
            { title: 'Time Spent', key: 'timeSpent', til_index: 18, isShowed: false },
            { title: 'Time Remaining', key: 'timeRemaining', til_index: 19, isShowed: false },
        ]
    }
})

const projectModel = mongoose.model('projects', projectSchema)

module.exports = projectModel