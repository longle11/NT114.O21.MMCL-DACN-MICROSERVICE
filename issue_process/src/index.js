const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose')
const natsWrapper = require('./nats-wrapper')
const authCreatedListener = require('./nats/listener/auth-listener/auth-created-listener')
const issueCreatedListener = require('./nats/listener/issue-listener/issue-created-listeners')
const app = express()
app.use(cors())
app.use(bodyParser.json())

async function connectToMongoDb () {
    try {
        await mongoose.connect("mongodb://issueprocess-mongo-srv:27017/db")

        console.log('Connected successfully to database')

    }catch(err) {
        console.log('Connected failed to database')
        process.exit(1)
    }
}

async function connectToNats() {
    try {
        await natsWrapper.connect('jiraproject', 'issue_process', 'http://nats-srv:4222')
        natsWrapper.client.on('close', () => {
            console.log('NATs connection closed')
            process.exit(1)
        })

        process.on('SIGINT', () => {natsWrapper.client.close()})
        process.on('SIGTERM', () => {natsWrapper.client.close()})

        authCreatedListener()
        issueCreatedListener()

        console.log("Connected successfully to nats");
    }catch(err) {
        console.log("Connected failed to nats server", err);
        process.exit(1)
    }
}

connectToMongoDb()
connectToNats()

app.use('/api/issueprocess', require('./Routes/create'))
app.use('/api/issueprocess', require('./Routes/getProcess'))

app.listen(4006, () => {
    console.log('listening on port 4006');
})