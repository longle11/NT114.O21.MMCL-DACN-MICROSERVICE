const commentModel = require('../models/commentModel')
const natsWrapper = require('../nats-wrapper')

const commentDeletedListener = async () => {
    try {
        const options = natsWrapper.client.subscriptionOptions()
            .setManualAckMode(true)
        const subscription = natsWrapper.client.subscribe('issue-comment:deleted', 'comment-issue-deleted-queue-group', options)
        subscription.on('message', async (msg) => {
            if (typeof msg.getData() === 'string') {
                try {
                    console.log(`Received event issue-comment:deleted with sequence number: ${msg.getSequence()}`);

                    const parseData = JSON.parse(msg.getData())

                    //tien hanh xoa cac comment lien quan
                    await commentModel.deleteMany({ _id: { $in: parseData } })
                    msg.ack()
                } catch (error) {
                    console.log('something went wrong ', error);
                }
            }
        })
    } catch (error) {

    }
}

module.exports = commentDeletedListener