const commentModel = require('../../models/commentModel')
const issueModel = require('../../models/issueModel')
const natsWrapper = require('../../nats-wrapper')

const commentCreatedListener = () => {
    try {
        const options = natsWrapper.client.subscriptionOptions()
            .setManualAckMode(true)

        const subscription = natsWrapper.client.subscribe('comment:created', 'issue-comment-created-group', options)

        subscription.on('message', async (msg) => {
            if (typeof msg.getData() === 'string') {
                try {
                    console.log(`Received event comment:created with sequence number: ${msg.getSequence()}`);
                    const parseData = JSON.parse(msg.getData())
                    // tien hanh them comment ID nay vao IssueModel tuong ung
                    const currentIssue = await issueModel.findOne({ _id: parseData.issueId })
                    if (currentIssue) {
                        //tiến hành lưu vào comment db
                        const comment = await commentModel.create({
                            _id: parseData._id,
                            content: parseData.content,
                            creator: parseData.creator
                        })
                        listComments = currentIssue.comments
                        listComments.push(comment._id)
                        await issueModel.updateOne({ _id: parseData.issueId }, { $set: { comments: listComments } })
                    }
                    msg.ack()
                } catch (error) {

                }
            }
        })
    } catch (error) {

    }
}

module.exports = commentCreatedListener