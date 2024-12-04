const epicModel = require("../../../models/epicModel")
const natsWrapper = require("../../../nats-wrapper")

const issueEpicUpdatedListener = () => {
    try {
        const options = natsWrapper.client.subscriptionOptions()
            .setManualAckMode(true)

        const subscription = natsWrapper.client.subscribe('issues-epic:updated', options)

        subscription.on('message', async (msg) => {
            if (typeof msg.getData() === 'string') {
                console.log(`Received event issues-epic:updated ${msg.getSequence()}`);
                const parseData = JSON.parse(msg.getData())
                const getCurrentEpic = await epicModel.findById(parseData.epic_id)
                if(getCurrentEpic) {
                    if(getCurrentEpic.issue_list.length === 0) {
                        getCurrentEpic.issue_list = [...parseData.issues]
                    }else {
                        getCurrentEpic.issue_list = getCurrentEpic.issue_list.concat(parseData.issues)
                    }

                    await getCurrentEpic.save()
                }
                msg.ack()
            }
        })
    } catch (error) {

    }
}

module.exports = issueEpicUpdatedListener