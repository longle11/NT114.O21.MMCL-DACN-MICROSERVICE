const issueProcessModel = require('../../../models/issueProcessModel')
const natsWrapper = require('../../../nats-wrapper')

const issueProcessDeletedListener = () => {
    try {
        const options = natsWrapper.client.subscriptionOptions()
            .setManualAckMode(true)

        const subscription = natsWrapper.client.subscribe('issueprocess:deleted', 'sprint-issueprocess-deleted-group', options)

        subscription.on('message', async (msg) => {

            if (typeof msg.getData() === 'string') {
                console.log(`Received event issueprocess:deleted with sequence number: ${msg.getSequence()}`);

                const parseData = JSON.parse(msg.getData())

                await issueProcessModel.deleteOne({_id: parseData._id})
                msg.ack()
            }
        })
    } catch (error) {
        console.log(error);
    }
}

module.exports = issueProcessDeletedListener