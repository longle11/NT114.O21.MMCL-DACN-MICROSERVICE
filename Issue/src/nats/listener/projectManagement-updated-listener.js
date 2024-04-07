const commentModel = require('../../models/commentModel')
const issueModel = require('../../models/issueModel')
const natsWrapper = require('../../nats-wrapper')

const projectManagementUpdatedListener = () => {
    const options = natsWrapper.client.subscriptionOptions()
        .setManualAckMode(true)

    const subscription = natsWrapper.client.subscribe('projectManagement:updated', options)

    subscription.on('message', async (msg) => {
        if (typeof msg.getData() === 'string') {
            console.log(`Received event projectManagement:updated with sequence number: ${msg.getSequence()}`);

            const parseData = JSON.parse(msg.getData())

            //tiến hành lưu vào comment db
            const comment = await commentModel.create({
                _id: parseData._id,
                content: parseData.content,
                creator: parseData.creator
            })

            //tien hanh them comment ID nay vao IssueModel tuong ung
            const currentIssue = await issueModel.findById(comment.issueId)

            if (currentIssue) {
                listComments = currentIssue.comments
                listComments.push(comment._id)

                await issueModel.updateMany({ _id: comment.issueId }, { $set: { comments: listComments } })
            }

            msg.ack()
        }
    })
}

module.exports = projectManagementUpdatedListener