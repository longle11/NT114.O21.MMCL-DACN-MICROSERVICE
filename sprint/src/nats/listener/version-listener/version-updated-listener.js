const versionModel = require('../../../models/versionModel')
const natsWrapper = require('../../../nats-wrapper')

const versionUpdatedListener = () => {
    try {
        const options = natsWrapper.client.subscriptionOptions()
            .setManualAckMode(true)

        const subscription = natsWrapper.client.subscribe('version:updated', options)

        subscription.on('message', async (msg) => {
            if (typeof msg.getData() === 'string') {
                console.log(`Received event version:updated with sequence number: ${msg.getSequence()}`);

                const parseData = JSON.parse(msg.getData())
                const id = parseData.version_id
                delete parseData.version_id
                //tiến hành lưu vào version db
                await versionModel.updateOne({ _id: id }, { $set: { ...parseData } })
                msg.ack()
            }
        })
    } catch (error) {
        console.log(error);
    }
}

module.exports = versionUpdatedListener