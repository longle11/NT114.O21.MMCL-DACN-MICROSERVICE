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

        const issueProcess = new issueProcessModel({ ...data, tag_color: req.body?.tag_color ? req._construct.body.tag_color : color })
        const newIssueProcess = await issueProcess.save()

        const issueProcessDataCopy = {
            _id: newIssueProcess._id,
            name_process: newIssueProcess.name_process
        }

        await servicePublisher(issueProcessDataCopy, 'issueprocess:created')

        res.status(201).json({
            message: "Successfully created a issue process",
            data: newIssueProcess
        })
    } catch (error) {
        console.log(error);
    }
})

router.post('/create/default/:id', async (req, res) => {
    try {
        const templateProcess = [
            {
                project_id: req.params.id,
                name_process: 'TO DO',
                tag_color: '#dddd'
            },
            {
                project_id: req.params.id,
                name_process: 'IN PROGRESS',
                tag_color: '#1d7afc'
            },
            {
                project_id: req.params.id,
                name_process: 'DONE',
                tag_color: '#22a06b'
            }
        ]

        // const workflowCreate = new workflowModel({
        //     name_workflow: "Default",
        //     issue_statuses: [0, 1, 2],
        //     project_id: req.params.id
        // })

        // await workflowCreate.save()
        // var nodes = []
        // var edges = []
        // var x = 200, y = 500
        for (let process of templateProcess) {
            const newProcess = new issueProcessModel(process)
            const getNewProcess = await newProcess.save()
            await servicePublisher({
                _id: getNewProcess._id.toString(),
                name_process: getNewProcess.name_process
            }, 'issueprocess:created')
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
        console.log("haha ", getNewWorkflow)
        return res.status(201).json({
            message: "Successfully created a new workflow",
            data: getNewWorkflow
        })
    } catch (error) {
        console.log(error);
    }
})


module.exports = router
