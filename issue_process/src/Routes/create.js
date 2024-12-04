const express = require('express')
const router = express.Router()
const servicePublisher = require('../nats/publisher/service-publisher');
const issueProcessModel = require('../models/issueProcessModels');
const randomColor = require('randomcolor');
const workflowModel = require('../models/workflowModel');
var color = randomColor({ luminosity: 'light' });
router.post('/create', async (req, res, next) => {
    try {
        const data = req.body
        const checkExisted = await issueProcessModel.find({ project_id: req.body.project_id, name_process: req.body.name_process })
        if (checkExisted.length === 0) {
            //create index_col for current process
            const maxIndex = await issueProcessModel.find({project_id: req.body.project_id})
            const issueProcess = new issueProcessModel({ ...data, tag_color: req.body?.tag_color ? req.body.tag_color : color, index_col: maxIndex.length })
            const newIssueProcess = await issueProcess.save()

            const issueProcessDataCopy = {
                _id: newIssueProcess._id,
                name_process: newIssueProcess.name_process,
                tag_color: newIssueProcess.tag_color
            }

            await servicePublisher(issueProcessDataCopy, 'issueprocess:created')

            return res.status(201).json({
                message: "Successfully created a issue process",
                data: newIssueProcess
            })
        }
        return res.status(400).json({
            message: 'Name process is already existed'
        })

    } catch (error) {
        console.log(error);
    }
})

router.post('/create/default/:id', async (req, res) => {
    try {
        const { workflow_default } = req.body
        const newWorkflows = workflow_default.map((flow, index) => {
            return {
                project_id: req.params.id,
                name_process: flow.process_name?.toUpperCase(),
                index_col: index,
                tag_color: flow.process_color,
                type_process: flow.type_process
            }
        })

        // const workflowCreate = new workflowModel({
        //     name_workflow: "Default",
        //     issue_statuses: [0, 1, 2],
        //     project_id: req.params.id
        // })

        // await workflowCreate.save()
        // var nodes = []
        // var edges = []
        // var x = 200, y = 500
        for (let process of newWorkflows) {
            const newProcess = new issueProcessModel(process)
            await newProcess.save()
            // if (process.name_process.toLowerCase() === 'to do') {
            //     //push create flow first
            //     nodes.push({
            //         id: '0',
            //         data: { label: 'CREATED' },
            //         type: 'custom',
            //         position: {
            //             x: x,
            //             y: y + 0
            //         }
            //     })


            //     nodes.push({
            //         id: getNewProcess._id,
            //         data: {
            //             label: getNewProcess.name_process
            //         },
            //         type: null,
            //         position: {
            //             x: x,
            //             y: y + 100
            //         }
            //     })
            //     y += 100

            //     edges.push({
            //         id: `e0-${getNewProcess._id}`,
            //         source: '0',
            //         target: `${getNewProcess._id}`,
            //         label: 'created'
            //     })
            // } else {
            //     nodes.push({
            //         id: getNewProcess._id,
            //         data: {
            //             label: getNewProcess.name_process
            //         },
            //         type: null,
            //         position: {
            //             x: x,
            //             y: y + 50
            //         }
            //     })
            //     y += 50
            // }
        }

        // await workflowModel.findByIdAndUpdate(workflowCreate._id, { $set: { edges, nodes } })
        //dispatch event to make default id for workflows default in projectModel
        // await servicePublisher({ workflow_id: workflowCreate._id.toString(), project_id: workflowCreate.project_id.toString() }, "workflow:created")
        const processList = await issueProcessModel.find({ project_id: req.params.id })
        await servicePublisher({
            processList: processList.map(process => {
                return {
                    _id: process._id,
                    name_process: process.name_process,
                    tag_color: process.tag_color,
                    project_id: process.project_id,
                    type_process: process.type_process
                }
            })
        }, 'issueprocess:created')

        res.status(201).json({
            message: "Successfully create default template for processes",
            data: processList
        })
    } catch (error) {
        console.log(error);

    }
})

router.post('/workflow/create', async (req, res) => {
    try {
        const newWorkflow = new workflowModel(req.body)
        const getNewWorkflow = await newWorkflow.save()
        return res.status(201).json({
            message: "Successfully created a new workflow",
            data: getNewWorkflow
        })
    } catch (error) {
        console.log(error);
    }
})


module.exports = router
