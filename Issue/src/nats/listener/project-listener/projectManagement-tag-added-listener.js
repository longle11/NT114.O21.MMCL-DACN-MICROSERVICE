const issueModel = require('../../../models/issueModel')
const natsWrapper = require('../../../nats-wrapper')

const projectManagementTagAddedListener = () => {
    const options = natsWrapper.client.subscriptionOptions()
        .setManualAckMode(true)

    const subscription = natsWrapper.client.subscribe('projectmanagement-issue-tag:added', options)

    subscription.on('message', async (msg) => {
        if (typeof msg.getData() === 'string') {
            console.log(`Received event projectmanagement-issue-tag:added with sequence number: ${msg.getSequence()}`);
            const parseData = JSON.parse(msg.getData())

            const issueData = await issueModel.find({ project_id: parseData.project_id })
            if (issueData.length > 0) {
                const fieldType = parseData.data.field_type_in_issue
                for (let issue of issueData) {
                    if (issue.issue_data_type_number.findIndex(field => field.field_key_issue === 'issue_status' && field.value === parseData.issue_status) !== -1) {
                        if (fieldType === "number") {
                            const index = issue.issue_data_type_number.findIndex(field => field.field_key_issue === parseData.data.field_key_issue)
                            if (index === -1) {
                                issue.issue_data_type_number.push({ field_key_issue: parseData.data.field_key_issue, value: parseData.data.default_value, pinned: false, is_display: true, position: parseData.position, field_name: parseData.data.field_name })
                            } else {
                                issue.issue_data_type_number[index].is_display = true
                            }
                        } else if (fieldType === "string") {
                            const index = issue.issue_data_type_string.findIndex(field => field.field_key_issue === parseData.data.field_key_issue)
                            if (index === -1) {
                                var value = parseData.data.default_value
                                if (Array.isArray(parseData.data.default_value)) {
                                    value = null
                                }
                                issue.issue_data_type_string.push({ field_key_issue: parseData.data.field_key_issue, value: value, pinned: false, is_display: true, position: parseData.position, field_name: parseData.data.field_name })
                            } else {
                                issue.issue_data_type_string[index].is_display = true
                            }
                        } else if (fieldType === "array") {
                            const index = issue.issue_data_type_array.findIndex(field => field.field_key_issue === parseData.data.field_key_issue)
                            if (index === -1) {
                                issue.issue_data_type_array.push({ field_key_issue: parseData.data.field_key_issue, value: parseData.data.default_value, pinned: false, is_display: true, position: parseData.position, field_name: parseData.data.field_name })
                            } else {
                                issue.issue_data_type_array[index].is_display = true
                            }
                        } else if (fieldType === "object") {
                            const index = issue.issue_data_type_object.findIndex(field => field.field_key_issue === parseData.data.field_key_issue)
                            if (index === -1) {
                                var referenceField = null
                                if (parseData.data.field_key_issue === 'current_sprint') {
                                    referenceField = 'sprints'
                                } else if (parseData.data.field_key_issue === 'fix_version') {
                                    referenceField = 'versions'
                                } else if (parseData.data.field_key_issue === 'epic_link') {
                                    referenceField = 'epics'
                                } else if (parseData.data.field_key_issue === 'parent') {
                                    referenceField = 'issues'
                                } else if (parseData.data.field_key_issue === 'report' || parseData.data.field_key_issue.includes('new-tag_single_user')) {
                                    referenceField = 'users'
                                }
                                issue.issue_data_type_object.push({ field_key_issue: parseData.data.field_key_issue, value: parseData.data.default_value, pinned: false, is_display: true, propertyModel: referenceField, position: parseData.position, field_name: parseData.data.field_name })
                            } else {
                                issue.issue_data_type_object[index].is_display = true
                            }
                        } else if (fieldType === "array-object") {
                            const index = issue.issue_data_type_array_object.findIndex(field => field.field_key_issue === parseData.data.field_key_issue)
                            if (index === -1) {
                                var referenceField = null
                                if (parseData.data.field_key_issue === 'assignees') {
                                    referenceField = 'users'
                                } else if (parseData.data.field_key_issue === 'old_sprint') {
                                    referenceField = 'sprints'
                                } else if (parseData.data.field_key_issue === 'approvers') {
                                    referenceField = 'users'
                                } else if (parseData.data.field_key_issue.includes("new-tag_multi_users")) {
                                    referenceField = 'users'
                                }
                                issue.issue_data_type_array_object.push({ field_key_issue: parseData.data.field_key_issue, value: parseData.data.default_value, pinned: false, is_display: true, propertyModel: referenceField, position: parseData.position, field_name: parseData.data.field_name })
                            } else {
                                issue.issue_data_type_array_object[index].is_display = true
                            }
                        }
                        await issue.save()
                    }
                }
            }
            msg.ack()
        }
    })
}

module.exports = projectManagementTagAddedListener