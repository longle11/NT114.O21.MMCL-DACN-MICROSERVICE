const express = require("express")
const currentUserMiddleware = require("../Middlewares/currentUser-Middleware")
const issueModel = require('../models/issueModel')
const issuePublisher = require("../nats/publisher/issue-publisher")
const BadRequestError = require("../Errors/Bad-Request-Error")
const UnauthorizedError = require("../Errors/UnAuthorized-Error")
const router = express.Router()

router.put("/update/:id", currentUserMiddleware, async (req, res, next) => {
    try {
        if (req.currentUser) {
            const { id } = req.params
            console.log("req.body", req.body, "params ", id);
            
            const issueIds = await issueModel.find({})
            const ids = issueIds.map(issue => issue._id.toString());
            if (!ids.includes(id)) {
                throw new BadRequestError("Issue not found")
            } else {
                let currentIssue = await issueModel.findById(id)
                //kiem tra xem assignees co duoc them vao hay khong
                let listAssignees = currentIssue.assignees
                if (req.body.assignees != null) {
                    listAssignees = listAssignees.concat(req.body.assignees)
                    //them assignees moi vao danh sach neu duoc them vao    
                    req.body.assignees = listAssignees
                }
                //kiem xem timeSpent da ton tai hay chua, neu roi thi tien hanh cap nhat len
                var timeSpent = currentIssue.timeSpent
                console.log("req.body", req.body);
                
                if(req.body.timeSpent) {
                    timeSpent += req.body.timeSpent
                    req.body.timeSpent = timeSpent
                }
                currentIssue = { ...currentIssue._doc, ...req.body }
                console.log(currentIssue);
                
                await issueModel.updateOne({ _id: id }, currentIssue)
                
                // const copyIssue = {
                //     _id: currentIssue._id,
                //     issue_priority: currentIssue.issue_priority,
                //     shortSummary: currentIssue.shortSummary,
                //     issue_status: currentIssue.issue_status,
                //     assignees: currentIssue.assignees
                // }
                // //public su kien toi projectmanagement service
                // await issuePublisher(copyIssue, 'issue:updated')

                return res.status(200).json({
                    message: "Successfully updated this issue",
                    data: currentIssue
                })
            }
        } else {
            throw new UnauthorizedError("Authentication failed")
        }
    } catch (error) {
        next(error)
    }
})


module.exports = router;