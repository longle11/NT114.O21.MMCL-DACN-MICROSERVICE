const issueModel = require("../../../models/issueModel")
const natsWrapper = require("../../../nats-wrapper")

const issueCreatedListener = () => {
    try {
        const options = natsWrapper.client.subscriptionOptions()
            .setManualAckMode(true)

        const subscription = natsWrapper.client.subscribe('issue:created', options)

        subscription.on('message', async (msg) => {
            if (typeof msg.getData() === 'string') {
                console.log(`Received event issue:created ${msg.getSequence()}`);
                const parseData = JSON.parse(msg.getData())
                const getIssueInfo = {
                    _id: parseData._id,
                    issue_priority: parseData.issue_priority,
                    summary: parseData.summary,
                    issue_status: parseData.issue_status,
                    assignees: parseData.assignees,
                    creator: parseData.creator,
                    epic_link: parseData.epic_link,
                    fix_version: parseData.fix_version,
                    issue_type: parseData.issue_type,
                    ordinal_number: parseData.ordinal_number,
                    parent: parseData.parent
                }
                //tien hanh luu vao database sau khi lay du lieu thanh cong
                await issueModel.create(getIssueInfo)
                console.log("Du lieu nhan duoc: ", getIssueInfo);
                msg.ack()
            }
        })
    } catch (error) {
        
    }
}

module.exports = issueCreatedListener