const issueModel = require("../../../models/issueModel")
const natsWrapper = require("../../../nats-wrapper")

const issueCreatedListener = () => {
    try {
        const options = natsWrapper.client.subscriptionOptions()
            .setManualAckMode(true)

        const subscription = natsWrapper.client.subscribe('issue:created', options)

        subscription.on('message', async (msg) => {
            if (typeof msg.getData() === 'string') {
                console.log(`Received event issue:created ${msg.getSequence()}`);
                const parseData = JSON.parse(msg.getData())
                //tien hanh luu vao database sau khi lay du lieu thanh cong
                const getIssueInfo = {
                    _id: parseData._id,
                    ordinal_number: parseData.ordinal_number,
                    creator: parseData.creator,
                    issue_data_type_string: parseData.issue_data_type_string,
                    issue_data_type_number: parseData.issue_data_type_number,
                    issue_data_type_array: parseData.issue_data_type_array,
                    issue_data_type_object: parseData.issue_data_type_object,
                    issue_data_type_array_object: parseData.issue_data_type_array_object,
                }
                //tien hanh luu vao database sau khi lay du lieu thanh cong
                await issueModel.create(getIssueInfo)
                msg.ack()
            }
        })
    } catch (error) {
        console.log(error);
    }
}

module.exports = issueCreatedListener