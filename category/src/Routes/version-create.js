const express = require('express')
const router = express.Router()
var randomColor = require('randomcolor');
const servicePublisher = require('../nats/publisher/service-publisher');
const versionModel = require('../models/versionModel');
router.post('/version-create', async (req, res, next) => {
    try {
        const data = req.body
        const newData = {...data, tag_color: randomColor({luminosity: 'light'})}

        const version = new versionModel(newData)
        const newVersion = await version.save()

        const versionDataCopy = {
            _id: newVersion._id,
            version_name: newVersion.version_name,
            tag_color: newVersion.tag_color
        }

        await servicePublisher(versionDataCopy, 'version:created')

        res.status(201).json({
            message: "Successfully created an version",
            data: newVersion
        })
    } catch(error) {
        console.log(error);
    }
})

module.exports = router
