const natsWrapper = require('../../../nats-wrapper')
const userModel = require('../../../models/userModel')


const authCreatedListener = () => {
    try {
        const options = natsWrapper.client.subscriptionOptions()
            .setManualAckMode(true)

        const subscription = natsWrapper.client.subscribe('auth:created', 'issue-auth-created-group', options)

        subscription.on('message', async (msg) => {

            if (typeof msg.getData() === 'string') {
                console.log(`Received event auth:created with sequence number: ${msg.getSequence()}`);

                const parseData = JSON.parse(msg.getData())

                //tiến hành lưu vào auth db
                await userModel.create(parseData)

                msg.ack()
            }
        })
    } catch (error) {

    }
}

module.exports = authCreatedListener