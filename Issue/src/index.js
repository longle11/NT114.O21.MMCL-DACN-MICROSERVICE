const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const mongoose = require("mongoose")
const cookieSession = require("cookie-session")
const errorHandler = require("./Middlewares/Error-handler")
const natsWrapper = require("./nats-wrapper")
const authCreatedListener = require("./nats/listener/auth-created-listener")
const commentCreatedListener = require("./nats/listener/comment-created-listener")
const commentDeletedListener = require("./nats/listener/comment-deleted-listener")
const commentUpdatedListener = require("./nats/listener/comment-updated-listener")
const projectManagementDeletedListener = require("./nats/listener/projectManagement-deleted-listener")

const app = express()
app.use(bodyParser.json())
app.use(cors())

app.set('trust proxy', 1)

app.use(cookieSession({
    signed: false,
    secure: true
}))

app.use('/api/issue', require('./Routes/create'))
app.use('/api/issue', require('./Routes/getIsuue'))
app.use('/api/issue', require('./Routes/delete'))
app.use('/api/issue', require('./Routes/insertIssue'))
app.use('/api/issue', require('./Routes/update'))
app.use('/api/issue', require('./Routes/deleteAssignee'))

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

app.use(errorHandler)

app.listen(4002, () => {
    console.log("Listening on port 4002 update");
})
