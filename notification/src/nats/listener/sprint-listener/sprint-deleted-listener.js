const sprintModel = require('../../../models/sprintModel')
const natsWrapper = require('../../../nats-wrapper')

const sprintDeletedListener = () => {
    try {
        const options = natsWrapper.client.subscriptionOptions()
            .setManualAckMode(true)

        const subscription = natsWrapper.client.subscribe('sprint:deleted', 'issue-sprint-deleted-group', options)

        subscription.on('message', async (msg) => {

            if (typeof msg.getData() === 'string') {
                console.log(`Received event sprint:deleted with sequence number: ${msg.getSequence()}`);

                const parseData = JSON.parse(msg.getData())

                //tiến hành lưu vào sprint db
                await sprintModel.deleteOne({_id: parseData.id})
                console.log("Du lieu nhan duoc: ", parseData);
                msg.ack()
            }
        })
    } catch (error) {
        console.log(error);
    }
}

module.exports = sprintDeletedListener