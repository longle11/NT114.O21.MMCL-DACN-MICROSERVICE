const express = require('express')
const router = express.Router()
const servicePublisher = require('../nats/publisher/service-publisher');
const issueProcessModel = require('../models/issueProcessModels');

router.get('/:projectId', async (req, res) => {
    try {
        const processList = await issueProcessModel.find({project_id: req.params.projectId})
            .populate({
                path: 'issue_list'
            })
        
        res.status(200).json({
            message: "Successfully got process list",
            data: processList
        })
    } catch(error) {
        console.log(error);
        
    }
})

module.exports = router
