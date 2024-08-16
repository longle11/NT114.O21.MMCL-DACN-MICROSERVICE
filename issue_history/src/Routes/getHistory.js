const express = require('express')
const router = express.Router()
const worklogHistoryModel = require('../models/worklogHistoryModel');
const issueHistoryModel = require('../models/issueHistoryModels');

router.get('/issuehistory-list/:issueId', async (req, res, next) => {
    try {
        const getHistoriesList = await issueHistoryModel.find({issue_id: req.params.issueId})
            .populate({
                path: 'histories',
                populate: {
                    path: 'createBy'
                }
            })
        res.status(200).json({
            message: "Successfully got an issue history list",
            data: getHistoriesList
        })
    } catch(error) {
        console.log(error);
    }
})

router.get('/worklog-list/:issueId', async (req, res, next) => {
    try {
        const getWorklogHistories = await worklogHistoryModel.find({issue_id: req.params.issueId})
            .populate({
                path: 'creator'
            })
        res.status(200).json({
            message: "Successfully got an worklog history list",
            data: getWorklogHistories
        })
    } catch(error) {
        console.log(error);
    }
})


module.exports = router
