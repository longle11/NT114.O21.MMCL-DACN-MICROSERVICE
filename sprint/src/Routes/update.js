const express = require('express')
const router = express.Router()
const sprintModel = require('../models/sprintModel');
router.put('/update/:sprintId', async (req, res, next) => {
    try {
       await sprintModel.findByIdAndUpdate(req.params.sprintId, req.body)
       console.log(req.body);
       const getSprintList = await sprintModel.find({project_id: req.body.project_id})
        
        res.status(200).json({
            message: "Successfully updated a sprint",
            data: getSprintList
        })
    } catch (error) {
        console.log(error);
    }
})

module.exports = router
