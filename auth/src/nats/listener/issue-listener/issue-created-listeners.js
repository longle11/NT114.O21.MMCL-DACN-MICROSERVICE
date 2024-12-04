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
                    project_id: parseData.project_id,
                    _id: parseData._id,
                    creator: parseData.creator,
                    ordinal_number: parseData.ordinal_number,
                    issue_data_type_string: parseData.issue_data_type_string,
                    issue_data_type_number: parseData.issue_data_type_number
                }
                await issueModel.create(getIssueInfo)
                msg.ack()
            }
        })
    } catch (error) {
        console.log(error);
    }
}

module.exports = issueCreatedListener