const express = require('express')
const router = express.Router()
const sprintModel = require('../models/sprintModel');
router.get('/:projectId', async (req, res, next) => {
    try {
        const getSprintsByProjectID = await sprintModel.find({ project_id: req.params.projectId })

        res.status(200).json({
            message: "Successfully got sprint list",
            data: getSprintsByProjectID
        })
    } catch (error) {
        console.log(error);
    }
})

module.exports = router
