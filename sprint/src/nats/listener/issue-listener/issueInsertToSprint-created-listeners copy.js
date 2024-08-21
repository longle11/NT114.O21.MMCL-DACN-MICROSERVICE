const issueModel = require("../../../models/issueModel")
const sprintModel = require("../../../models/sprintModel")
const natsWrapper = require("../../../nats-wrapper")

const issueInsertToSprintCreated = () => {
    try {
        const options = natsWrapper.client.subscriptionOptions()
            .setManualAckMode(true)

        const subscription = natsWrapper.client.subscribe('issueInsertToSprint:created', options)

        subscription.on('message', async (msg) => {
            if (typeof msg.getData() === 'string') {
                console.log(`Received event issueInsertToSprint:created ${msg.getSequence()}`);
                const parseData = JSON.parse(msg.getData())
                //tien hanh luu vao database sau khi lay du lieu thanh cong
                const getAllSprint = await sprintModel.find({})

                const getIndex = getAllSprint.findIndex(sprint => sprint._id.toString() === parseData.sprint_id)
                if (getIndex !== -1) {
                    const currentSprint = getAllSprint[getIndex]
                    currentSprint.issue_list.push(parseData.issue_id)
                    await sprintModel.updateOne({ _id: parseData.sprint_id }, { $set: { issue_list: currentSprint.issue_list } })
                    console.log("Du lieu nhan duoc: ", parseData);
                    msg.ack()
                }
            }
        })
    } catch (error) {
        console.log(error);
    }
}

module.exports = issueInsertToSprintCreated