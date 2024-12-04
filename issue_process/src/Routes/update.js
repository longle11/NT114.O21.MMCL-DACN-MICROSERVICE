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
            if (req.body?.limited_number_issues) {
                if (typeof req.body.limited_number_issues !== 'number') {
                    return res.status(400).json({
                        message: "Please entering a number instead of string",
                    })
                }
            }
            const updatedProcess = await issueProcessModel.findByIdAndUpdate(req.params.processId, { $set: { ...req.body } })
            await servicePublisher({ process_id: req.params.processId, name_process: req.body.name_process, type_process: req.body?.type_process ? req.body?.type_process : updatedProcess.type_process }, "issueprocess:updated")

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

//update the position of 2 cols in process model
router.put('/processes/:project_id', async (req, res, next) => {
    try {
        var getAllProcessesInProject = await issueProcessModel.find({project_id: req.params.project_id})
        
        if (getAllProcessesInProject.length > 0 && typeof req.body.source_col_index?.toString() === 'string' && typeof req.body.dest_col_index?.toString() === 'string') {
            const sourceCol = getAllProcessesInProject.find(process => process._id.toString() === req.body.source_col_index?.toString())
            const destCol = getAllProcessesInProject.find(process => process._id.toString() === req.body.dest_col_index?.toString())
            
            await issueProcessModel.updateOne({_id: sourceCol._id}, {$set: { index_col: destCol.index_col }})
            await issueProcessModel.updateOne({_id: destCol._id}, {$set: { index_col: sourceCol.index_col }})

            return res.status(200).json({
                message: "Successfully swapped values",
                data: []
            })
        } else {
            return res.status(400).json({
                message: "Failed to swap 2 processes",
                data: []
            });
        }
    } catch (error) {
        next(error)
    }
})


module.exports = router
