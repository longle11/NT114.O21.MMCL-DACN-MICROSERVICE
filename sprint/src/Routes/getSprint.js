const express = require('express')
const router = express.Router()
const sprintModel = require('../models/sprintModel');
router.post('/:projectId', async (req, res, next) => {
    try {
        const getSprintsByProjectID = await sprintModel.find({ project_id: req.params.projectId })
            .populate({
                path: 'issue_list',
                populate: [
                    {
                        path: "issue_data_type_object",
                        populate: { path: 'value' }
                    },
                    {
                        path: "issue_data_type_array_object",
                        populate: { path: 'value' }
                    }
                ]
            })
        res.status(200).json({
            message: "Successfully got a sprint list",
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
                populate: [
                    { path: 'creator' },
                    {
                        path: "issue_data_type_object",
                        populate: { path: 'value' }
                    },
                    {
                        path: "issue_data_type_array_object",
                        populate: { path: 'value' }
                    }
                ]
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
