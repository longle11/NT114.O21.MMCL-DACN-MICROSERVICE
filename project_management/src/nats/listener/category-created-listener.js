const natsWrapper = require('../../nats-wrapper')
const categorymodel = require('../../models/categoryModel')
const categoryCreatedListener = () => {
    try {
        const options = natsWrapper.client.subscriptionOptions()
            .setManualAckMode(true)

        const subscription = natsWrapper.client.subscribe('category:created', options)

        subscription.on('message', async (msg) => {
            if (typeof msg.getData() === 'string') {
                console.log(`Received event category:created ${msg.getSequence()}`);
                const parseData = JSON.parse(msg.getData())

                for (let category of parseData) {
                    await categorymodel.create(category)
                }
                msg.ack()
            }
        })
    } catch (error) {
        console.log("something went wrong");
    }
}

module.exports = categoryCreatedListener