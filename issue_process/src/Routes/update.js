const express = require('express')
const router = express.Router()
const workflowModel = require('../models/workflowModel');
const servicePublisher = require('../nats/publisher/service-publisher');
const issueProcessModel = require('../models/issueProcessModels');

router.put('/workflow/update/:workflowId', async (req, res) => {
    try {
        const data = await workflowModel.findByIdAndUpdate(req.params.workflowId, { $set: { ...req.body } })
        res.status(200).json({
            message: "Successfully updated a workflow",
            data: data
        })
    } catch (error) {
        console.log(error);

    }
})

router.put('/process/:processId', async (req, res, next) => {
    try {
        const getProcess = await issueProcessModel.findById(req.params.processId)
        if (getProcess) {
            if(req.body?.limited_number_issues) {
                if(typeof req.body.limited_number_issues !== 'number') {
                    return res.status(400).json({
                        message: "Please entering a number instead of string",
                    })
                }
            }
            const updatedProcess = await issueProcessModel.findByIdAndUpdate(req.params.processId, { $set: { ...req.body } })
            await servicePublisher({ process_id: req.params.processId, name_process: req.body.name_process }, "issueprocess:updated")

            return res.status(200).json({
                message: "Successfully updated a process",
                data: updatedProcess
            })
        } else {

        }
    } catch (error) {
        next(error)
    }
})


module.exports = router
