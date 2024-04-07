const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const mongoose = require("mongoose")
const cookieSession = require("cookie-session")
const errorHandler = require("./Middlewares/Error-handler")
const natsWrapper = require("./nats-wrapper")

const issueCreatedListener = require("./nats/listener/issue-created-listeners")
const authCreatedListener = require("./nats/listener/auth-created-listener")
const categoryCreatedListener = require("./nats/listener/category-created-listener")
const issueUpdatedListener = require("./nats/listener/issue-updated-listener")
const issueDeleteddListener = require("./nats/listener/issue-deleted-listener")


const app = express()
app.use(bodyParser.json())
app.use(cors())

app.set('trust proxy', 1)

app.use(cookieSession({
    signed: false,
    secure: true
}))

app.use('/api/projectmanagement', require("./Routes/create"))
app.use('/api/projectmanagement', require("./Routes/getList"))
app.use('/api/projectmanagement', require("./Routes/listUser"))
app.use('/api/projectmanagement', require("./Routes/insertUser"))
app.use('/api/projectmanagement', require("./Routes/update"))
app.use('/api/projectmanagement', require("./Routes/delete"))
app.use('/api/projectmanagement', require("./Routes/getProject"))
app.use('/api/projectmanagement', require("./Routes/insertIssue"))
app.use('/api/projectmanagement', require("./Routes/deleteUser"))

async function connectToMongoDb() {
    try {
        await mongoose.connect("mongodb://projectmanagement-mongo-srv:27017/db")

        console.log("Ket noi thanh cong database");
    } catch (error) {
        console.log("Kết nối thất bại tới database");
    }
}

async function connectToNats() {
    try {
        await natsWrapper.connect('jiraproject', 'projectmanagement', 'http://nats-srv:4222')
        natsWrapper.client.on('close', () => {
            console.log('NATs connection closed');
            process.exit()
        })

        process.on('SIGINT', () => { natsWrapper.client.close() })
        process.on('SIGTERM', () => { natsWrapper.client.close() })
        console.log("Ket noi thanh cong toi nats");

        //lang nghe su kien created tu issue service
        issueCreatedListener()
        //lang nghe su kien updated tu issue service
        issueUpdatedListener()
        //lang nghe su kien deleted tu issue service
        issueDeleteddListener()
        //lang nghe su kien created tu auth service
        authCreatedListener()
        //lang nghe su kien created tu category service
        categoryCreatedListener()
    } catch (error) {
        console.log("Kết nối thất bại tới nats", error);
    }
}

connectToMongoDb()
connectToNats()
app.use(errorHandler)

app.listen(4003, () => {
    console.log("Listening on port 4003 update");
})
