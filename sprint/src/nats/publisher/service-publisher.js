const natsWrapper = require("../../nats-wrapper")

const servicePublisher = async (data, type) => {
    data = JSON.stringify(data)
    await natsWrapper.client.publish(type, data, () => {
        console.log(`Event ${type} is published`);
    })
}

module.exports = servicePublisher