const express = require("express")
const issueModel = require('../models/issueModel')
const currentUserMiddleware = require("../Middlewares/currentUser-Middleware")
const issuePublisher = require("../nats/publisher/issue-publisher")
const BadRequestError = require("../Errors/Bad-Request-Error")
const UnauthorizedError = require("../Errors/UnAuthorized-Error")
const { check, validationResult } = require('express-validator');


const router = express.Router()

router.post("/create", async (req, res, next) => {
    try {
        const issue = new issueModel(req.body)
        const newIssue = await issue.save()


        const issueCopy = {
            _id: newIssue._id,
            issue_priority: newIssue.issue_priority,
            summary: newIssue.summary,
            issue_status: newIssue.issue_status,
            assignees: newIssue.assignees,
            creator: newIssue.creator,
            epic_link: newIssue.epic_link,
            fix_version: newIssue.fix_version,
        }

        await issuePublisher(issueCopy, 'issue:created')

        return res.status(201).json({
            message: "Successfully created an issue",
            data: newIssue
        })
        // console.log("loi ngoai nay");
        // if (req.currentUser) {
        //     console.log("vao trong nay");
        //     const issue = new issueModel(req.body)
        //     const newIssue = await issue.save()

        //     console.log("gia tri duoc tao ra", newIssue);

        //     const issueCopy = {
        //         _id: newIssue._id,
        //         issue_priority: newIssue.issue_priority,
        //         summary: newIssue.summary,
        //         issue_type: newIssue.issue_type,
        //         assignees: newIssue.assignees,
        //         creator: newIssue.creator,
        //         epic_link: newIssue.epic_link,
        //         fix_version: newIssue.fix_version,
        //     }

        //     await issuePublisher(issueCopy, 'issue:created')

        //     return res.status(201).json({
        //         message: "Successfully created an issue",
        //         data: newIssue
        //     })
        // } else {
        //     throw new UnauthorizedError("Authentication failed")
        // }

    } catch (error) {
        console.log(error);
        next(error)
    }
})


module.exports = router;