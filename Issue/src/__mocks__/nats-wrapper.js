const natsWrapper = {
    client: {
        publish: jest.fn().mockImplementation(
            (type, data, callback) => {
                callback()
            }
        )
    }
}

module.exports = natsWrapper