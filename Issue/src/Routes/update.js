const express = require("express")
const currentUserMiddleware = require("../Middlewares/currentUser-Middleware")
const issueModel = require('../models/issueModel')
const issuePublisher = require("../nats/publisher/issue-publisher")
const BadRequestError = require("../Errors/Bad-Request-Error")
const UnauthorizedError = require("../Errors/UnAuthorized-Error")
const router = express.Router()

router.put("/update/:id", currentUserMiddleware, async (req, res, next) => {
    try {

        console.log("Du lieu duoc cap nhat ", req.body);
        if (req.currentUser) {
            const { id } = req.params
            const issueIds = await issueModel.find({})
            const ids = issueIds.map(issue => issue._id.toString());
            if (!ids.includes(id)) {
                throw new BadRequestError("Issue not found")
            } else {
                let currentIssue = await issueModel.findById(id)
                console.log("gia tri body ", req.body);
                

                //kiem tra xem assignees co duoc them vao hay khong
                let listAssignees = currentIssue.assignees
                if (req.body?.assignees != null) {
                    //check whether this user is already in this issue
                    if (listAssignees.includes(req.body.assignees)) {
                        throw new BadRequestError('User is already belonged to this project')
                    }
                    listAssignees = listAssignees.concat(req.body.assignees)
                    //them assignees moi vao danh sach neu duoc them vao    
                    req.body.assignees = listAssignees
                }
                //kiem xem timeSpent da ton tai hay chua, neu roi thi tien hanh cap nhat len
                var timeSpent = currentIssue.timeSpent

                if (req.body?.timeSpent) {
                    timeSpent += req.body.timeSpent
                    req.body.timeSpent = timeSpent
                }

                //add sprint has been compeleted into the old sprint
                if (req.body?.old_sprint) {
                    currentIssue.old_sprint.push(req.body.old_sprint)

                    req.body.old_sprint = [...currentIssue.old_sprint]
                }

                if (req.body?.sub_issue_id) {
                    if (!currentIssue.sub_issue_list.map(issue => issue?.toString()).includes(req.body.sub_issue_id)) {    //if sub issue does not exist, add it into list
                        currentIssue.sub_issue_list.push(req.body.sub_issue_id)
                        req.body.sub_issue_list = [...currentIssue.sub_issue_list]
                    } else {
                        const index = currentIssue.sub_issue_list.findIndex(issue => issue.toString() === req.body.sub_issue_id)
                        if (index !== -1) {
                            currentIssue.sub_issue_list.splice(index, 1)
                            req.body.sub_issue_list = [...currentIssue.sub_issue_list]
                        }
                    }
                    req.body.sub_issue_id = null
                }

                if (req.body?.voted_user_id) {
                    const votedUserList = [...currentIssue.voted]
                    const getIndexUser = votedUserList.findIndex(user => user.toString() === req.body.voted_user_id.toString())
                    if (getIndexUser !== -1) {
                        votedUserList.splice(getIndexUser, 1)
                    } else {
                        votedUserList.push(req.body.voted_user_id)
                    }

                    req.body.voted = [...votedUserList]
                    req.body.voted_user_id = null
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
                    sub_issue_list: currentIssue.sub_issue_list,
                    isFlagged: currentIssue.isFlagged,
                    ...req.body
                }

                console.log("Issue sau khi cap nhat ", copyIssue);


                // public su kien toi projectmanagement service
                await issuePublisher(copyIssue, 'issue:updated')

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