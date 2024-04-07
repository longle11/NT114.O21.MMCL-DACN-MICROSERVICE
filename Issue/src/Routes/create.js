const express = require("express")
const issueModel = require('../models/issueModel')
const currentUserMiddleware = require("../Middlewares/currentUser-Middleware")
const issuePublisher = require("../nats/publisher/issue-publisher")
const BadRequestError = require("../Errors/Bad-Request-Error")
const UnauthorizedError = require("../Errors/UnAuthorized-Error")

const router = express.Router()

router.post("/create", currentUserMiddleware, async (req, res, next) => {
    try {

        if (req.currentUser) {
            const currentIssue = await issueModel.find({ shortSummary: req.body.shortSummary })
            if (currentIssue.length === 0) {
                const newIssue = await issueModel.create(req.body)

                const issueCopy = {
                    _id: newIssue._id,
                    projectId: newIssue.projectId,
                    priority: newIssue.priority,
                    shortSummary: newIssue.shortSummary,
                    positionList: newIssue.positionList,
                    issueType: newIssue.issueType,
                    issueStatus: newIssue.issueStatus,
                    assignees: newIssue.assignees,
                    creator: newIssue.creator
                }

                await issuePublisher(issueCopy, 'issue:created')

                return res.status(201).json({
                    message: "Successfully created an issue",
                    data: newIssue
                })
            } else {
                throw new BadRequestError("Short summary field is already existed")
            }
        }else {
            throw new UnauthorizedError("Authentication failed")
        }

    } catch (error) {
        next(error)
    }
})


module.exports = router;