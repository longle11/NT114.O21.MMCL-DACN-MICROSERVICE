const commentModel = require('../../models/commentModel')
const issueModel = require('../../models/issueModel')
const natsWrapper = require('../../nats-wrapper')
const issuePublisher = require('../publisher/issue-publisher')

const projectManagementDeletedListener = () => {
    const options = natsWrapper.client.subscriptionOptions()
        .setManualAckMode(true)

    const subscription = natsWrapper.client.subscribe('projectmanagement:deleted', options)

    subscription.on('message', async (msg) => {
        if (typeof msg.getData() === 'string') {
            console.log(`Received event projectmanagement:deleted with sequence number: ${msg.getSequence()}`);

            const parseData = JSON.parse(msg.getData())

            //lấy ra danh sách issue thuộc về project
            const issueList = await issueModel.find({ _id: { $in: parseData } })

            //tien hanh xoa cac comment trong cac issue nay
            for (const issue of issueList) {
                // await commentModel.deleteMany({ _id: { $in: issue.comments } })

                await issuePublisher(issue.comments, 'issue-comment:deleted')
            }

            //xoa cac issue thuoc project
            const result = await issueModel.deleteMany({ _id: { $in: parseData } })

            console.log("So issue da xoa: ", result);
            msg.ack()
        }
    })
}

module.exports = projectManagementDeletedListener