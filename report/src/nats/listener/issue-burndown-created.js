const burndownModel = require("../../models/burndownChartModels")
const natsWrapper = require("../../nats-wrapper")

const burndownChartCreatedListener = () => {
    try {
        const options = natsWrapper.client.subscriptionOptions()
            .setManualAckMode(true)

        const subscription = natsWrapper.client.subscribe('issue-burndown:created', options)

        subscription.on('message', async (msg) => {
            if (typeof msg.getData() === 'string') {
                console.log(`Received event issue-burndown:created with sequence number: ${msg.getSequence()}`);
                const parseData = JSON.parse(msg.getData())
                //tiến hành lưu vào db
                const data = await burndownModel.create(parseData)
                console.log("data tao ra ", data);
                msg.ack()
            }
        })
    } catch (error) {

    }
}

module.exports = burndownChartCreatedListener