const issueProcessModel = require('../../../models/issueProcessModel')
const natsWrapper = require('../../../nats-wrapper')

const issueProcessUpdatedListener = () => {
    try {
        const options = natsWrapper.client.subscriptionOptions()
            .setManualAckMode(true)

        const subscription = natsWrapper.client.subscribe('issueprocess:updated', 'sprint-issueprocess-updated-group', options)

        subscription.on('message', async (msg) => {

            if (typeof msg.getData() === 'string') {
                console.log(`Received event issueprocess:updated with sequence number: ${msg.getSequence()}`);

                const parseData = JSON.parse(msg.getData())

                const getIssueProcess = await issueProcessModel.findById(parseData.process_id)
                if (getIssueProcess) {
                    await issueProcessModel.updateOne({ _id: parseData.process_id }, { $set: { name_process: parseData.name_process, type_process: parseData.type_process } })
                }
                msg.ack()
            }
        })
    } catch (error) {
        console.log(error);
    }
}

module.exports = issueProcessUpdatedListener