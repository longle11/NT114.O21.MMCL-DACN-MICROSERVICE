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
            if (!currentUser.working_issues.filter(issue => issue.issue_id).includes(req.body?.working_issues)) {
                currentUser.working_issues.push({ issue_id: req.body?.working_issue, createAt: Date.now(), action: req.body.issue_action })
            } else {
                //get index and update time to newest
                const index = currentUser.working_issues.findIndex(issue => issue.issue_id === req.body?.viewed_issue)
                if (index !== -1) {
                    currentUser.working_issues[index].createAt = Date.now()
                    currentUser.working_issues[index].issue_action = req.body.issue_action
                }
            }
            req.body.working_issue = null
            req.body.issue_action = null
        }

        if (req.body?.viewed_issue) {
            if (!currentUser.viewed_issues.filter(issue => issue.issue_id).includes(req.body?.viewed_issue)) {
                currentUser.viewed_issues.push({ issue_id: req.body?.viewed_issue, createAt: Date.now() })
            } else {
                //get index and update time to newest
                const index = currentUser.viewed_issues.findIndex(issue => issue.issue_id === req.body?.viewed_issue)
                if (index !== -1) {
                    currentUser.viewed_issues[index].createAt = Date.now()
                }
            }
            req.body.viewed_issue = null
        }

        if (req.body?.assigned_issue) {
            currentUser.assigned_issues.push({ issue_id: req.body?.assigned_issue, createAt: Date.now() })
            req.body.assigned_issue = null
        }
        await currentUser.save()
        const getNewInfo = {
            id: currentUser._id,
            username: currentUser.username,
            email: currentUser.email,
            avatar: currentUser.avatar,
            project_working: currentUser.project_working,
            viewed_issues: currentUser.viewed_issues,
            assigned_issues: currentUser.assigned_issues,
            working_issues: currentUser.working_issues
        }
        res.status(200).json({
            message: "Successfully updated user information",
            data: getNewInfo
        })
    } catch (error) {
        console.log(error);

    }
})

module.exports = router