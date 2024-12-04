const nats = require('node-nats-streaming')

class NatsWrapper {
    _client;

    get client() {
        if (!this._client) {
            throw new Error('Cannot access NATs client before connecting')
        }

        return this._client
    }

    connect(clusterId, clientId, url) {
        this._client = nats.connect(clusterId, clientId, { url })

        return new Promise((resolve, reject) => {
            this._client.on('connect', () => {
                console.log('Connected to NATS');
                resolve()
            })

            this._client.on('error', (error) => {
                reject(error)
            })
        })
    }
}

const natsWrapper = new NatsWrapper()

module.exports = natsWrapper