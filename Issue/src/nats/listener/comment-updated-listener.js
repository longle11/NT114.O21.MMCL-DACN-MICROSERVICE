const commentModel = require('../../models/commentModel')
const issueModel = require('../../models/issueModel')
const natsWrapper = require('../../nats-wrapper')

const commentUpdatedListener = () => {
    try {
        const options = natsWrapper.client.subscriptionOptions()
            .setManualAckMode(true)

        const subscription = natsWrapper.client.subscribe('comment:updated', options)

        subscription.on('message', async (msg) => {
            if (typeof msg.getData() === 'string') {
                try {
                    console.log(`Received event comment:updated with sequence number: ${msg.getSequence()}`);

                    const parseData = JSON.parse(msg.getData())

                    //tiến hành lưu vào comment db
                    await commentModel.updateOne({ _id: parseData._id }, { content: parseData.content, timeStamp: parseData.timeStamp, isModified: parseData.isModified })

                    msg.ack()
                } catch (error) {
                    console.log('something went wrong ', error);
                }
            }
        })
    } catch (error) {

    }
}

module.exports = commentUpdatedListener