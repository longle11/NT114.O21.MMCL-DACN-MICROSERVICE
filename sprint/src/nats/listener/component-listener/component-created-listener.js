const componentModel = require('../../../models/componentModel')
const natsWrapper = require('../../../nats-wrapper')

const componentCreatedListener = () => {
    try {
        const options = natsWrapper.client.subscriptionOptions()
            .setManualAckMode(true)

        const subscription = natsWrapper.client.subscribe('component:created', 'sprint-component-created-group', options)

        subscription.on('message', async (msg) => {
            if (typeof msg.getData() === 'string') {
                console.log(`Received event component:created with sequence number: ${msg.getSequence()}`);

                const parseData = JSON.parse(msg.getData())

                //tiến hành lưu vào component db
                await componentModel.create(parseData)
                msg.ack()
            }
        })
    } catch (error) {
        console.log(error);
    }
}

module.exports = componentCreatedListener