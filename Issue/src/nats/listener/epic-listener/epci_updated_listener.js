const epicModel = require('../../../models/epicModel')
const natsWrapper = require('../../../nats-wrapper')

const epicUpdatedListener = () => {
    try {
        const options = natsWrapper.client.subscriptionOptions()
            .setManualAckMode(true)

        const subscription = natsWrapper.client.subscribe('epic:updated', options)

        subscription.on('message', async (msg) => {
            if (typeof msg.getData() === 'string') {
                console.log(`Received event epic:updated with sequence number: ${msg.getSequence()}`);

                const parseData = JSON.parse(msg.getData())
                const id = parseData.epic_id
                delete parseData.epic_id
                //tiến hành lưu vào epic db
                await epicModel.updateOne({ _id: id }, { $set: { ...parseData } })
                msg.ack()
            }
        })
    } catch (error) {
        console.log(error);
    }
}

module.exports = epicUpdatedListener