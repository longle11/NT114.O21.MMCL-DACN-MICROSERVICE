const express = require("express")
const issueModel = require('../models/issueModel')
const currentUserMiddleware = require("../Middlewares/currentUser-Middleware")
const issuePublisher = require("../nats/publisher/issue-publisher")
const BadRequestError = require("../Errors/Bad-Request-Error")
const UnauthorizedError = require("../Errors/UnAuthorized-Error")
const { check, validationResult } = require('express-validator');
const issueBacklogModel = require("../models/issueBacklogModel")


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

        if (req.body?.current_sprint === null && req.body.issue_status !== 4) {
            const findProjectId = await issueBacklogModel.find({ project_id: newIssue.project_id })
            if (findProjectId.length > 0) {
                const getIssueListInCurrentProject = findProjectId[0].issue_list
                getIssueListInCurrentProject.push(newIssue._id)
                await issueBacklogModel.updateOne({ project_id: newIssue.project_id }, { $set: { issue_list: [...getIssueListInCurrentProject] } })
            } else { //if still not exist, proceed to create new and add first issue into backlog
                const data = await new issueBacklogModel({ project_id: newIssue.project_id, issue_list: [newIssue._id] }).save()
            }
        }

        if (req.body?.current_sprint !== null) {
            await issuePublisher({ sprint_id: newIssue.current_sprint?.toString(), issue_id: newIssue._id.toString() }, 'issueInsertToSprint:created')
        }

        const issueCopy = {
            _id: newIssue._id,
            issue_priority: newIssue.issue_priority,
            project_id: newIssue.project_id,
            summary: newIssue.summary,
            issue_status: newIssue.issue_status,
            assignees: newIssue.assignees,
            creator: newIssue.creator,
            epic_link: newIssue.epic_link,
            fix_version: newIssue.fix_version,
            issue_type: newIssue.issue_type,
            ordinal_number: newIssue.ordinal_number,
            parent: newIssue.parent,
            sub_issue_list: newIssue.sub_issue_list,
            current_sprint: newIssue.current_sprint,
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