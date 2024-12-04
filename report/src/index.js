const express = require("express")
const app = express()
const cors = require("cors")
const bodyParser = require('body-parser')
const mongoose = require("mongoose")
const natsWrapper = require('./nats-wrapper')
const burndownChartStoryPointListener = require("./nats/listener/issue-storypoint-listener")
const burndownChartCreatedListener = require("./nats/listener/issue-burndown-created")
const burndownModel = require("./models/burndownChartModels")
app.use(bodyParser.json())
app.use(cors())

async function connectToMongoDb() {
    try {
        await mongoose.connect("mongodb://report-mongo-srv:27017/db")

        console.log('Connected successfully to database')
    } catch (err) {
        console.log('Connected failed to database')
        process.exit(1)
    }
}

async function connectToNats() {
    try {
        await natsWrapper.connect('jiraproject', 'report', 'http://nats-srv:4222')
        natsWrapper.client.on('close', () => {
            console.log('NATs connection closed');
            process.exit(1)
        })

        process.on('SIGINT', () => { natsWrapper.client.close() })
        process.on('SIGTERM', () => { natsWrapper.client.close() })

        burndownChartStoryPointListener()
        burndownChartCreatedListener()
        console.log("Connected successfully to nats");
    } catch (error) {
        console.log("Connected failed to nats server", error);
        process.exit(1)
    }
}

connectToMongoDb()
connectToNats()

app.get('/api/report/getburndown/:project_id/:sprint_id', async (req, res) => {
    const { project_id, sprint_id } = req.params
    const data = await burndownModel.find({project_id: project_id, sprint_id: sprint_id})
    console.log("data ", data);
    
    return res.status(200).json({
        message: "Successfully got a burndownchart info",
        data: data[0]
    })
})


app.listen(4010, () => {
    console.log("listening on port 4010");
})