const express = require('express')
const router = express.Router()
const servicePublisher = require('../nats/publisher/service-publisher');
const issueProcessModel = require('../models/issueProcessModels');
const randomColor = require('randomcolor')
var color = randomColor();
router.post('/create', async (req, res, next) => {
    try {
        const data = req.body

        const issueProcess = new issueProcessModel({...data, tag_color: color})
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
    } catch(error) {
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
        
        for(let process of templateProcess) {
            const newProcess = new issueProcessModel(process)
            const getNewProcess = await newProcess.save()
            
            await servicePublisher({
                _id: getNewProcess._id.toString(),
                name_process: getNewProcess.name_process
            }, 'issueprocess:created')
            
        }
        const processList = await issueProcessModel.find({project_id: req.params.id})
        res.status(201).json({
            message: "Successfully create default template for processes",
            data: processList
        })
    } catch(error) {

    }
})

module.exports = router
