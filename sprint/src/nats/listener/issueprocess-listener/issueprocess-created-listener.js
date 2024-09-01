const issueProcessModel = require('../../../models/issueProcessModel')
const natsWrapper = require('../../../nats-wrapper')

const issueProcessCreatedListener = () => {
    try {
        const options = natsWrapper.client.subscriptionOptions()
            .setManualAckMode(true)

        const subscription = natsWrapper.client.subscribe('issueprocess:created', 'sprint-issueprocess-created-group', options)

        subscription.on('message', async (msg) => {

            if (typeof msg.getData() === 'string') {
                console.log(`Received event issueprocess:created with sequence number: ${msg.getSequence()}`);

                const parseData = JSON.parse(msg.getData())

                if (parseData?.processList) {
                    const processList = parseData?.processList
                    for(let index = 0; index < processList.length; index++) {
                        const data = new issueProcessModel(processList[index])
                        await data.save()
                    }
                    msg.ack()
                } else {
                    //tiến hành lưu vào issueProcess db
                    await issueProcessModel.create(parseData)
                    console.log("Du lieu nhan duoc: ", parseData);
                    msg.ack()
                }
            }
        })
    } catch (error) {
        console.log(error);
    }
}

module.exports = issueProcessCreatedListener