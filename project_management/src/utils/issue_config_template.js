const issue_template_configs = [
    {
        icon_field_type: '<i className="fab fa-amilia"></i>',
        field_description: 'Represents for the short description of issues',
        field_name: 'Summary',
        field_key_issue: 'summary',
        field_type_in_issue: 'string',
        field_position_display: [
            { position: 0, issue_status: 0 },
            { position: 0, issue_status: 1 },
            { position: 0, issue_status: 2 },
            { position: 0, issue_status: 4 }
        ],
        field_is_edited: false,
        field_type: 0,
        field_is_deleted: false,
        is_required: true,
        default_value: null
    },
    {
        icon_field_type: '<i className="fa fa-arrow-right"></i>',
        field_description: 'Represents for current process of an issue',
        field_name: 'Type',
        field_type_in_issue: 'object',
        field_key_issue: 'issue_type',
        field_position_display: [
            { position: 0, issue_status: 0 },
            { position: 0, issue_status: 1 },
            { position: 0, issue_status: 2 },
            { position: 0, issue_status: 4 }
        ],
        field_is_edited: false,
        field_type: 11,
        field_is_deleted: false,
        is_required: true,
        default_value: null
    },
    {
        icon_field_type: '<i className="fa fa-paragraph"></i>',
        field_description: 'Represents for the detail description of issues',
        field_name: 'Description',
        field_key_issue: 'description',
        field_type_in_issue: 'string',
        field_position_display: [
            { position: 0, issue_status: 0 },
            { position: 0, issue_status: 1 },
            { position: 0, issue_status: 2 },
            { position: 0, issue_status: 4 }
        ],
        field_is_edited: false,
        field_type: 1,
        field_is_deleted: false,
        is_required: false,
        default_value: null
    },
    {
        icon_field_type: '<i className="fa fa-users"></i>',
        field_description: 'Contains users who assigned to an issue',
        field_name: 'Assignees',
        field_type_in_issue: 'array-object',
        field_key_issue: 'assignees',
        field_position_display: [
            { position: 1, issue_status: 0 },
            { position: 1, issue_status: 1 },
            { position: 1, issue_status: 2 },
            { position: 1, issue_status: 4 }
        ],
        field_is_edited: false,
        field_type: 9,
        field_is_deleted: false,    //hien thi nut delete hay khong
        is_required: false,
        default_value: null
    },
    {
        icon_field_type: '<i className="fa fa-users"></i>',
        field_description: 'Contains users needed for approval. This custom field was created by TaskScheduler.',
        field_name: 'Approvers',
        field_type_in_issue: 'array-object',
        field_key_issue: 'approvers',
        field_position_display: [],
        field_is_edited: false,
        field_type: 9,
        field_is_deleted: false,
        is_required: false,
        default_value: null
    },
    {
        icon_field_type: '<i className="fa fa-user"></i>',
        field_description: 'Represents for someone who created an issue',
        field_type_in_issue: 'object',
        field_name: 'Reporter',
        field_key_issue: 'reporter',
        field_position_display: [
            { position: 1, issue_status: 0 },
            { position: 1, issue_status: 1 },
            { position: 1, issue_status: 2 }
        ],
        field_is_edited: false,
        field_type: 8,
        field_is_deleted: false,
        is_required: false,
        default_value: null
    },
    {
        icon_field_type: '<i className="fa fa-code-branch"></i>',
        field_description: 'This field represents for parent of sub-issues',
        field_type_in_issue: 'object',
        field_name: 'Parent',
        field_key_issue: 'parent',
        field_position_display: [
            { position: 1, issue_status: 0 },
            { position: 1, issue_status: 1 },
            { position: 1, issue_status: 2 },
            { position: 1, issue_status: 4 }
        ],
        field_is_edited: false,
        field_type: 10,
        field_is_deleted: false,
        is_required: false,
        default_value: null
    },
    {
        icon_field_type: '<i className="fab fa-viadeo"></i>',   //cho sprint
        field_description: 'Task scheduler sprint field',
        field_name: 'Sprint',
        field_type_in_issue: 'object',
        field_key_issue: 'current_sprint',
        field_position_display: [
            { position: 1, issue_status: 0 },
            { position: 1, issue_status: 1 },
            { position: 1, issue_status: 2 }
        ],
        field_is_edited: false,
        field_type: 11,
        field_is_deleted: false,
        is_required: false,
        default_value: null
    },
    {
        icon_field_type: '<i className="fa fa-bolt"></i>',  //cho epic
        field_description: 'TaskScheduler epic link field',
        field_type_in_issue: 'object',
        field_name: 'Epic Link',
        field_key_issue: 'epic_link',
        field_position_display: [
            { position: 1, issue_status: 0 },
            { position: 1, issue_status: 1 },
            { position: 1, issue_status: 2 }
        ],
        field_is_edited: false,
        field_type: 11,
        field_is_deleted: false,
        is_required: false,
        default_value: null
    },
    {
        icon_field_type: '<i className="fa-solid fa-folder-open"></i>',  //cho epic
        field_description: 'TaskScheduler fix version field',
        field_name: 'Fix Version',
        field_type_in_issue: 'object',
        field_key_issue: 'fix_version',
        field_position_display: [
            { position: 1, issue_status: 0 },
            { position: 1, issue_status: 1 },
            { position: 1, issue_status: 2 }
        ],
        field_is_edited: false,
        field_type: 11,
        field_is_deleted: false,
        is_required: false,
        default_value: null
    },
    {
        icon_field_type: '<i className="fa fa-calendar-alt"></i>',
        field_description: 'Allows the planned start date for a piece of work to be set.',
        field_name: 'Start Date',
        field_type_in_issue: 'string',
        field_key_issue: 'start_date',
        field_position_display: [
            { position: 1, issue_status: 0 },
            { position: 1, issue_status: 1 },
            { position: 1, issue_status: 2 },
            { position: 1, issue_status: 4 }
        ],
        field_is_edited: false,
        field_type: 2,
        field_is_deleted: false,
        is_required: false,
        default_value: null
    },
    {
        icon_field_type: '<i className="fa fa-calendar-alt"></i>',
        field_description: 'Allows to set the due date of issues',
        field_name: 'End Date',
        field_type_in_issue: 'string',
        field_key_issue: 'end_date',
        field_position_display: [
            { position: 1, issue_status: 0 },
            { position: 1, issue_status: 1 },
            { position: 1, issue_status: 2 },
            { position: 1, issue_status: 4 }
        ],
        field_is_edited: false,
        field_type: 2,
        field_is_deleted: false,
        is_required: false,
        default_value: null
    },
    {
        icon_field_type: '<i className="fa fa-calendar-alt"></i>',
        field_description: 'Enter when the change actually started.',
        field_name: 'Actual Start',
        field_type_in_issue: 'string',
        field_key_issue: 'actual_start',
        field_position_display: [],
        field_is_edited: false,
        field_type: 2,
        field_is_deleted: false,
        is_required: false,
        default_value: null
    },
    {
        icon_field_type: '<i className="fa fa-calendar-alt"></i>',
        field_description: 'Enter when the change actually ended.',
        field_name: 'Actual End',
        field_key_issue: 'actual_end',
        field_type_in_issue: 'string',
        field_position_display: [],
        field_is_edited: false,
        field_type: 2,
        field_is_deleted: false,
        is_required: false,
        default_value: null
    },
    {
        icon_field_type: '<i className="fa-solid fa-clock"></i>',
        field_description: 'Represents the time which someone spent on an issue',
        field_name: 'Time Spent',
        field_type_in_issue: 'number',
        field_key_issue: 'timeSpent',
        field_position_display: [
            { position: 1, issue_status: 0 },
            { position: 1, issue_status: 1 },
            { position: 1, issue_status: 2 },
            { position: 1, issue_status: 4 },
        ],
        field_is_edited: false,
        field_type: 4,
        field_is_deleted: false,
        is_required: false,
        default_value: null
    },
    {
        icon_field_type: '<i className="fa-solid fa-clock"></i>',
        field_description: 'Represents the estimate time needs to solve an issue',
        field_name: 'Time Original Estimate',
        field_type_in_issue: 'number',
        field_key_issue: 'timeOriginalEstimate',
        field_position_display: [
            { position: 1, issue_status: 0 },
            { position: 1, issue_status: 1 },
            { position: 1, issue_status: 2 },
            { position: 1, issue_status: 4 },
        ],
        field_is_edited: false,
        field_type: null,
        field_is_deleted: false,
        is_required: false,
        default_value: null
    },
    {
        icon_field_type: '<i className="fa-solid fa-list-ol"></i>',
        field_description: 'Measurement of complexity and/or size of a requirement.',
        field_name: 'Story Point',
        field_type_in_issue: 'number',
        field_key_issue: 'story_point',
        field_position_display: [
            { position: 1, issue_status: 0 },
            { position: 1, issue_status: 1 },
            { position: 1, issue_status: 2 }
        ],
        field_is_edited: false,
        field_type: 3,
        field_is_deleted: false,
        is_required: false,
        default_value: null
    },
    {
        icon_field_type: '<i className="fa fa-square"></i>',
        field_description: '',
        field_name: 'Component',
        field_type_in_issue: 'array-object',
        field_key_issue: 'component',
        field_position_display: [
            { position: 1, issue_status: 0 },
            { position: 1, issue_status: 1 },
            { position: 1, issue_status: 2 }
        ],
        field_is_edited: false,
        field_type: 9,
        field_is_deleted: false,
        is_required: false,
        default_value: null
    },
    {
        icon_field_type: '<i className="fa fa-arrow-alt-circle-down"></i>',
        field_description: 'Represents the priority of an issue',
        field_name: 'Priority',
        field_type_in_issue: 'number',
        field_key_issue: 'issue_priority',
        field_position_display: [
            { position: 1, issue_status: 0 },
            { position: 1, issue_status: 1 },
            { position: 1, issue_status: 2 },
            { position: 1, issue_status: 4 },
        ],
        field_is_edited: false,
        field_type: 11,
        field_is_deleted: false,
        issue_statuses: [0, 1, 2, 4],
        is_required: true,
        default_value: 2
    },
    {
        icon_field_type: '<i className="fa fa-tag"></i>',
        field_description: 'TaskScheduler lables field',
        field_name: 'Labels',
        field_type_in_issue: 'array',
        field_key_issue: 'label',
        field_position_display: [],
        field_is_edited: false,
        field_type: 5,
        field_is_deleted: false,
        is_required: false,
        default_value: null
    },
    {
        icon_field_type: '<i className="fa fa-arrow-alt-circle-down"></i>',
        field_description: 'TaskScheduler change risk field',
        field_name: 'Change Risk',
        field_key_issue: 'change_risk',
        field_type_in_issue: 'string',
        field_position_display: [],
        field_is_edited: false,
        field_type: 6,
        field_is_deleted: false,
        is_required: false,
        default_value: ['Critical', 'High', 'Medium', 'Low']
    },
    {
        icon_field_type: '<i className="fa fa-arrow-alt-circle-down"></i>',
        field_description: 'Choose the reason for the change request',
        field_name: 'Change Reason',
        field_key_issue: 'change_reason',
        field_type_in_issue: 'string',
        field_position_display: [],
        field_is_edited: false,
        field_type: 6,
        field_is_deleted: false,
        is_required: false,
        default_value: ['Repair', 'Upgrade', 'Maintenance', 'New functionality', 'Other']
    },
    {
        icon_field_type: '<i className="fa fa-arrow-alt-circle-down"></i>',
        field_description: 'TaskScheduler change type field',
        field_name: 'Change Type',
        field_key_issue: 'change_type',
        field_type_in_issue: 'string',
        field_position_display: [],
        field_is_edited: false,
        field_type: 6,
        field_is_deleted: false,
        is_required: false,
        default_value: ['Standard', 'Normal', 'Emergency']
    },
    {
        icon_field_type: '<i className="fa fa-arrow-alt-circle-down"></i>',
        field_description: 'TaskScheduler impact field',
        field_type_in_issue: 'string',
        field_name: 'Impact',
        field_key_issue: 'impact',
        field_position_display: [],
        field_is_edited: false,
        field_type: 6,
        field_is_deleted: false,
        is_required: false,
        default_value: ['Extensive / Widespread', 'Significant / Large', 'Moderate / Limited', 'Minor / Localized']
    }
]

const typeProject = (type) => {
    return issue_template_configs.filter(field => {
        if (type?.toLowerCase() === 'kanban' && !['current_sprint', 'epic_link', 'fix_version'].includes(field.field_key_issue)) {
            return true
        } else if (type?.toLowerCase() === 'scrum') {
            return true
        }
        return false
    })
}

module.exports = typeProject