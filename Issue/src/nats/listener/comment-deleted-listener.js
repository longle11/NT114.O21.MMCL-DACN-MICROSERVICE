const commentModel = require('../../models/commentModel')
const issueModel = require('../../models/issueModel')
const natsWrapper = require('../../nats-wrapper')

const commentDeletedListener = () => {
    try {
        const options = natsWrapper.client.subscriptionOptions()
            .setManualAckMode(true)

        const subscription = natsWrapper.client.subscribe('comment:deleted', options)

        subscription.on('message', async (msg) => {
            if (typeof msg.getData() === 'string') {
                console.log(`Received event comment:deleted with sequence number: ${msg.getSequence()}`);

                const parseData = JSON.parse(msg.getData())

                //tiến hành lưu vào comment db
                await commentModel.deleteOne({ _id: parseData._id })

                //tien hanh them comment ID nay vao IssueModel tuong ung
                const currentIssue = await issueModel.findById(parseData.issueId)

                if (currentIssue) {
                    listComments = currentIssue.comments
                    const index = listComments.findIndex(id => id === parseData.issueId)
                    listComments.splice(index, 1)
                    await issueModel.updateMany({ _id: comment.issueId }, { $set: { comments: listComments } })
                }
                msg.ack()
            }
        })
    } catch (error) {

    }
}

module.exports = commentDeletedListener