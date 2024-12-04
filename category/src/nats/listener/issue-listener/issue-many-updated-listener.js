const issueModel = require("../../../models/issueModel")
const natsWrapper = require("../../../nats-wrapper")

const issueManyUpdatedListener = () => {
    try {
        const options = natsWrapper.client.subscriptionOptions()
            .setManualAckMode(true)

        const subscription = natsWrapper.client.subscribe('issue-many:updated', options)

        subscription.on('message', async (msg) => {
            if (typeof msg.getData() === 'string') {
                console.log(`Received event issue-many:updated ${msg.getSequence()}`);
                const parseData = JSON.parse(msg.getData())
                //tien hanh luu vao database sau khi lay du lieu thanh cong
                await issueModel.updateMany({ _id: { $in: parseData.issue_list } }, { $set: { issue_data_type_object: parseData.issue_data_type_object } })
                msg.ack()
            }
        })
    } catch (error) {
        console.log(error);
    }
}

module.exports = issueManyUpdatedListener