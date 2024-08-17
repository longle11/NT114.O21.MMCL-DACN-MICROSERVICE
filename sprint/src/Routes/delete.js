const express = require('express')
const router = express.Router()
const sprintModel = require('../models/sprintModel');
router.post('/delete/:sprintId', async (req, res, next) => {
    try {
        await sprintModel.findByIdAndDelete(req.params.sprintId)
        const getSprintList = await sprintModel.find({ project_id: req.body.project_id })
            .populate({
                path: 'issue_list',
                populate: {
                    path: 'creator'
                }
            })
        res.status(200).json({
            message: "Successfully delete a sprint",
            data: getSprintList
        })
    } catch (error) {
        console.log(error);
    }
})

module.exports = router
