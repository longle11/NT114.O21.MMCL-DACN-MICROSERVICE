const sprintModel = require('../../../models/sprintModel')
const natsWrapper = require('../../../nats-wrapper')

const sprintUpdatedListener = () => {
    try {
        const options = natsWrapper.client.subscriptionOptions()
            .setManualAckMode(true)

        const subscription = natsWrapper.client.subscribe('sprint:updated', 'issue-sprint-updated-group', options)

        subscription.on('message', async (msg) => {

            if (typeof msg.getData() === 'string') {
                console.log(`Received event sprint:updated with sequence number: ${msg.getSequence()}`);
                const parseData = JSON.parse(msg.getData())

                const id = parseData.sprint_id
                delete parseData.sprint_id

                //tiến hành lưu vào sprint db
                await sprintModel.updateOne({ _id: id }, { $set: { ...parseData } })
                msg.ack()
            }
        })
    } catch (error) {
        console.log(error);
    }
}

module.exports = sprintUpdatedListener