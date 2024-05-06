const mongoose = require("mongoose")
const natsWrapper = require("./nats-wrapper")
const authCreatedListener = require("./nats/listener/auth-created-listener")
const commentCreatedListener = require("./nats/listener/comment-created-listener")
const commentDeletedListener = require("./nats/listener/comment-deleted-listener")
const commentUpdatedListener = require("./nats/listener/comment-updated-listener")
const projectManagementDeletedListener = require("./nats/listener/projectManagement-deleted-listener")
const projectManagementUpdatedListener = require("./nats/listener/projectManagement-updated-listener")
const app = require('./app')

async function connectToNats() {
    try {
        await natsWrapper.connect(process.env.NATS_CLUSTER_ID, process.env.NATS_CLIENT_ID, process.env.NATS_URL)
        natsWrapper.client.on('close', () => {
            console.log('NATs connection closed');
            process.exit()
        })

        process.on('SIGINT', () => { natsWrapper.client.close() })
        process.on('SIGTERM', () => { natsWrapper.client.close() })

        authCreatedListener()
        commentCreatedListener()
        commentDeletedListener()
        commentUpdatedListener()
        projectManagementDeletedListener()
        projectManagementUpdatedListener()

        console.log("Successfully connected to nats");
    } catch (error) {
        console.log("Failed connection to nats", error);
    }
}


async function connectToMongoDb() {
    try {
        await mongoose.connect(process.env.MONGO_URL) 

        console.log("Successfully connected to database");
    } catch (error) {
        console.log("Failed connection to database");
    }
}

connectToMongoDb()
connectToNats()


app.listen(4002, () => {
    console.log("Listening on port 4002");
})
