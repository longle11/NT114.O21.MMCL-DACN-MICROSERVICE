const express = require("express")
const app = express()
const cors = require("cors")
const bodyParser = require('body-parser')
const mongoose = require("mongoose")
const natsWrapper = require("./nats-wrapper")
const authCreatedListener = require("./nats/listener/auth-listener/auth-created-listener")

app.use(bodyParser.json())
app.use(cors())

async function connectToMongoDb() {
    try {
        await mongoose.connect(process.env.MONGO_URL)

        console.log('Connected successfully to database')
    } catch (err) {
        console.log('Connected failed to database')
        process.exit(1)
    }
}

async function connectToNats() {
    try {
        await natsWrapper.connect(process.env.NATS_CLUSTER_ID, process.env.NATS_CLIENT_ID, process.env.NATS_URL)
        natsWrapper.client.on('close', () => {
            console.log('NATs connection closed');
            process.exit(1)
        })

        process.on('SIGINT', () => { natsWrapper.client.close() })
        process.on('SIGTERM', () => { natsWrapper.client.close() })

        authCreatedListener()

        console.log("Successfully connected to nats");
    } catch (error) {
        console.log("Failed connection to nats", error);
        process.exit(1)
    }
}
connectToMongoDb()
connectToNats()

app.use('/api/notification', require('./Routes/create'))
app.use('/api/notification', require('./Routes/get'))
app.use('/api/notification', require('./Routes/update'))

app.listen(4009, () => {
    console.log("listening on port 4009");
})