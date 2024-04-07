const issueModel = require("../../models/issueModel")
const natsWrapper = require("../../nats-wrapper")

const issueDeleteddListener = () => {
    try {
        const options = natsWrapper.client.subscriptionOptions()
            .setManualAckMode(true)

        const subscription = natsWrapper.client.subscribe('issue:deleted', options)

        subscription.on('message', async (msg) => {
            if (typeof msg.getData() === 'string') {
                console.log(`Received event issue:deleted ${msg.getSequence()}`);
                const parseData = JSON.parse(msg.getData())
                //tien hanh luu vao database sau khi lay du lieu thanh cong
                await issueModel.deleteOne({ _id: parseData._id })
                msg.ack()
            }
        })
    } catch (error) {

    }
}

module.exports = issueDeleteddListener