
const app = require("./app")
const natsWrapper = require("./nats-wrapper")
const mongoose = require("mongoose")

const authCreatedListener = require("./nats/listener/auth-created-listener")
const categoryCreatedListener = require("./nats/listener/category-created-listener")
async function connectToMongoDb() {
    try {
        await mongoose.connect("mongodb://projectmanagement-mongo-srv:27017/db")

        console.log("Connected successfully to database");
    } catch (error) {
        console.log("Connected failed to database");
        process.exit(1)
    }
}

async function connectToNats() {
    try {
        await natsWrapper.connect('jiraproject', 'projectmanagement', 'http://nats-srv:4222')
        natsWrapper.client.on('close', () => {
            console.log('NATs connection closed');
            process.exit(1)
        })

        process.on('SIGINT', () => { natsWrapper.client.close() })
        process.on('SIGTERM', () => { natsWrapper.client.close() })
        console.log("Connected successfully to nats");

        // //lang nghe su kien created tu issue service
        // issueCreatedListener()
        // //lang nghe su kien updated tu issue service
        // issueUpdatedListener()
        // //lang nghe su kien deleted tu issue service
        // issueDeleteddListener()
        //lang nghe su kien created tu auth service
        authCreatedListener()
        //lang nghe su kien created tu category service
        categoryCreatedListener()
    } catch (error) {
        console.log("Connected failed to nats server", error);
        process.exit(1)
    }
}

connectToMongoDb()
connectToNats()

app.listen(4003, () => {
    console.log("Listening on port 4003");
})
