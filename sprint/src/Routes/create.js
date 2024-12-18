const express = require('express')
const router = express.Router()
const servicePublisher = require('../nats/publisher/service-publisher');
const sprintModel = require('../models/sprintModel');
router.post('/create', async (req, res, next) => {
    try {
        const getSprintByProjectID = await sprintModel.find({ project_id: req.body.project_id })
        const newData = req.body
        if (!req.body?.sprint_name) {
            if (getSprintByProjectID.length === 0) {
                req.body.sprint_name = "Default"
            } else {
                const getName = getSprintByProjectID[getSprintByProjectID.length - 1].sprint_name
                const generateNumber = Number.isInteger(parseInt(getName[getName.length - 1])) ? (parseInt(getName[getName.length - 1]) + 1).toString() : " 1"
                const sprint_name = getSprintByProjectID[getSprintByProjectID.length - 1].sprint_name
                if (Number.isInteger(parseInt(sprint_name[sprint_name.length - 1]))) {
                    req.body.sprint_name = sprint_name.substring(0, sprint_name.length - 1) + generateNumber
                } else {
                    req.body.sprint_name = sprint_name.substring(0) + generateNumber
                }
            }
        }

        const sprint = new sprintModel(newData)
        const newSprint = await sprint.save()


        const sprintDataCopy = {
            _id: newSprint._id,
            sprint_name: newSprint.sprint_name,
            sprint_status: newSprint.sprint_status
        }
        await servicePublisher(sprintDataCopy, 'sprint:created')

        return res.status(201).json({
            message: "Successfully created an sprint",
            data: newSprint
        })
    } catch (error) {
        console.log(error);
    }
})

module.exports = router
