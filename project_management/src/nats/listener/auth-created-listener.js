const userModel = require("../../models/userModel")
const natsWrapper = require("../../nats-wrapper")

const authCreatedListener = () => {
    try {
        const options = natsWrapper.client.subscriptionOptions()
            .setManualAckMode(true)

        const subscription = natsWrapper.client.subscribe('auth:created', options)

        subscription.on('message', async (msg) => {
            if (typeof msg.getData() === 'string') {
                console.log(`Received event auth:created with sequence number: ${msg.getSequence()}`);
                const parseData = JSON.parse(msg.getData())
                //tiến hành lưu vào auth db
                const user = await userModel.create({
                    _id: parseData._id,
                    username: parseData.username,
                    avatar: parseData.avatar
                })
                msg.ack()
            }
        })
    } catch (error) {

    }
}

module.exports = authCreatedListener