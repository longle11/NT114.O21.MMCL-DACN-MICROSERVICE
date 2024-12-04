const projectModel = require("../../../models/projectModel");
const natsWrapper = require("../../../nats-wrapper");

const projectManagementCreatedListener = () => {
    const options = natsWrapper.client.subscriptionOptions()
        .setManualAckMode(true)

    const subscription = natsWrapper.client.subscribe('projectmanagement:created', options)

    subscription.on('message', async (msg) => {
        if (typeof msg.getData() === 'string') {
            console.log(`Received event projectmanagement:created with sequence number: ${msg.getSequence()}`);

            const parseData = JSON.parse(msg.getData())

            await projectModel.create(parseData)

            msg.ack()
        }
    })
}

module.exports = projectManagementCreatedListener