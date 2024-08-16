const express = require('express')
const router = express.Router()
var randomColor = require('randomcolor');
const servicePublisher = require('../nats/publisher/service-publisher');
const epicModel = require('../models/epicModel');
router.post('/epic-create', async (req, res, next) => {
    try {
        const data = req.body
        const newData = {...data, tag_color: randomColor()}

        const epic = new epicModel(newData)
        const newEpic = await epic.save()

        const epicDataCopy = {
            _id: newEpic._id,
            epic_name: newEpic.epic_name,
            tag_color: newEpic.tag_color
        }

        await servicePublisher(epicDataCopy, 'epic:created')

        res.status(201).json({
            message: "Successfully created an epic",
            data: newEpic
        })
    } catch(error) {
        console.log(error);
    }
})

module.exports = router
