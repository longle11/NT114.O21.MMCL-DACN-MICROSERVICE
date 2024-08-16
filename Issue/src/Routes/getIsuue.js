const express = require("express")
const currentUserMiddleware = require("../Middlewares/currentUser-Middleware")
const issueModel = require('../models/issueModel')
const BadRequestError = require("../Errors/Bad-Request-Error")
const userModel = require("../models/userModel")
const router = express.Router()

router.get("/:issueId", currentUserMiddleware, async (req, res, next) => {
    try {
        const { issueId } = req.params
        const issueIds = await issueModel.find({})
        const ids = issueIds.map(issue => issue._id.toString());
        if (ids.includes(issueId)) {
            const issue = await issueModel.findById(issueId)
                .populate({
                    path: 'creator',
                    select: '-__v'
                })
                .populate({
                    path: 'assignees',
                    select: '-__v'
                })
            return res.status(200).json({
                message: "Successfully retrieve the issue",
                data: issue
            })
        } else {
            throw new BadRequestError("Issue not found")
        }
    } catch (error) {
        console.log("error", error);
        next(error)
    }
})

router.get("/backlog/:projectId", async (req, res) => {
    try {
        const { projectId } = req.params
        
        const getAllIssuesInProject = await issueModel.find({ project_id: projectId })
            .populate({
                path: 'creator',
                select: '-__v'
            })
            .populate({
                path: 'assignees',
                select: '-__v'
            })
            .populate({
                path: 'epic_link',
                select: '-__v'
            })
            .populate({
                path: 'epic_link',
                select: '-__v'
            })
            .populate({
                path: 'fix_version',
                select: '-__v'
            })
        
        if (getAllIssuesInProject.length !== 0) {
            const getIssuesInBacklog = getAllIssuesInProject.filter(issue => {
                return issue.current_sprint === null
            })
            return res.status(200).json({
                message: "successfully get all issues belonging to backlog",
                data: getIssuesInBacklog
            })
        } else {
            return res.status(200).json({
                message: "No issues in backlog",
                data: getAllIssuesInProject
            })
        }
    } catch (error) {
        console.log(error)
    }
})

module.exports = router;