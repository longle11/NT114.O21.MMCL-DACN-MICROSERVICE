const commentModel = require('../../models/commentModel')
const issueModel = require('../../models/issueModel')
const natsWrapper = require('../../nats-wrapper')
const issuePublisher = require('../publisher/issue-publisher')

const issueDeletedCreator = () => {
    try {
        const options = natsWrapper.client.subscriptionOptions()
            .setManualAckMode(true)

        const subscription = natsWrapper.client.subscribe('issue:deletedcreator', options)

        subscription.on('message', async (msg) => {
            if (typeof msg.getData() === 'string') {
                try {
                    console.log(`Received event issue:deletedcreator with sequence number: ${msg.getSequence()}`);

                    const parseData = JSON.parse(msg.getData())

                    const currentIssue = await issueModel.findById(parseData._id)
                        .populate({
                            path: 'comments'
                        })

                    if (currentIssue) {
                        //lay ra danh sach comment do trong issue hien tai
                        listComments = currentIssue.comments

                        //xoa cac comment lien quan toi user trong issue nay
                        await commentModel.deleteMany({ _id: { $in: listComments } })

                        //publish su kien xoa mang cac comment nay qua comment service
                        await issuePublisher(listComments, 'issue-comment:deleted')

                        //tien hanh xoa issue nay
                        await issueModel.deleteOne({ _id: parseData._id })
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

module.exports = issueDeletedCreator