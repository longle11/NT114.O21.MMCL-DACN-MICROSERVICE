const mongoose = require("mongoose")
const natsWrapper = require("./nats-wrapper")
const app = require('./app')
const versionCreatedListener = require("./nats/listener/version-listener/version-created-listener")
const epicCreatedListener = require("./nats/listener/epic-listener/epic-created-listener")
const sprintCreatedListener = require("./nats/listener/sprint-listener/sprint-created-listener")
const issueProcessCreatedListener = require("./nats/listener/issueprocess-listener/issueprocess-created-listener")
const authCreatedListener = require("./nats/listener/auth-listener/auth-created-listener")
const sprintDeletedListener = require("./nats/listener/sprint-listener/sprint-deleted-listener")
const projectManagementCreatedListener = require("./nats/listener/project-listener/projectManagement-created-listener")
const issueProcessUpdatedListener = require("./nats/listener/issueprocess-listener/issueprocess-updated-listener")
const issueProcessDeletedListener = require("./nats/listener/issueprocess-listener/issueprocess-deleted-listener")
const projectManagementTagAddedListener = require("./nats/listener/project-listener/projectManagement-tag-added-listener")
const projectManagementTagDeletedListener = require("./nats/listener/project-listener/projectManagement-tag-deleted-listener")
const sprintUpdatedListener = require("./nats/listener/sprint-listener/sprint-updated-listener")
const componentCreatedListener = require("./nats/listener/component-listener/component-created-listener")
const epicUpdatedListener = require("./nats/listener/epic-listener/epci_updated_listener")
const versionUpdatedListener = require("./nats/listener/version-listener/version-updated-listener")

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
        versionCreatedListener()
        versionUpdatedListener()
        epicCreatedListener()
        epicUpdatedListener()
        sprintCreatedListener()
        sprintDeletedListener()
        sprintUpdatedListener()
        issueProcessCreatedListener()
        issueProcessUpdatedListener()
        issueProcessDeletedListener()
        projectManagementCreatedListener()
        projectManagementTagAddedListener()
        projectManagementTagDeletedListener()
        componentCreatedListener()

        console.log("Successfully connected to nats");
    } catch (error) {
        console.log("Failed connection to nats", error);
        process.exit(1)
    }
}


async function connectToMongoDb() {
    try {
        await mongoose.connect(process.env.MONGO_URL)
        console.log("Successfully connected to database");
    } catch (error) {
        console.log("Failed connection to database");
        process.exit(1)
    }
}

connectToMongoDb()
connectToNats()


app.listen(4002, () => {
    console.log("Listening on port 4002");
})
