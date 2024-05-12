
const app = require('./app')
const natsWrapper = require("./nats-wrapper")
const commentDeletedListener = require("./nats/comment-deleted-listeners")
const mongoose = require("mongoose")

async function connectToNats() {
    try {
        await natsWrapper.connect(process.env.NATS_CLUSTER_ID, process.env.NATS_CLIENT_ID, process.env.NATS_URL)
        natsWrapper.client.on('close', () => {
            console.log('NATs connection closed');
            process.exit()
        })

        commentDeletedListener()

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

        console.log("Kế nối thành công tớiabase");
    } catch (error) {
        console.log("Kết nối thất bại tới database");
    }
}

connectToMongoDb()
connectToNats()


app.listen(4001, () => {
    console.log("Listening on port 4001");
})