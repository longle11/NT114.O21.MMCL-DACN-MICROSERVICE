const express = require('express')
const router = express.Router()
const workflowModel = require('../models/workflowModel');
const servicePublisher = require('../nats/publisher/service-publisher');
const issueProcessModel = require('../models/issueProcessModels');

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

router.delete('/process/:processId', async (req, res) => {
    try {
        const getProcess = await issueProcessModel.findById(req.params.processId)
        if (getProcess) {
            const data = await issueProcessModel.findByIdAndDelete(req.params.processId)
            servicePublisher({
                _id: data._id
            }, "issueprocess:deleted")
            
            return res.status(200).json({
                message: "Successfully deleted a process",
                data: data
            })
        }
        return res.status(200).json({
            message: "Failed to delete a process",
            data: null
        })
    } catch (error) {
        console.log(error);
    }
})



module.exports = router
