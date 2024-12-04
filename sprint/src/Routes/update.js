const express = require('express')
const router = express.Router()
const sprintModel = require('../models/sprintModel');
const issueModel = require('../models/issueModel');
const servicePublisher = require('../nats/publisher/service-publisher');
router.put('/update/:sprintId', async (req, res, next) => {
    try {
        const getSprint = await sprintModel.findById(req.params.sprintId)
        if (req.body?.issue_list) {
            req.body.issue_list = getSprint.issue_list.concat(req.body.issue_list)
        }
        if (getSprint !== null) {
            if (req.body?.issue_id && typeof req.body?.inserted_index === 'number') {
                //find to see whether issue id is existed in sprint list or not 
                //if it existed, proceed delete it from the list, opposite insert that issue into the list
                const findIndex = getSprint.issue_list.findIndex(issue => issue._id.toString() === req.body.issue_id)
                if (findIndex === -1) { //this case for adding issue into sprint
                    getSprint.issue_list.splice(req.body?.inserted_index, 0, req.body.issue_id)
                    req.body.issue_list = getSprint.issue_list

                    //check whether sprint is in processing period or not 
                    //if yes => proceed to push value to burndownchart
                    if (getSprint.sprint_status === 'processing') {
                        const getCurrentIssue = await issueModel.findById(req.body.issue_id)
                        if (getCurrentIssue) {
                            const getStoryPointIndex = getCurrentIssue.issue_data_type_number.findIndex(field => field.field_key_issue === 'story_point')
                            const getStoryPoint = getCurrentIssue.issue_data_type_number[getStoryPointIndex].value
                            const type = {
                                sprint_id: getSprint._id,
                                project_id: getSprint.project_id,
                                current_time: new Date(),
                                issue_ordinal_number: getCurrentIssue.ordinal_number,
                                issue_id: getCurrentIssue._id,
                                event_type: "Scope Change",
                                event_detail: "Issue added to sprint",
                                current_story_point: getStoryPoint ? getStoryPoint : 0,
                                increase: getStoryPoint ? getStoryPoint : 0,
                                decrease: 0
                            }
                            await servicePublisher(type, "issue-story_point:updated")
                        }
                    }
                } else { //this case for removing issue from sprint
                    getSprint.issue_list.splice(parseInt(findIndex), 1)
                    req.body.issue_list = getSprint.issue_list

                    if (getSprint.sprint_status === 'processing') {
                        const getCurrentIssue = await issueModel.findById(req.body.issue_id)
                        if (getCurrentIssue) {
                            const getStoryPointIndex = getCurrentIssue.issue_data_type_number.findIndex(field => field.field_key_issue === 'story_point')
                            const getStoryPoint = getCurrentIssue.issue_data_type_number[getStoryPointIndex].value
                            const type = {
                                sprint_id: getSprint._id,
                                project_id: getSprint.project_id,
                                current_time: new Date(),
                                issue_ordinal_number: getCurrentIssue.ordinal_number,
                                issue_id: getCurrentIssue._id,
                                event_type: "Scope Change",
                                event_detail: "Issue removed from sprint",
                                current_story_point: getStoryPoint ? -getStoryPoint : 0,
                                increase: 0,
                                decrease: getStoryPoint ? getStoryPoint : 0
                            }
                            await servicePublisher(type, "issue-story_point:updated")
                        }
                    }
                }
                //thiet lap gia tri issue_id sang null de khong can chen vao danh sach
                req.body.issue_id = null
            }

            //this case for permutation the position of 2 issues
            if (typeof req.body?.issue_source_index === "number" && typeof req.body?.issue_dest_index === "number") {
                
                [getSprint.issue_list[req.body?.issue_source_index], getSprint.issue_list[req.body?.issue_dest_index]] = [getSprint.issue_list[req.body?.issue_dest_index], getSprint.issue_list[req.body?.issue_source_index]]
                req.body.issue_list = [...getSprint.issue_list]
                delete req.body.issue_source_index
                delete req.body.issue_dest_index
            }

            if (typeof req.body.sprint_status === 'string' && req.body.sprint_status === 'processing') {
                const getIssueListInfo = await issueModel.find({ _id: { $in: getSprint.issue_list } })
                const countStoryPoint = getIssueListInfo.reduce((accumulator, currentIssue) => {
                    const index = currentIssue.issue_data_type_number.findIndex(field => field.field_key_issue === 'story_point')
                    if (index !== -1 && typeof currentIssue.issue_data_type_number[index].value === 'number') {
                        return accumulator + currentIssue.issue_data_type_number[index].value
                    }
                    return accumulator
                }, 0)
                //this case for creating reporter
                const type = {
                    chart_name: getSprint.sprint_name,
                    project_id: getSprint.project_id,
                    sprint_id: getSprint._id,
                    start_date: getSprint.start_date,
                    end_date: getSprint.end_date,
                    total_issue: getSprint.issue_list.length,
                    current_story_point_remaining: 0,
                    total_story_point: countStoryPoint,
                    story_point_data: []
                }

                type.story_point_data = getIssueListInfo.map(issue => {
                    const index = issue.issue_data_type_number.findIndex(field => field.field_key_issue === 'story_point')
                    const value = issue.issue_data_type_number[index].value
                    const remaining = type.current_story_point_remaining + (typeof value === 'number' ? value : 0)
                    type.current_story_point_remaining = remaining
                    return {
                        current_time: new Date(),
                        issue_ordinal_number: issue.ordinal_number,
                        issue_id: issue._id,
                        event_type: "Sprint start",
                        event_detail: "",
                        current_story_point: value,
                        increase: typeof value === 'number' ? value : null,
                        decrease: 0,
                        remaining: remaining
                    }
                })

                await servicePublisher(type, "issue-burndown:created")
            }

            if (typeof req.body?.sprint_status === 'string' || typeof req.body?.sprint_name === 'string') {
                await servicePublisher({
                    sprint_id: req.params.sprintId,
                    sprint_status: req.body?.sprint_status ? req.body?.sprint_status : getSprint.sprint_status,
                    sprint_name: req.body?.sprint_name ? getSprint.sprint_name : req.body?.sprint_name
                }, "sprint:updated")
            }


            const data = await sprintModel.findByIdAndUpdate(req.params.sprintId, { $set: { ...req.body } })
            
            return res.status(200).json({
                message: "Successfully updated a sprint",
                data: data
            })
        }

    } catch (error) {
        console.log(error);
    }
})

module.exports = router
