const express = require('express')
const router = express.Router()
const sprintModel = require('../models/sprintModel');
const userModel = require('../models/userModel');
router.get('/:projectId', async (req, res, next) => {
    try {
        const getSprintsByProjectID = await sprintModel.find({ project_id: req.params.projectId })
            .populate({
                path: 'issue_list',
                populate: {
                    path: 'creator'
                }
            })
            const userInfo = await userModel.find({})
            console.log("userinfo", userInfo);
            
        res.status(200).json({
            message: "Successfully got sprint list",
            data: getSprintsByProjectID
        })
    } catch (error) {
        console.log(error);
    }
})

module.exports = router
