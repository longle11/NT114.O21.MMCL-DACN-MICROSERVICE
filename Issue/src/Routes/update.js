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
            console.log("body ", req.body);
            
            const { id } = req.params
            const issueIds = await issueModel.find({})
            const ids = issueIds.map(issue => issue._id.toString());
            if (!ids.includes(id)) {
                throw new BadRequestError("Issue not found")
            } else {
                let currentIssue = await issueModel.findById(id)
                //kiem tra xem assignees co duoc them vao hay khong
                let listAssignees = currentIssue.assignees
                if (req.body.assignees != null) {
                    //check whether this user is already in this issue
                    if(listAssignees.includes(req.body.assignees)) {
                        throw new BadRequestError('User is already belonged to this project')
                    }
                    listAssignees = listAssignees.concat(req.body.assignees)
                    //them assignees moi vao danh sach neu duoc them vao    
                    req.body.assignees = listAssignees
                }
                //kiem xem timeSpent da ton tai hay chua, neu roi thi tien hanh cap nhat len
                var timeSpent = currentIssue.timeSpent

                if (req.body.timeSpent) {
                    timeSpent += req.body.timeSpent
                    req.body.timeSpent = timeSpent
                }

                //add sprint has been compeleted into the old sprint
                if(req.body?.old_sprint) {
                    currentIssue.old_sprint.push(req.body.old_sprint)

                    req.body.old_sprint = [...currentIssue.old_sprint]

                    console.log("thang ", currentIssue.summary, "co gia tri ", req.body.old_sprint);
                    
                }

                await issueModel.updateOne({ _id: id }, { $set: { ...req.body } })
                const copyIssue = {
                    _id: currentIssue._id,
                    summary: currentIssue.summary,
                    issue_status: currentIssue.issue_status,
                    issue_priority: currentIssue.issue_priority,
                    assignees: currentIssue.assignees,
                    epic_link: currentIssue.epic_link,
                    creator: currentIssue.creator,
                    fix_version: currentIssue.fix_version,
                    story_point: currentIssue.story_point,
                    issue_type: currentIssue.issue_type,
                    ...req.body
                }

                // public su kien toi projectmanagement service
                await issuePublisher(copyIssue, 'issue:updated')
                console.log("vao duoc tan ben trong nay roi", currentIssue);
                
                return res.status(200).json({
                    message: "Successfully updated this issue",
                    data: currentIssue
                })
            }
        } else {
            throw new UnauthorizedError("Authentication failed")
        }
    } catch (error) {
        console.log(error);

        next(error)
    }
})


module.exports = router;