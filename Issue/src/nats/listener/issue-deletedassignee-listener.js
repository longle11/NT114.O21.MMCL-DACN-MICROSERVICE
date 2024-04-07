const commentModel = require('../../models/commentModel')
const issueModel = require('../../models/issueModel')
const natsWrapper = require('../../nats-wrapper')
const issuePublisher = require('../publisher/issue-publisher')

const issueDeletedAssignee = () => {
    try {
        const options = natsWrapper.client.subscriptionOptions()
            .setManualAckMode(true)

        const subscription = natsWrapper.client.subscribe('issue:deletedassignee', options)

        subscription.on('message', async (msg) => {
            if (typeof msg.getData() === 'string') {
                try {
                    console.log(`Received event issue:deletedassignee with sequence number: ${msg.getSequence()}`);

                    const parseData = JSON.parse(msg.getData())

                    const currentIssue = await issueModel.findById(parseData.issue._id)
                        .populate({
                            path: 'comments'
                        })

                    if (currentIssue) {
                        await issueModel.updateOne({ _id: parseData.issue._id }, { $set: { assignees: parseData.issue.assignees } })

                        //lay ra danh sach comment do trong issue hien tai
                        listComments = currentIssue.comments

                        //sau do luu id cua comment vao 1 mang temp
                        listCommentArrays = currentIssue.comments.filter(value => value.creator.toString() === parseData.userId)
                            .map(value => {
                                return value._id
                            })

                        await commentModel.deleteMany({ _id: { $in: listCommentArrays } })

                        await issuePublisher(listCommentArrays, 'issue-comment:deleted')

                        msg.ack()
                    }
                } catch (error) {
                    console.log('something went wrong ', error);
                }
            }
        })
    } catch (error) {

    }
}

module.exports = issueDeletedAssignee