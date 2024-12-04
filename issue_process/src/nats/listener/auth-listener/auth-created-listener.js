const userModel = require('../../../models/userModel')
const natsWrapper = require('../../../nats-wrapper')

const authCreatedListener = () => {
    try {
        const options = natsWrapper.client.subscriptionOptions()
            .setManualAckMode(true)

        const subscription = natsWrapper.client.subscribe('auth:created', 'issueprocess-auth-created-group', options)

        subscription.on('message', async (msg) => {

            if (typeof msg.getData() === 'string') {
                console.log(`Received event auth:created with sequence number: ${msg.getSequence()}`);

                const parseData = JSON.parse(msg.getData())

                //tiến hành lưu vào auth db
                await userModel.create(parseData)
                console.log("Du lieu nhan duoc: ", parseData);

                msg.ack()
            }
        })
    } catch (error) {
        console.log(error);
    }
}

module.exports = authCreatedListener