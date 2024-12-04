const sprintModel = require("../../../models/sprintModel")
const natsWrapper = require("../../../nats-wrapper")

const issueSprintUpdatedListener = () => {
    try {
        const options = natsWrapper.client.subscriptionOptions()
            .setManualAckMode(true)

        const subscription = natsWrapper.client.subscribe('issues-sprint:updated', options)

        subscription.on('message', async (msg) => {
            if (typeof msg.getData() === 'string') {
                console.log(`Received event issues-sprint:updated ${msg.getSequence()}`);
                const parseData = JSON.parse(msg.getData())
                const getCurrentSprint = await sprintModel.findById(parseData.sprint_id)
                if(getCurrentSprint) {
                    if(getCurrentSprint.issue_list.length === 0) {
                        getCurrentSprint.issue_list = [...parseData.issues]
                    }else {
                        getCurrentSprint.issue_list = getCurrentSprint.issue_list.concat(parseData.issues)
                    }

                    await getCurrentSprint.save()
                }
                msg.ack()
            }
        })
    } catch (error) {
        
    }
}

module.exports = issueSprintUpdatedListener