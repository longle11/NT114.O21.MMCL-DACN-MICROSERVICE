
const app = require('./app')
const natsWrapper = require("./nats-wrapper")
const commentDeletedListener = require("./nats/comment-deleted-listeners")
const mongoose = require("mongoose")
const authCreatedListener = require('./nats/listener/auth-listener/auth-created-listener')

async function connectToNats() {
    try {
        await natsWrapper.connect(process.env.NATS_CLUSTER_ID, process.env.NATS_CLIENT_ID, process.env.NATS_URL)
        natsWrapper.client.on('close', () => {
            console.log('NATs connection closed');
            process.exit()
        })

        authCreatedListener()
        process.on('SIGINT', () => { natsWrapper.client.close() })
        process.on('SIGTERM', () => { natsWrapper.client.close() })
        console.log("Kế nối thành công tới nats");
    } catch (error) {
        console.log("Kết nối thất bại tới nats", error);
    }
}

async function connectToMongoDb() {
    try {
        await mongoose.connect(process.env.MONGO_URL) 

        console.log("Kết nối thành công tới dabase");
    } catch (error) {
        console.log("Kết nối thất bại tới database");
    }
}

connectToMongoDb()
connectToNats()


app.listen(4001, () => {
    console.log("Listening on port 4001");
})