const express = require("express")
const currentUserMiddleware = require("../Middlewares/currentUser-Middleware")
const issueModel = require('../models/issueModel')
const issuePublisher = require("../nats/publisher/issue-publisher")
const BadRequestError = require("../Errors/Bad-Request-Error")
const UnauthorizedError = require("../Errors/UnAuthorized-Error")
const { default: mongoose } = require("mongoose")
const issueBacklogModel = require("../models/issueBacklogModel")
const sprintModel = require("../models/sprintModel")
const issueProcessModel = require("../models/issueProcessModel")
const router = express.Router()

router.put("/update/:id", currentUserMiddleware, async (req, res, next) => {
    try {
        if (req.currentUser) {
            const { id } = req.params
            const issueIds = await issueModel.find({})
            const ids = issueIds.map(issue => issue._id.toString());
            if (!ids.includes(id)) {
                throw new BadRequestError("Issue not found")
            } else {
                let currentIssue = await issueModel.findById(id)
                //kiem xem timeSpent da ton tai hay chua, neu roi thi tien hanh cap nhat len

                const timeSpentIndex = currentIssue.issue_data_type_number.findIndex(field => field.field_key_issue === "timeSpent")
                if (timeSpentIndex !== -1 && typeof req.body.timeSpent === 'number') {
                    console.log("vao trong nay voi gia tri cu ", currentIssue.issue_data_type_number[timeSpentIndex].value);

                    currentIssue.issue_data_type_number[timeSpentIndex].value += req.body.timeSpent

                    console.log("vao trong nay voi gia tri moi nhat ", currentIssue.issue_data_type_number[timeSpentIndex].value);
                    req.body.issue_data_type_number = [...currentIssue.issue_data_type_number]
                }


                if (req.body?.start_date && req.body?.end_date) {
                    req.body.issue_data_type_string = [...currentIssue.issue_data_type_string]
                    const startDateIndex = currentIssue.issue_data_type_string.findIndex(field => field.field_key_issue === "start_date")
                    req.body.issue_data_type_string[startDateIndex].value = req.body.start_date
                    const endDateIndex = req.body.issue_data_type_string.findIndex(field => field.field_key_issue === "end_date")
                    req.body.issue_data_type_string[endDateIndex].value = req.body.end_date
                }

                if (req.body?.start_date) {
                    req.body.issue_data_type_string = [...currentIssue.issue_data_type_string]
                    const startDateIndex = currentIssue.issue_data_type_string.findIndex(field => field.field_key_issue === "start_date")
                    req.body.issue_data_type_string[startDateIndex].value = req.body.start_date
                }

                if (req.body?.end_date) {
                    req.body.issue_data_type_string = [...currentIssue.issue_data_type_string]
                    const endDateIndex = req.body.issue_data_type_string.findIndex(field => field.field_key_issue === "end_date")
                    req.body.issue_data_type_string[endDateIndex].value = req.body.end_date
                }

                //add sprint compeleted into the old sprint
                if (req.body?.old_sprint) {
                    req.body.issue_data_type_array_object = [...currentIssue.issue_data_type_array_object]
                    const oldSprintIndex = currentIssue.issue_data_type_string.findIndex(field => field.field_key_issue === "old_sprint")
                    req.body.issue_data_type_array_object[oldSprintIndex].value.push(req.body.old_sprint)
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


                //update all field type string format 
                const objects = Object.keys(req.body)
                for (let obj of objects) {
                    check = false
                    const stringfieldIndex = currentIssue.issue_data_type_string.findIndex(field => field.field_key_issue === obj)
                    if (stringfieldIndex !== -1) {
                        if (typeof req.body[obj] === 'boolean') {
                            currentIssue.issue_data_type_string[stringfieldIndex].pinned = req.body[obj]
                        } else {
                            currentIssue.issue_data_type_string[stringfieldIndex].value = req.body[obj]
                        }
                        req.body.issue_data_type_string = [...currentIssue.issue_data_type_string]
                        check = true
                    }
                    const numberfieldIndex = currentIssue.issue_data_type_number.findIndex(field => field.field_key_issue === obj)
                    if (numberfieldIndex !== -1 && currentIssue.issue_data_type_number[numberfieldIndex].field_key_issue !== 'timeSpent') {
                        if (typeof req.body[obj] === 'boolean') {
                            currentIssue.issue_data_type_number[numberfieldIndex].pinned = req.body[obj]
                        } else {
                            //this case will handle updated story point and sent event to report service and sprint started
                            const getCurrentSprintIndex = currentIssue.issue_data_type_object.findIndex(field => field.field_key_issue === 'current_sprint')
                            if (getCurrentSprintIndex !== -1) {
                                const sprintInfo = await sprintModel.findById(currentIssue.issue_data_type_object[getCurrentSprintIndex].value?.toString())
                                if (obj === 'story_point' && typeof currentIssue.issue_data_type_object[getCurrentSprintIndex].value?.toString() === 'string' && sprintInfo?.sprint_status === 'processing') {
                                    const getProcessesList = await issueProcessModel.find({ project_id: currentIssue.project_id })
                                    if (getProcessesList.length > 0) {
                                        const issueTypeIndex = currentIssue.issue_data_type_object.findIndex(field => field.field_key_issue === 'issue_type')
                                        if (issueTypeIndex !== -1) {
                                            if (getProcessesList.find(field => field._id?.toString() === currentIssue.issue_data_type_object[issueTypeIndex].value.toString())?.type_process !== 'done') {
                                                //get current story point
                                                const currentStoryPoint = currentIssue.issue_data_type_number[numberfieldIndex].value
                                                const updatedStoryPoint = req.body[obj]
                                                const type = {
                                                    sprint_id: currentIssue.issue_data_type_object[getCurrentSprintIndex].value?.toString(),
                                                    project_id: currentIssue.project_id,
                                                    current_time: new Date(),
                                                    issue_ordinal_number: currentIssue.ordinal_number,
                                                    issue_id: currentIssue._id,
                                                    event_type: "",
                                                    event_detail: "",
                                                    current_story_point: updatedStoryPoint,
                                                    increase: 0,
                                                    decrease: 0
                                                }
                                                //story point added after sprint started
                                                if (currentStoryPoint === null && typeof currentStoryPoint !== 'number') {
                                                    type.event_detail = `Estimate of ${updatedStoryPoint} added`
                                                    type.event_type = 'Scope Change'
                                                    type.increase = updatedStoryPoint
                                                    type.decrease = 0
                                                }
                                                else if (updatedStoryPoint > 0 && updatedStoryPoint < currentStoryPoint) {
                                                    type.event_detail = `Estimate changed from ${currentStoryPoint} to ${updatedStoryPoint}`
                                                    type.event_type = 'Scope Change'
                                                    type.increase = 0
                                                    type.decrease = currentStoryPoint - updatedStoryPoint
                                                }
                                                else if (currentStoryPoint < updatedStoryPoint) {
                                                    type.event_detail = `Estimate changed from ${currentStoryPoint} to ${updatedStoryPoint}`
                                                    type.event_type = 'Scope Change'
                                                    type.increase = updatedStoryPoint - currentStoryPoint
                                                    type.decrease = 0
                                                }
                                                await issuePublisher(type, "issue-story_point:updated")
                                            }
                                        }
                                    }
                                }
                            }

                            currentIssue.issue_data_type_number[numberfieldIndex].value = req.body[obj]
                        }
                        req.body.issue_data_type_number = [...currentIssue.issue_data_type_number]
                        check = true
                    }

                    const objectfieldIndex = currentIssue.issue_data_type_object.findIndex(field => field.field_key_issue === obj)
                    if (objectfieldIndex !== -1) {
                        if (typeof req.body[obj] === 'boolean') {
                            currentIssue.issue_data_type_object[objectfieldIndex].pinned = req.body[obj]
                        }
                        else {
                            // if (obj === 'current_sprint') {
                            //     const getIssuesBacklog = await issueBacklogModel.findOne({ project_id: currentIssue.project_id })
                            //     //check whether current user is existed in isssueBacklogModel or not
                            //     if (getIssuesBacklog) {
                            //         const tempList = [...getIssuesBacklog.issue_list]
                            //         if (!req.body[obj]) { //this value is null, means issue is removed from sprint to backlog
                            //             tempList.push(req.params.id)
                            //         } else if (!currentIssue.issue_data_type_object[objectfieldIndex].value) {
                            //             const index = tempList.findIndex(issue_id => issue_id.toString() === req.params.id.toString())
                            //             if (index !== -1) {
                            //                 tempList.splice(index, 1) //remove this isssue from backlog model
                            //             }
                            //         }
                            //         await issueBacklogModel.updateOne({ project_id: currentIssue.project_id }, { $set: { issue_list: [...tempList] } })
                            //     }

                            // }

                            currentIssue.issue_data_type_object[objectfieldIndex].value = req.body[obj]

                            //this case handles issue done
                            if (typeof req.body?.issue_type?.toString() === 'string') {
                                const getCurrentSprintIndex = currentIssue.issue_data_type_object.findIndex(field => field.field_key_issue === 'current_sprint')
                                if (getCurrentSprintIndex !== -1) {
                                    const getStoryPointIndex = currentIssue.issue_data_type_number.findIndex(field => field.field_key_issue === 'story_point')
                                    const sprintInfo = await sprintModel.findById(currentIssue.issue_data_type_object[getCurrentSprintIndex].value?.toString())
                                    if (sprintInfo?.sprint_status === 'processing') {
                                        const updatedStoryPoint = currentIssue.issue_data_type_number[getStoryPointIndex].value
                                        const type = {
                                            sprint_id: currentIssue.issue_data_type_object[getCurrentSprintIndex].value?.toString(),
                                            project_id: currentIssue.project_id,
                                            current_time: new Date(),
                                            issue_ordinal_number: currentIssue.ordinal_number,
                                            issue_id: currentIssue._id,
                                            event_type: "",
                                            event_detail: "",
                                            current_story_point: 0,
                                            increase: 0,
                                            decrease: 0
                                        }

                                        const getListProcesses = await issueProcessModel.find({ project_id: currentIssue.project_id })
                                        if (getListProcesses.length > 0) {
                                            const getCurrentProcess = getListProcesses.find(process => process._id.toString() === req.body?.issue_type?.toString())
                                            if (getCurrentProcess?.type_process === 'done') {
                                                type.event_type = "Burndown",
                                                    type.event_detail = "Issue Completed",
                                                    type.current_story_point = typeof updatedStoryPoint === 'number' ? updatedStoryPoint : 0,
                                                    type.increase = 0,
                                                    type.decrease = typeof updatedStoryPoint === 'number' ? updatedStoryPoint : 0
                                            } else {
                                                type.event_type = "Scope Change",
                                                    type.event_detail = "Issue Reopened",
                                                    type.current_story_point = typeof updatedStoryPoint === 'number' ? updatedStoryPoint : 0,
                                                    type.increase = typeof updatedStoryPoint === 'number' ? updatedStoryPoint : 0,
                                                    type.decrease = 0
                                            }
                                            await issuePublisher(type, "issue-story_point:updated")
                                        }
                                    }
                                }
                            }
                        }
                        req.body.issue_data_type_object = [...currentIssue.issue_data_type_object]
                        check = true
                    }

                    const arrayObjectFieldIndex = currentIssue.issue_data_type_array_object.findIndex(field => field.field_key_issue === obj)
                    if (arrayObjectFieldIndex !== -1) {
                        //kiem tra xem assignees co duoc them vao hay khong
                        if (req.body[obj] != null) {
                            //check whether this user is already in this issue
                            var tempData = currentIssue.issue_data_type_array_object[arrayObjectFieldIndex].value
                            tempData = tempData ? tempData : []

                            if (tempData.includes(req.body[obj])) {
                                throw new BadRequestError('This value is already belonged to this project')
                            }
                            currentIssue.issue_data_type_array_object[arrayObjectFieldIndex].value = tempData.concat(req.body[obj])
                            req.body.issue_data_type_array_object = [...currentIssue.issue_data_type_array_object]
                        }
                    }

                    if (check) {
                        delete req.body[obj]
                        delete req.body.pinned
                    }
                }

                await issueModel.updateOne({ _id: id }, { $set: { ...req.body } })

                const getUpdatedIssue = await issueModel.findById(req.params.id)

                const copyIssue = {
                    _id: getUpdatedIssue._id,
                    creator: getUpdatedIssue.creator,
                    sub_issue_list: getUpdatedIssue.sub_issue_list,
                    isFlagged: getUpdatedIssue.isFlagged,
                    issue_priority: getUpdatedIssue.issue_priority,
                    issue_data_type_number: getUpdatedIssue.issue_data_type_number,
                    issue_data_type_array: getUpdatedIssue.issue_data_type_array,
                    issue_data_type_string: getUpdatedIssue.issue_data_type_string,
                    issue_data_type_object: getUpdatedIssue.issue_data_type_object,
                    issue_data_type_array_object: getUpdatedIssue.issue_data_type_array_object,
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

//update many issues at the same times
router.post('/update/issues', async (req, res, next) => {
    try {
        const data = []
        for (let index = 0; index < req.body?.issue_list?.length; index++) {
            const getCurrentIssue = await issueModel.findById(req.body.issue_list[index])
            if (getCurrentIssue) {
                const getObjectIndex = getCurrentIssue.issue_data_type_object.findIndex(field => field.field_key_issue === 'issue_type')
                getCurrentIssue.issue_data_type_object[getObjectIndex].value = req.body.new_issue_type
                await getCurrentIssue.save()
                data.push(getCurrentIssue.issue_data_type_object)
            }
        }
        await issuePublisher({
            issue_list: req.body.issue_list,
            issue_data_type_object: data
        }, 'issue-many:updated')
        return res.status(200).json({
            message: "Successfully updated issue list",
            data: []
        })
    } catch (error) {
        next(error)
    }
})



module.exports = router;