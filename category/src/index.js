const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoose =require('mongoose')
const natsWrapper = require('./nats-wrapper')
const issueCreatedListener = require('./nats/listener/issue-listener/issue-created-listeners')
const authCreatedListener = require('./nats/listener/auth-listener/auth-created-listener')
const issueUpdatedListener = require('./nats/listener/issue-listener/issue-updated-listener')
const issueManyUpdatedListener = require('./nats/listener/issue-listener/issue-many-updated-listener')
const issueEpicUpdatedListener = require('./nats/listener/issue-listener/issue-epic-updated-listener')
const issueVersionUpdatedListener = require('./nats/listener/issue-listener/issue-version-updated-listener')
const app = express()

app.use(bodyParser.json())
app.use(cors())


async function connectToNats() {
    try {
        await natsWrapper.connect(process.env.NATS_CLUSTER_ID, process.env.NATS_CLIENT_ID, process.env.NATS_URL)
        natsWrapper.client.on('close', () => {
            console.log('NATs connection closed');
            process.exit()
        })

        process.on('SIGINT', () => { natsWrapper.client.close() })
        process.on('SIGTERM', () => { natsWrapper.client.close() })
        
        issueEpicUpdatedListener()
        issueVersionUpdatedListener()
        issueCreatedListener()
        issueManyUpdatedListener()
        authCreatedListener()
        issueUpdatedListener()
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


app.use('/api/category', require('./Routes/create'))
app.use('/api/category', require('./Routes/delete'))
app.use('/api/category', require('./Routes/getList'))
app.use('/api/category', require('./Routes/epic-create'))
app.use('/api/category', require('./Routes/version-create'))
app.use('/api/category', require('./Routes/component-create'))
app.use('/api/category', require('./Routes/update'))

app.listen(4004, () => {
    console.log("Listening on port 4004");
})