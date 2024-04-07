const express = require("express")
const mongoose = require("mongoose")
const bodyParser = require("body-parser")
const cookieSession = require("cookie-session")

const cors = require('cors')
const errorHandler = require("./Middlewares/Error-handler")
const natsWrapper = require("./nats-wrapper")
const commentDeletedListener = require("./nats/comment-deleted-listeners")

const app = express()

app.set('trust proxy', 1)

app.use(cookieSession({
    signed: false,
    secure: true
}))

app.use(bodyParser.json())
app.use(cors())

app.use('/api/comments', require("./Routes/create"))
app.use('/api/comments', require("./Routes/update"))
app.use('/api/comments', require("./Routes/delete"))

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
        console.log("Ket noi thanh cong toi nats");
    } catch (error) {
        console.log("Kết nối thất bại tới nats", error);
    }
}

async function connectToMongoDb() {
    try {
        await mongoose.connect(process.env.MONGO_URL) 

        console.log("Ket noi thanh cong database");
    } catch (error) {
        console.log("Kết nối thất bại tới database");
    }
}

connectToMongoDb()
connectToNats()

app.use(errorHandler)

app.listen(4001, () => {
    console.log("Listening on port 4001 update");
})
