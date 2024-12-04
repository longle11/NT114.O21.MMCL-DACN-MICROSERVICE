const versionModel = require('../../../models/versionModel')
const natsWrapper = require('../../../nats-wrapper')

const versionCreatedListener = () => {
    try {
        const options = natsWrapper.client.subscriptionOptions()
            .setManualAckMode(true)

        const subscription = natsWrapper.client.subscribe('version:created', 'sprint-version-created-group', options)

        subscription.on('message', async (msg) => {

            if (typeof msg.getData() === 'string') {
                console.log(`Received event version:created with sequence number: ${msg.getSequence()}`);

                const parseData = JSON.parse(msg.getData())

                //tiến hành lưu vào version db
                await versionModel.create(parseData)
                console.log("Du lieu nhan duoc: ", parseData);
                msg.ack()
            }
        })
    } catch (error) {
        console.log(error);
    }
}

module.exports = versionCreatedListener