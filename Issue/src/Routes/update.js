const express = require("express")
const currentUserMiddleware = require("../Middlewares/currentUser-Middleware")
const issueModel = require('../models/issueModel')
const issuePublisher = require("../nats/publisher/issue-publisher")
const BadRequestError = require("../Errors/Bad-Request-Error")
const UnauthorizedError = require("../Errors/UnAuthorized-Error")
const { default: mongoose } = require("mongoose")
const issueBacklogModel = require("../models/issueBacklogModel")
const router = express.Router()

router.put("/update/:id", currentUserMiddleware, async (req, res, next) => {
    try {
        if (req.currentUser) {
            const { id } = req.params
            const issueIds = await issueModel.find({})
            var updateDirectly = false
            const ids = issueIds.map(issue => issue._id.toString());
            if (!ids.includes(id)) {
                throw new BadRequestError("Issue not found")
            } else {
                let currentIssue = await issueModel.findById(id)
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

                if (req.body?.start_date && req.body?.end_date) {
                    req.body.start_date = new Date(req.body.start_date)
                    req.body.end_date = new Date(req.body.end_date)
                }

                if (req.body?.start_date) {
                    req.body.start_date = new Date(req.body.start_date)
                }

                if (req.body?.end_date) {
                    req.body.end_date = new Date(req.body.end_date)
                }

                //add sprint has been compeleted into the old sprint
                if (req.body?.old_sprint) {
                    currentIssue.old_sprint.push(req.body.old_sprint)

                    req.body.old_sprint = [...currentIssue.old_sprint]
                }

                //upload file in file uploaded
                if (req.body?.uploaded_file_id) {
                    const fileIndex = currentIssue.file_uploaded.findIndex(file => file.toString() === req.body.uploaded_file_id.toString())
                    if (fileIndex === -1) {
                        currentIssue.file_uploaded.push(new mongoose.Types.ObjectId(req.body.uploaded_file_id.toString()))
                    } else {
                        currentIssue.file_uploaded.splice(fileIndex, 1)
                    }
                    req.body.file_uploaded = [...currentIssue.file_uploaded]
                    req.body.uploaded_file_id = null
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

                if (!updateDirectly) {
                    await issueModel.updateOne({ _id: id }, { $set: { ...req.body } })
                }

                const getUpdatedIssue = await issueModel.findById(req.params.id)

                const copyIssue = {
                    _id: getUpdatedIssue._id,
                    summary: getUpdatedIssue.summary,
                    issue_status: getUpdatedIssue.issue_status,
                    issue_priority: getUpdatedIssue.issue_priority,
                    assignees: getUpdatedIssue.assignees,
                    epic_link: getUpdatedIssue.epic_link,
                    creator: getUpdatedIssue.creator,
                    fix_version: getUpdatedIssue.fix_version,
                    story_point: getUpdatedIssue.story_point,
                    issue_type: getUpdatedIssue.issue_type,
                    sub_issue_list: getUpdatedIssue.sub_issue_list,
                    isFlagged: getUpdatedIssue.isFlagged,
                    current_sprint: getUpdatedIssue.current_sprint,
                    ...req.body
                }


                // public su kien toi projectmanagement service
                await issuePublisher(copyIssue, 'issue:updated')

                return res.status(200).json({
                    message: "Successfully updated this issue",
                    data: getUpdatedIssue
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


router.post("/issue-backlog/:projectId", currentUserMiddleware, async (req, res, next) => {
    try {
        if (req.currentUser) {
            const { projectId } = req.params
            const currentIssuesBacklog = await issueBacklogModel.find({ project_id: projectId })
            if (currentIssuesBacklog.length > 0) {
                if (req.body?.issue_id) {
                    const index = currentIssuesBacklog[0].issue_list.findIndex(issue => issue.toString() === req.body?.issue_id?.toString())
                    if (index !== -1) {
                        if (req.body?.inserted_index === -1) {  //this case for delete issue from backlog
                            currentIssuesBacklog[0].issue_list.splice(index, 1)
                        } else {
                            currentIssuesBacklog[0].issue_list.splice(index, 1)
                            //delete issue from current position
                            currentIssuesBacklog[0].issue_list.splice(req.body.inserted_index, 0, req.body?.issue_id?.toString())
                        }
                    } else {
                        currentIssuesBacklog[0].issue_list.splice(req.body.inserted_index, 0, req.body?.issue_id?.toString())
                    }
                }
                if (typeof req.body?.issue_source_index === "number" && typeof req.body?.issue_dest_index === "number") {
                    [currentIssuesBacklog[0].issue_list[req.body?.issue_source_index], currentIssuesBacklog[0].issue_list[req.body?.issue_dest_index]] = [currentIssuesBacklog[0].issue_list[req.body?.issue_dest_index], currentIssuesBacklog[0].issue_list[req.body?.issue_source_index]]
                }

                const updatedIssue = await issueBacklogModel.findOneAndUpdate({ project_id: projectId }, { $set: { issue_list: currentIssuesBacklog[0].issue_list } })
                return res.status(200).json({
                    message: "Successfully updated this issue in backlog",
                    data: updatedIssue
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