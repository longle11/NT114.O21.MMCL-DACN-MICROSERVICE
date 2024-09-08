const express = require('express')
const router = express.Router()
const workflowModel = require('../models/workflowModel');
const servicePublisher = require('../nats/publisher/service-publisher');
const issueProcessModel = require('../models/issueProcessModels');

router.put('/workflow/update/:workflowId', async (req, res) => {
    try {
        const getWorkflow = await workflowModel.findById(req.params.workflowId)
        if (getWorkflow) {
            if (req.body?.workflow_id) {
                const workflowNeedToBeChanged = await workflowModel.findById(req.body.workflow_id)
                if (workflowNeedToBeChanged) {
                    getWorkflow.issue_statuses.forEach(status => {
                        const index = workflowNeedToBeChanged.issue_statuses.findIndex(oldStatus => {
                            return oldStatus === status
                        })
                        if (index !== -1) {
                            workflowNeedToBeChanged.issue_statuses.splice(index, 1)
                        }
                    })

                    await workflowModel.findByIdAndUpdate(req.body.workflow_id, { $set: { issue_statuses: workflowNeedToBeChanged.issue_statuses } })
                }

            }
            await workflowModel.findByIdAndUpdate(req.params.workflowId, { $set: { ...req.body } })
        }

        res.status(200).json({
            message: "Successfully updated a workflow",
            data: getWorkflow
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
