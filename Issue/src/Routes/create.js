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
        //generate the newest number for issue in ordinal number
        const getAllIssuesInProjectId = await issueModel.find({ project_id: req.body.project_id })
        if (getAllIssuesInProjectId.length === 0) {
            req.body.ordinal_number = 1
        } else {
            const ordinalNumberArrs = getAllIssuesInProjectId.map(issue => issue.ordinal_number)
            req.body.ordinal_number = Math.max(...ordinalNumberArrs) + 1
        }

        const issue = new issueModel(req.body)
        const newIssue = await issue.save()

        if (req.body?.current_sprint !== null) {
            await issuePublisher({ sprint_id: newIssue.current_sprint?.toString(), issue_id: newIssue._id.toString() }, 'issueInsertToSprint:created')
        }

        const issueCopy = {
            _id: newIssue._id,
            issue_priority: newIssue.issue_priority,
            summary: newIssue.summary,
            issue_status: newIssue.issue_status,
            assignees: newIssue.assignees,
            creator: newIssue.creator,
            epic_link: newIssue.epic_link,
            fix_version: newIssue.fix_version,
            issue_type: newIssue.issue_type,
            ordinal_number: newIssue.ordinal_number
        }

        await issuePublisher(issueCopy, 'issue:created')
        // if (req.currentUser) {
        //     const issue = new issueModel(req.body)
        //     const newIssue = await issue.save()

        //     const issueCopy = { 
        //         _id: newIssue._id,
        //         issue_priority: newIssue.issue_priority,
        //         summary: newIssue.summary,
        //         issue_type: newIssue.issue_type,
        //         assignees: newIssue.assignees,
        //         creator: newIssue.creator,
        //         epic_link: newIssue.epic_link,
        //         fix_version: newIssue.fix_version,
        //         issue_tpye: newIssue.issue_type
        //     }
        //     console.log("public ban copy ", issueCopy);


        //     await issuePublisher(issueCopy, 'issue:created')

        //     return res.status(201).json({
        //         message: "Successfully created an issue",
        //         data: newIssue
        //     })
        // } else {
        //     throw new UnauthorizedError("Authentication failed")
        // }
        return res.status(201).json({
            message: "Successfully created an issue",
            data: newIssue
        })

    } catch (error) {
        console.log(error);
        next(error)
    }
})


module.exports = router;