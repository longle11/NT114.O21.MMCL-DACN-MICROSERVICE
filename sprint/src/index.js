const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose')
const natsWrapper = require('./nats-wrapper')
const authCreatedListener = require('./nats/listener/auth-listener/auth-created-listener')
const versionCreatedListener = require('./nats/listener/version-listener/version-created-listener')
const epicCreatedListener = require('./nats/listener/epic-listener/epic-created-listener')
const issueCreatedListener = require('./nats/listener/issue-listener/issue-created-listeners')
const issueUpdatedListener = require('./nats/listener/issue-listener/issue-updated-listener')
const issueInsertToSprintCreated = require('./nats/listener/issue-listener/issueInsertToSprint-created-listeners copy')
const issueProcessCreatedListener = require('./nats/listener/issueprocess-listener/issueprocess-created-listener')
const issueProcessUpdatedListener = require('./nats/listener/issueprocess-listener/issueprocess-updated-listener')
const issueManyUpdatedListener = require('./nats/listener/issue-listener/issue-many-updated-listener')
const issueProcessDeletedListener = require('./nats/listener/issueprocess-listener/issueprocess-deleted-listener')
const issueSprintUpdatedListener = require('./nats/listener/issue-listener/issue-sprint-updated-listener')
const componentCreatedListener = require('./nats/listener/component-listener/component-created-listener')
const epicUpdatedListener = require('./nats/listener/epic-listener/epci_updated_listener')
const versionUpdatedListener = require('./nats/listener/version-listener/version-updated-listener')
const app = express()
app.use(cors())
app.use(bodyParser.json())
async function connectToMongoDb () {
    try {
        await mongoose.connect("mongodb://sprint-mongo-srv:27017/db")

        console.log('Connected successfully to database')
    }catch(err) {
        console.log('Connected failed to database')
        process.exit(1)
    }
}

async function connectToNats() {
    try {
        await natsWrapper.connect('jiraproject', 'sprint', 'http://nats-srv:4222')
        natsWrapper.client.on('close', () => {
            console.log('NATs connection closed')
            process.exit(1)
        })

        process.on('SIGINT', () => {natsWrapper.client.close()})
        process.on('SIGTERM', () => {natsWrapper.client.close()})


        issueSprintUpdatedListener()
        authCreatedListener()
        versionCreatedListener()
        versionUpdatedListener()
        epicCreatedListener()
        epicUpdatedListener()
        issueCreatedListener()
        issueUpdatedListener()
        issueManyUpdatedListener()
        issueInsertToSprintCreated()
        issueProcessCreatedListener()
        issueProcessUpdatedListener()
        issueProcessDeletedListener()
        componentCreatedListener()

        console.log("Connected successfully to nats");
    }catch(err) {
        console.log("Connected failed to nats server", err);
        process.exit(1)
    }
}

connectToMongoDb()
connectToNats()

app.use('/api/sprint', require('./Routes/create'))
app.use('/api/sprint', require('./Routes/delete'))
app.use('/api/sprint', require('./Routes/getSprint'))
app.use('/api/sprint', require('./Routes/update'))


app.listen(4007, () => {
    console.log('listening on port 4007');
})