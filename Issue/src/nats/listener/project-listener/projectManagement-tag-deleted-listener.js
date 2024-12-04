const issueModel = require('../../../models/issueModel')
const natsWrapper = require('../../../nats-wrapper')

const projectManagementTagDeletedListener = () => {
    const options = natsWrapper.client.subscriptionOptions()
        .setManualAckMode(true)

    const subscription = natsWrapper.client.subscribe('projectmanagement-issue-tag:deleted', options)

    subscription.on('message', async (msg) => {
        if (typeof msg.getData() === 'string') {
            console.log(`Received event projectmanagement-issue-tag:deleted with sequence number: ${msg.getSequence()}`);

            const parseData = JSON.parse(msg.getData())
            console.log("parse data nhan duoc ", parseData);
            

            const issueData = await issueModel.find({ project_id: parseData.project_id })
            if (issueData.length > 0) {
                const fieldType = parseData.data.field_type_in_issue
                for(let issue of issueData) {
                    if(issue.issue_data_type_number.findIndex(field => field.field_key_issue === 'issue_status' && field.value === parseData.issue_status) !== -1) {
                        if (fieldType === "number") {
                            const positionField = issue.issue_data_type_number.findIndex(field => field.field_key_issue === parseData.data.field_key_issue)
                            if(positionField !== -1) {
                                issue.issue_data_type_number[positionField].is_display = false
                            }
                        } else if (fieldType === "string") {
                            const positionField = issue.issue_data_type_string.findIndex(field => field.field_key_issue === parseData.data.field_key_issue)
                            if(positionField !== -1) {
                                issue.issue_data_type_string[positionField].is_display = false
                            }
                        } else if (fieldType === "array") {
                            const positionField = issue.issue_data_type_array.findIndex(field => field.field_key_issue === parseData.data.field_key_issue)
                            if(positionField !== -1) {
                                issue.issue_data_type_array[positionField].is_display = false
                            }
                        } else if (fieldType === "object") {
                            const positionField = issue.issue_data_type_object.findIndex(field => field.field_key_issue === parseData.data.field_key_issue)
                            if(positionField !== -1) {
                                issue.issue_data_type_object[positionField].is_display = false
                            }
                        } else if (fieldType === "array-object") {
                            const positionField = issue.issue_data_type_array_object.findIndex(field => field.field_key_issue === parseData.data.field_key_issue)
                            if(positionField !== -1) {
                                issue.issue_data_type_array_object[positionField].is_display = false
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

module.exports = projectManagementTagDeletedListener