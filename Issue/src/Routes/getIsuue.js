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
                .populate({
                    path: 'current_sprint'
                })
                .populate({
                    path: 'epic_link'
                })
                .populate({
                    path: 'issue_type'
                })
                .populate({
                    path: 'project_id'
                })
                .populate({
                    path: 'fix_version',
                    select: '-__v'
                })
                .populate({
                    path: 'sub_issue_list',
                    populate: {
                        path: 'issue_type'
                    }
                })
                .populate({
                    path: 'sub_issue_list',
                    populate: {
                        path: 'parent'
                    }
                })
                
            console.log("issue lay ra ", issue);
            
            return res.status(200).json({
                message: "Successfully retrieve the issue",
                data: issue
            })
        } else {
            throw new BadRequestError("Issue not found")
        }
    } catch (error) {
        next(error)
    }
})

router.get("/issues/all", async (req, res) => {
    try {
        const issueList = await issueModel.find({})
            .populate({
                path: 'creator',
                select: '-__v'
            })
            .populate({
                path: 'assignees',
                select: '-__v'
            })
            .populate({
                path: 'current_sprint'
            })
            .populate({
                path: 'epic_link'
            })
            .populate({
                path: 'issue_type'
            })
            .populate({
                path: 'project_id'
            })
            .populate({
                path: 'sub_issue_list',
                populate: {
                    path: 'issue_type'
                }
            })

        return res.status(200).json({
            message: "Successfully retrieve the issue list",
            data: issueList
        })
    } catch (error) {
        console.log(error);
    }
})

router.post("/backlog/:projectId", async (req, res) => {
    try {
        const { projectId } = req.params
        var isSearchEpics = false
        var isSearchVersions = false
        var searchEpicsOrVersions = {}
        if (req.body?.epics) {
            if (req.body.epics?.length > 0) {
                isSearchEpics = true
            }
        }
        if (req.body?.versions) {
            if (req.body.versions?.length > 0) {
                isSearchVersions = true
            }
        }
        if (isSearchEpics && isSearchVersions) {
            searchEpicsOrVersions = {
                $and: [
                    { epic_link: { $in: req.body.epics } },
                    { fix_version: { $in: req.body.versions } },
                ]
            }
        } else if (isSearchEpics && !isSearchVersions) {
            searchEpicsOrVersions = {
                epic_link: { $in: req.body.epics }
            }
        } else if (!isSearchEpics && isSearchVersions) {
            searchEpicsOrVersions = {
                fix_version: { $in: req.body.versions }
            }
        } else {
            searchEpicsOrVersions = {}
        }
        if (req.body?.user_id) {
            searchEpicsOrVersions.$or = [
                { creator: req.body.user_id },
                { assignees: { $in: req.body.user_id } }
            ]
        }
        console.log("searchEpicsOrVersions ", searchEpicsOrVersions);

        const search = {
            $and: [
                { project_id: projectId },
                searchEpicsOrVersions
            ]
        }


        const getAllIssuesInProject = await issueModel.find(search)
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
                path: 'fix_version',
                select: '-__v'
            })
            .populate({
                path: 'issue_type',
                select: '-__v'
            })
            .populate({
                path: 'current_sprint'
            })
            .populate({
                path: 'project_id'
            })
            .populate({
                path: 'issue_type'
            })
            .populate({
                path: 'old_sprint'
            })
            .populate({
                path: 'sub_issue_list',
                populate: {
                    path: 'issue_type'
                }
            })
            .populate({
                path: 'sub_issue_list',
                populate: {
                    path: 'parent'
                }
            })
            .populate({
                path: 'sub_issue_list',
                populate: {
                    path: 'creator'
                }
            })

        // console.log("get all issue in this project", getAllIssuesInProject);
        
        if (getAllIssuesInProject.length !== 0) {
            return res.status(200).json({
                message: "successfully get all issues belonging to backlog",
                data: getAllIssuesInProject
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