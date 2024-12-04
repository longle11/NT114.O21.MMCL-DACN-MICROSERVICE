const express = require("express")
const currentUserMiddleware = require("../Middlewares/currentUser-Middleware")
const userModel = require("../models/users")
const { populate } = require("../models/issueModel")
const { model } = require("mongoose")

const router = express.Router()

router.get("/currentuser", currentUserMiddleware, async (req, res) => {
    let currentUser = null
    if (!req.currentUser) {
        req.session = null
        res.clearCookie("session")
    } else {
        const getUserInfo = await userModel.findById(req.currentUser)
            .populate({
                path: "assigned_issues.issue_id",
                model: 'issues',
                populate: [
                    {
                        path: 'creator',
                        model: 'users',
                        select: 'username avatar'
                    },
                    {
                        path: 'project_id',
                        model: 'projects'
                    }
                ]
            })
            .populate({
                path: "working_issues.issue_id",
                model: 'issues',
                populate: [
                    {
                        path: 'creator',
                        model: 'users',
                        select: 'username avatar'
                    },
                    {
                        path: 'project_id',
                        model: 'projects'
                    }
                ]
            })
            .populate({
                path: "viewed_issues.issue_id",
                model: 'issues',
                populate: [
                    {
                        path: 'creator',
                        model: 'users',
                        select: 'username avatar'
                    },
                    {
                        path: 'project_id',
                        model: 'projects'
                    }
                ]
            })
        if (getUserInfo !== null) {
            currentUser = {
                id: getUserInfo._id,
                username: getUserInfo.username,
                email: getUserInfo.email,
                avatar: getUserInfo.avatar,
                project_working: getUserInfo.project_working,
                viewed_issues: getUserInfo.viewed_issues,
                assigned_issues: getUserInfo.assigned_issues,
                working_issues: getUserInfo.working_issues,
            }
        }
    }
    res.status(200).json({ currentUser })
})
module.exports = router