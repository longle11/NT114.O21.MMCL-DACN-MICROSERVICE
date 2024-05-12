const express = require("express")
const issueModel = require('../models/issueModel')
const currentUserMiddleware = require("../Middlewares/currentUser-Middleware")
const issuePublisher = require("../nats/publisher/issue-publisher")
const BadRequestError = require("../Errors/Bad-Request-Error")
const UnauthorizedError = require("../Errors/UnAuthorized-Error")
const { check, validationResult } = require('express-validator');


const router = express.Router()

router.post("/create", currentUserMiddleware, [
    check('shortSummary')
        .isLength({ min: 5 }).withMessage('must be at least 5 characters long'),
    check('timeSpent')
        .isInt({ min: 1 }).withMessage("timeSpent must be a integer number and greater than or equal to 1"),
    check('timeRemaining')
        .isInt({ min: 1 }).withMessage("timeRemaining must be a integer number and greater than or equal to 1"),
    check('timeOriginalEstimate')
        .isInt({ min: 1 }).withMessage("timeOriginalEstimate must be a integer number and greater than or equal to 1")
], async (req, res, next) => {
    try {
        if (req.currentUser) {
            const result = validationResult(req);
            if (!result.isEmpty()) {
                throw new BadRequestError('Information is invalid')
            } else {
                const issue = new issueModel(req.body)
                const newIssue = await issue.save()

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
            }
        } else {
            throw new UnauthorizedError("Authentication failed")
        }

    } catch (error) {
        next(error)
    }
})


module.exports = router;