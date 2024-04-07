const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const errorHandler = require("./Middlewares/Error-handler")
const mongoose = require("mongoose")
const cookieSession = require('cookie-session')
const natsWrapper = require("./nats-wrapper")
const app = express()

app.use(cors())
app.use(bodyParser.json())

app.set('trust proxy', 1) // trust first proxy

app.use(cookieSession({
    signed: false,
    secure: true
}))

app.use('/api/users', require('./Routes/signup'))
app.use('/api/users', require('./Routes/login'))
app.use('/api/users', require('./Routes/currentUser'))
app.use('/api/users', require('./Routes/logout'))


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

async function connectToMongoDb() {
    try {
        await mongoose.connect(process.env.MONGO_URL)

        console.log("Ket noi thanh cong database");
    } catch (error) {
        console.log("Kết nối thất bại tới database");
    }
}

connectToNats()

connectToMongoDb()

app.use(errorHandler)

app.listen(4000, () => {
    console.log("Listening on port 4000");
})