const epicModel = require('../../../models/epicModel')
const natsWrapper = require('../../../nats-wrapper')

const epicCreatedListener = () => {
    try {
        const options = natsWrapper.client.subscriptionOptions()
            .setManualAckMode(true)

        const subscription = natsWrapper.client.subscribe('epic:created', 'sprint-epic-created-group', options)

        subscription.on('message', async (msg) => {

            if (typeof msg.getData() === 'string') {
                console.log(`Received event epic:created with sequence number: ${msg.getSequence()}`);

                const parseData = JSON.parse(msg.getData())

                //tiến hành lưu vào epic db
                await epicModel.create(parseData)
                console.log("Du lieu nhan duoc: ", parseData);
                msg.ack()
            }
        })
    } catch (error) {
        console.log(error);
    }
}

module.exports = epicCreatedListener