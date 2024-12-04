const express = require("express")
const currentUserMiddleware = require("../Middlewares/currentUser-Middleware")
const issueModel = require('../models/issueModel')
const BadRequestError = require("../Errors/Bad-Request-Error")
const issueBacklogModel = require("../models/issueBacklogModel")
const issueProcessModel = require("../models/issueProcessModel")
const router = express.Router()

router.get("/:issueId", currentUserMiddleware, async (req, res, next) => {
    try {
        const { issueId } = req.params
        const issueIds = await issueModel.find({})
        const ids = issueIds.map(issue => issue._id.toString());
        if (ids.includes(issueId)) {
            const issue = await issueModel.findById(issueId)
                .populate({
                    path: 'issue_data_type_object',
                    populate: { path: 'value' }
                })
                .populate({
                    path: 'issue_data_type_array_object',
                    populate: { path: 'value' }
                })
                .populate({
                    path: 'project_id'
                })
                .populate({
                    path: 'creator'
                })
                .populate({
                    path: 'voted'
                })
                .populate({
                    path: 'sub_issue_list',
                    populate: [
                        {
                            path: "issue_data_type_object",
                            populate: { path: 'value' }
                        },
                        {
                            path: "issue_data_type_array_object",
                            populate: { path: 'value' }
                        },
                        {
                            path: 'creator'
                        }
                    ]
                })
            return res.status(200).json({
                message: "Successfully retrieve the issue",
                data: issue
            })
        } else {
            throw new BadRequestError("Issue not found")
        }
    } catch (error) {
        console.log("error ", error)
        next(error)
    }
})

router.get("/issues/all", async (req, res) => {
    try {
        const issueList = await issueModel.find({})
            .populate({
                path: 'issue_data_type_object',
                populate: { path: 'value' }
            })
            .populate({
                path: 'issue_data_type_array'
            })
            .populate({
                path: 'issue_data_type_array_object',
                populate: { path: 'value' }
            })
            .populate({
                path: 'project_id'
            })
            .populate({
                path: 'creator'
            })
            .populate({
                path: 'sub_issue_list',
                populate: [
                    {
                        path: "issue_data_type_object",
                        populate: { path: 'value' }
                    },
                    {
                        path: "issue_data_type_array_object",
                        populate: { path: 'value' }
                    },
                    {
                        path: 'creator'
                    }
                ]
            })
            .populate({
                path: 'voted'
            })
        return res.status(200).json({
            message: "Successfully retrieve the issue list",
            data: issueList
        })
    } catch (error) {
        console.log(error);
    }
})

router.post("/all-issues/:projectId", async (req, res) => {
    try {
        const { projectId } = req.params
        // var isSearchEpics = false
        // var isSearchVersions = false
        // var searchEpicsOrVersions = {}
        // if (req.body?.epics) {
        //     if (req.body.epics?.length > 0) {
        //         isSearchEpics = true
        //     }
        // }
        // if (req.body?.versions) {
        //     if (req.body.versions?.length > 0) {
        //         isSearchVersions = true
        //     }
        // }
        // if (isSearchEpics && isSearchVersions) {
        //     searchEpicsOrVersions = {
        //         $and: [
        //             { epic_link: { $in: req.body.epics } },
        //             { fix_version: { $in: req.body.versions } },
        //         ]
        //     }
        // } else if (isSearchEpics && !isSearchVersions) {
        //     searchEpicsOrVersions = {
        //         epic_link: { $in: req.body.epics }
        //     }
        // } else if (!isSearchEpics && isSearchVersions) {
        //     searchEpicsOrVersions = {
        //         fix_version: { $in: req.body.versions }
        //     }
        // } else {
        //     searchEpicsOrVersions = {}
        // }
        // if (req.body?.user_id) {
        //     searchEpicsOrVersions.$or = [
        //         { creator: req.body.user_id },
        //         { assignees: { $in: req.body.user_id } }
        //     ]
        // }

        // const search = {
        //     $and: [
        //         { project_id: projectId },
        //         searchEpicsOrVersions
        //     ]
        // }

        const search = { project_id: projectId }


        const getAllIssuesInProject = await issueModel.find(search)
            .populate({
                path: 'issue_data_type_object',
                populate: { path: 'value' }
            })
            .populate({
                path: 'issue_data_type_array_object',
                populate: { path: 'value' }
            })
            .populate({
                path: 'project_id'
            })
            .populate({
                path: 'creator'
            })
            .populate({
                path: 'sub_issue_list',
                populate: [
                    {
                        path: "issue_data_type_object",
                        populate: { path: 'value' }
                    },
                    {
                        path: "issue_data_type_array_object",
                        populate: { path: 'value' }
                    },
                    {
                        path: 'creator'
                    }
                ]
            })
            .populate({
                path: 'voted'
            })

        if (getAllIssuesInProject.length !== 0) {
            return res.status(200).json({
                message: "successfully get all issues belonging to project",
                data: getAllIssuesInProject
            })
        } else {
            return res.status(200).json({
                message: "No issues found",
                data: []
            })
        }
    } catch (error) {
        console.log(error)
    }
})

router.get("/backlog/:projectId", async (req, res) => {
    try {
        const { projectId } = req.params
        const getAllIssuesInProject = await issueBacklogModel.find({ project_id: projectId })
            .populate({
                path: 'issue_list',
                populate: [
                    {
                        path: "project_id"
                    },
                    {
                        path: "issue_data_type_object",
                        populate: { path: 'value' }
                    },
                    {
                        path: "issue_data_type_array_object",
                        populate: { path: 'value' }
                    },
                    {
                        path: "creator"
                    },
                    {
                        path: 'sub_issue_list',
                        populate: [
                            {
                                path: 'issue_data_type_array_object',
                                populate: { path: 'value' }
                            },
                            {
                                path: 'issue_data_type_object',
                                populate: { path: 'value' }
                            }
                        ]
                    }
                ]
            })

        if (getAllIssuesInProject.length !== 0) {
            return res.status(200).json({
                message: "successfully get all issues belonging to backlog",
                data: getAllIssuesInProject[0].issue_list
            })
        } else {
            return res.status(200).json({
                message: "No issues in backlog",
                data: []
            })
        }
    } catch (error) {
        console.log(error)
    }
})

module.exports = router;