const express = require('express')
const router = express.Router()
const worklogHistoryModel = require('../models/worklogHistoryModel');
const issueHistoryModel = require('../models/issueHistoryModels');
router.post('/worklog-create', async (req, res, next) => {
    try {
        const data = req.body
        console.log(" req.body", req.body);
        

        const worklogHistory = new worklogHistoryModel(data)
        const newWorklogHistory = await worklogHistory.save()

        console.log("Du lieu duoc tao ra ", newWorklogHistory);

        res.status(201).json({
            message: "Successfully created an worklogHistory",
            data: newWorklogHistory
        })
    } catch (error) {
        console.log(error);
    }
})

router.post('/issuehistory-create', async (req, res, next) => {
    try {
        var data = req.body
        const isIssueExisted = await issueHistoryModel.find({ issue_id: data.issue_id })

        if (isIssueExisted.length !== 0) {
            const histories = [...isIssueExisted[0].histories, {
                name_status: data.name_status,
                type_history: data.type_history,
                createBy: data.createBy,
                old_status: data.old_status,
                new_status: data.new_status
            }]
            
            const updateHistoryList = await issueHistoryModel.findOneAndUpdate({ issue_id: data.issue_id }, { histories: histories })

            res.status(201).json({
                message: "Successfully created an issueHistory",
                data: updateHistoryList
            })
        } else {
            const histories = [{
                name_status: data.name_status,
                type_history: data.type_history,
                createBy: data.createBy,
                old_status: data.old_status,
                new_status: data.new_status
            }]
            data = { ...data, histories }
            const updateHistoryList = await issueHistoryModel.create(data)
            res.status(201).json({
                message: "Successfully created an issueHistory",
                data: updateHistoryList
            })
        }
    } catch (error) {
        console.log(error);
    }
})

module.exports = router
