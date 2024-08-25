const express = require('express')
const router = express.Router()
const workflowModel = require('../models/workflowModel');
const servicePublisher = require('../nats/publisher/service-publisher');

router.delete('/workflow/delete/:workflowId', async (req, res) => {
    try {
        const getWorkflow = await workflowModel.findById(req.params.workflowId)
        if (getWorkflow) {
            await workflowModel.findByIdAndDelete(req.params.workflowId)
        }
        res.status(200).json({
            message: "Successfully deleted a workflow",
            data: getWorkflow
        })
    } catch (error) {
        console.log(error);

    }
})



module.exports = router
