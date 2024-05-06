const mongoose = require("mongoose")
const app = require('./app')
const natsWrapper = require("./nats-wrapper")

async function connectToMongoDb() {
    try {
        await mongoose.connect(process.env.MONGO_URL)

        console.log("Ket noi thanh cong database");
    } catch (error) {
        console.log("Kết nối thất bại tới database");
    }
}

async function connectToNats() {
    try {
        await natsWrapper.connect(process.env.NATS_CLUSTER_ID, process.env.NATS_CLIENT_ID, process.env.NATS_URL)
        natsWrapper.client.on('close', () => {
            console.log('NATs connection closed');
            process.exit()
        })

        process.on('SIGINT', () => { natsWrapper.client.close() })
        process.on('SIGTERM', () => { natsWrapper.client.close() })
        console.log("Ket noi thanh cong toi nats");
    } catch (error) {
        console.log("Kết nối thất bại tới nats", error);
    }
}
connectToNats()
connectToMongoDb()

app.listen(4000, () => {
    console.log("Listening on port 4000");
})