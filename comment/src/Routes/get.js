const express = require("express")
const commentModel = require("../models/commentModel")
const commentPublisher = require("../nats/comment-publisher")
const currentUserMiddleware = require("../Middlewares/currentUser-Middleware")
const UnauthorizedError = require("../Errors/UnAuthorized-Error")
const router = express.Router()


router.get("/all/:issueId/:valueSort", currentUserMiddleware, async (req, res, next) => {
    try {
        if (!req.currentUser) {
            throw new UnauthorizedError("Failed authentication")
        }
        const { issueId, valueSort } = req.params
        const getAllCommentsFollowIssueId = await commentModel.find({ issueId: issueId })
            .populate({
                path: 'creator'
            })
            .sort({ timeStamp: parseInt(valueSort) })

        return res.status(200).json({
            message: "Successfully got comment list",
            data: getAllCommentsFollowIssueId
        })
    } catch (error) {
        next(error)
    }
})
module.exports = router