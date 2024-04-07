const issueModel = require("../../models/issueModel")
const natsWrapper = require("../../nats-wrapper")

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
                const issue = await issueModel.create(parseData)
                msg.ack()
            }
        })
    } catch (error) {
        
    }
}

module.exports = issueCreatedListener