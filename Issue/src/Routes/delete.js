const express = require("express")
const currentUserMiddleware = require("../Middlewares/currentUser-Middleware")
const issueModel = require('../models/issueModel')
const commentModel = require('../models/commentModel')
const issuePublisher = require('../nats/publisher/issue-publisher')
const UnauthorizedError = require("../Errors/UnAuthorized-Error")
const BadRequestError = require("../Errors/Bad-Request-Error")
const router = express.Router()

router.delete("/delete/:id", currentUserMiddleware, async (req, res, next) => {
    try {
        if (req.currentUser) {
            const { id } = req.params
            const issueIds = await issueModel.find({})
            const ids = issueIds.map(issue => issue._id.toString());
            if (ids.includes(id)) {
                const currentIssue = await issueModel.findById(id)
                await issueModel.deleteOne({ _id: id })

                //publish sự kiện để issue trong projectmanagement service
                await issuePublisher(currentIssue, "issue:deleted")

                if (currentIssue.comments.length > 0) {
                    //xoa cac comment cua issue
                    await commentModel.deleteMany({ _id: { $in: currentIssue.comments } })

                    //publish su kien xoa cac comment trong comment service
                    await issuePublisher(currentIssue.comments, 'issue-comment:deleted')
                }
                return res.status(200).json({
                    message: "Successfully deleted this issue"
                })
            } else {
                throw new BadRequestError("IDs is invalid")
            }

        } else {
            throw new UnauthorizedError("Authentication failed")
        }
    } catch (error) {
        next(error)
    }
})


module.exports = router;