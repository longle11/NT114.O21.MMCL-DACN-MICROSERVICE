const nats = require('node-nats-streaming')

class NatsWrapper {
    _client;

    get client() {
        return this._client
    }

    connect(clusterId, clientId, url) {
        this._client = nats.connect(clusterId, clientId, { url })

        return new Promise((resolve, reject) => {
            this._client.on('connect', () => {
                console.log("Connected to nats");
                resolve()
            })

            this._client.on('error', (error) => {
                console.log("connected failed to nats");
                reject(error)
            })
        })
    }
}

const natsWrapper = new NatsWrapper()

module.exports = natsWrapper