const express = require("express")
const currentUserMiddleware = require("../Middlewares/currentUser-Middleware")
const issueModel = require('../models/issueModel')
const issuePublisher = require("../nats/publisher/issue-publisher")
const UnauthorizedError = require("../Errors/UnAuthorized-Error")
const BadRequestError = require("../Errors/Bad-Request-Error")
const commentModel = require("../models/commentModel")
const router = express.Router()

router.put("/delete/assignee/:id", currentUserMiddleware, async (req, res, next) => {
    try {
        if (req.currentUser) {
            const { id } = req.params
            const issueIds = await issueModel.find({})
            const ids = issueIds.map(issue => issue._id.toString());
            if (!ids.includes(id)) {
                throw new BadRequestError("ID is invalid")
            }
            const currentIssue = await issueModel.findById(id).populate({ path: 'comments' })
                let listAssignees = currentIssue.assignees
                const index = listAssignees.findIndex(ele => ele.toString() === req.body.userId)
                if (index !== -1) {
                    listAssignees.splice(index, 1)
                    await issueModel.updateOne({ _id: id }, { $set: { assignees: listAssignees } })
                    const copyIssue = {
                        _id: currentIssue._id,
                        priority: currentIssue.priority,
                        shortSummary: currentIssue.shortSummary,
                        positionList: currentIssue.positionList,
                        issueType: currentIssue.issueType,
                        issueStatus: currentIssue.issueStatus,
                        assignees: currentIssue.assignees
                    }
                    //lấy ra các comment của assignee này trong issue
                    let listComments = currentIssue.comments

                    if (listComments.length > 0) {
                        listComments = listComments.filter(ele => {
                            return ele?.creator.toString() === req.body.userId
                        }).map(comment => comment._id)
                        
                        currentIssue.comments = currentIssue.comments.filter(comment => !listComments.some(c => c._id === comment._id))

                        await currentIssue.save()
                        //xoa cac comment cua issue
                        await commentModel.deleteMany({ _id: { $in: listComments } })
                        //publish su kien xoa cac comment trong comment service
                        issuePublisher(listComments, 'issue-comment:deleted')
                    }
                    issuePublisher(copyIssue, 'issue:updated')
                    return res.status(201).json({
                        message: "Successfully deleted user from this issue",
                        data: currentIssue
                    })
                } 
                throw new BadRequestError("User not found")
        } 
        throw new UnauthorizedError("Authentication failed")
    } catch (error) {
        next(error)
    }
})


module.exports = router;