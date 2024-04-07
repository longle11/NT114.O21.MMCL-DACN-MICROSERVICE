const express = require("express")
const currentUserMiddleware = require("../Middlewares/currentUser-Middleware")
const issueModel = require('../models/issueModel')
const issuePublisher = require("../nats/publisher/issue-publisher")
const UnauthorizedError = require("../Errors/UnAuthorized-Error")
const BadRequestError = require("../Errors/Bad-Request-Error")
const router = express.Router()

router.put("/delete/assignee/:id", currentUserMiddleware, async (req, res, next) => {
    try {
        if (req.currentUser) {
            const { id } = req.params
            const currentIssue = await issueModel.findById(id)
            if (!currentIssue) {
                throw new BadRequestError("Issue not found")
            } else {
                let listAssignees = currentIssue.assignees
                const index = listAssignees.findIndex(ele => ele.toString() === req.body.userId)
                if (index !== -1) {
                    listAssignees.splice(index, 1)
                    await issueModel.updateOne({ _id: id }, { $set: { assignees: listAssignees } })
                    const copyIssue = {
                        _id: currentIssue._id,
                        priority: currentIssue.priority,
                        shortSummary: currentIssue.shortSummary,
                        positionList: currentIssue.positionList,
                        issueType: currentIssue.issueType,
                        issueStatus: currentIssue.issueStatus,
                        assignees: currentIssue.assignees
                    }

                    issuePublisher(copyIssue, 'issue:updated')

                    return res.status(200).json({
                        message: "Successfully deleted user from this issue",
                        data: currentIssue
                    })
                } else {
                    throw new BadRequestError("User not found")
                }
            }
        } else {
            throw new UnauthorizedError("Authentication failed")
        }
    } catch (error) {
        next(error)
    }
})


module.exports = router;