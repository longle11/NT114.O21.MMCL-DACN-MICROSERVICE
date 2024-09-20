const express = require('express')
const userModel = require('../models/users')
const router = express.Router()

router.post('/update/:id', async (req, res, next) => {
    try {
        const currentUser = await userModel.findById(req.params.id)
        if (req.body?.project_working) {
            currentUser.project_working = req.body.project_working
        }
        if (req.body?.working_issue) {
            const index = currentUser.working_issues.findIndex(issue => issue.issue_id.toString() === req.body?.viewed_issue.toString())

            if (index === -1) {
                currentUser.working_issues.push({ issue_id: req.body?.working_issue, createAt: new Date(), action: req.body.issue_action })
            } else {
                currentUser.working_issues[index].createAt = new Date()
                currentUser.working_issues[index].issue_action = req.body.issue_action
            }
            req.body.working_issue = null
            req.body.issue_action = null
        }

        if (req.body?.viewed_issue) {
            const index = currentUser.viewed_issues.findIndex(issue => issue.issue_id.toString() === req.body?.viewed_issue.toString())

            if (index === -1) {
                currentUser.viewed_issues.push({ issue_id: req.body?.viewed_issue, createAt: new Date() })
            } else {
                currentUser.viewed_issues[index].createAt = new Date()
                const workingIndex = currentUser.working_issues.findIndex(issue => issue.issue_id.toString() === req.body?.viewed_issue.toString())
                currentUser.working_issues[workingIndex].createAt = new Date()
            }
            req.body.viewed_issue = null
        }

        if (req.body?.assigned_issue) {
            currentUser.assigned_issues.push({ issue_id: req.body?.assigned_issue, createAt: new Date() })
            req.body.assigned_issue = null
        }
        await currentUser.save()
        return res.status(200).json({
            message: "Successfully updated user information",
            data: currentUser
        })
    } catch (error) {
        console.log(error);

    }
})

module.exports = router