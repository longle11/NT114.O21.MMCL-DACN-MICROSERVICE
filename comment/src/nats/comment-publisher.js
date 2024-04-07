const natsWrapper = require("../nats-wrapper")

const commentPublisher = (data, type) => {
    data = JSON.stringify(data)
    natsWrapper.client.publish(type, data, () => {
        console.log(`Event ${type} is published`);
    })
}

module.exports = commentPublisher