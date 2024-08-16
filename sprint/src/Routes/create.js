const express = require('express')
const router = express.Router()
const servicePublisher = require('../nats/publisher/service-publisher');
const sprintModel = require('../models/sprintModel');
router.post('/create', async (req, res, next) => {
    try {
        const getSprintByProjectID = await sprintModel.find({ project_id: req.body.project_id })
        const newData = req.body
        if (getSprintByProjectID.length === 0) {
            req.body.sprint_name = "Default"
        }else {
            const getName = getSprintByProjectID[getSprintByProjectID.length - 1].sprint_name
            const generateNumber = parseInt(getName[getName.length - 1]) ? (parseInt(getName[getName.length - 1]) + 1).toString() : "1"
            const sprint_name = getSprintByProjectID[0].sprint_name
            req.body.sprint_name = sprint_name.substring(0, sprint_name.length-1) + " " + generateNumber
        }

        const sprint = new sprintModel(newData)
        const newSprint = await sprint.save()

        const sprintDataCopy = {
            _id: newSprint._id,
            sprint_name: newSprint.sprint_name
        }
        await servicePublisher(sprintDataCopy, 'sprint:created')

        const getSprintList = await sprintModel.find({project_id: req.body.project_id})
        res.status(201).json({
            message: "Successfully created an sprint",
            data: getSprintList
        })
    } catch (error) {
        console.log(error);
    }
})

module.exports = router
