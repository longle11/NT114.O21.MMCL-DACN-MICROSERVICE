const express = require('express')
const router = express.Router()
const servicePublisher = require('../nats/publisher/service-publisher');
const componentModel = require('../models/componentModel');
router.post('/component-create', async (req, res, next) => {
    try {
        const data = req.body
        const newData = { ...data }

        const component = new componentModel(newData)
        const newComponent = await component.save()

        const componentDataCopy = {
            _id: newComponent._id,
            component_name: newComponent.component_name
        }

        await servicePublisher(componentDataCopy, 'component:created')

        res.status(201).json({
            message: "Successfully created an component",
            data: newComponent
        })
    } catch (error) {
        console.log(error);
    }
})

module.exports = router
