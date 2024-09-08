const express = require('express')
const router = express.Router()
const sprintModel = require('../models/sprintModel');
router.post('/:projectId', async (req, res, next) => {
    try {
        const getSprintsByProjectID = await sprintModel.find({ project_id: req.params.projectId })
            .populate({
                path: 'issue_list',
                populate: {
                    path: 'creator'
                }
            })
            .populate({
                path: 'issue_list',
                populate: {
                    path: 'epic_link'
                }
            })
            .populate({
                path: 'issue_list',
                populate: {
                    path: 'fix_version'
                }
            })
            .populate({
                path: 'issue_list',
                populate: {
                    path: 'issue_type'
                }
            })
            .populate({
                path: 'issue_list',
                populate: {
                    path: 'assignees'
                }
            })

        res.status(200).json({
            message: "Successfully got sprint list",
            data: getSprintsByProjectID
        })
    } catch (error) {
        console.log(error);
    }
})

router.get('/getsprint/:sprintId', async (req, res, next) => {
    try {
        const getSprintById = await sprintModel.findById(req.params.sprintId)
            .populate({
                path: 'issue_list',
                populate: {
                    path: 'creator'
                }
            })
            .populate({
                path: 'issue_list',
                populate: {
                    path: 'epic_link'
                }
            })
            .populate({
                path: 'issue_list',
                populate: {
                    path: 'issue_type'
                }
            })
            .populate({
                path: 'issue_list',
                populate: {
                    path: 'assignees'
                }
            })

        res.status(200).json({
            message: "Successfully got a sprint",
            data: getSprintById
        })
    } catch (error) {
        console.log(error);
    }
})

module.exports = router