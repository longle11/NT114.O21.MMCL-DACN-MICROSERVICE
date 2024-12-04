const versionModel = require("../../../models/versionModel")
const natsWrapper = require("../../../nats-wrapper")

const issueVersionUpdatedListener = () => {
    try {
        const options = natsWrapper.client.subscriptionOptions()
            .setManualAckMode(true)

        const subscription = natsWrapper.client.subscribe('issues-version:updated', options)

        subscription.on('message', async (msg) => {
            if (typeof msg.getData() === 'string') {
                console.log(`Received event issues-version:updated ${msg.getSequence()}`);
                const parseData = JSON.parse(msg.getData())
                const getCurrentVersion = await versionModel.findById(parseData.version_id)
                if(getCurrentVersion) {
                    if(getCurrentVersion.issue_list.length === 0) {
                        getCurrentVersion.issue_list = [...parseData.issues]
                    }else {
                        getCurrentVersion.issue_list = getCurrentVersion.issue_list.concat(parseData.issues)
                    }

                    await getCurrentVersion.save()
                }
                msg.ack()
            }
        })
    } catch (error) {
        
    }
}

module.exports = issueVersionUpdatedListener