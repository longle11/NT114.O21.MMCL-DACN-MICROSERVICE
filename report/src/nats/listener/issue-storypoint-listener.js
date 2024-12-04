const burndownModel = require("../../models/burndownChartModels")
const natsWrapper = require("../../nats-wrapper")

const burndownChartStoryPointListener = () => {
    try {
        const options = natsWrapper.client.subscriptionOptions()
            .setManualAckMode(true)

        const subscription = natsWrapper.client.subscribe('issue-story_point:updated', options)

        subscription.on('message', async (msg) => {
            if (typeof msg.getData() === 'string') {
                console.log(`Received event issue-story_point:updated with sequence number: ${msg.getSequence()}`);
                const parseData = JSON.parse(msg.getData())
                //tiến hành lưu vào db
                const burndownData = await burndownModel.findOne({sprint_id: parseData.sprint_id, project_id: parseData.project_id})
                if(burndownData) {
                    const remaining = burndownData.current_story_point_remaining + parseData.increase - parseData.decrease
                    burndownData.current_story_point_remaining = remaining
                    delete parseData.sprint_id
                    delete parseData.project_id
                    parseData['remaining'] = remaining
                    burndownData.story_point_data.push(parseData)
                    await burndownData.save()
                }
                msg.ack()
            }
        })
    } catch (error) {

    }
}

module.exports = burndownChartStoryPointListener