const express = require("express")
const issueModel = require('../models/issueModel')
const currentUserMiddleware = require("../Middlewares/currentUser-Middleware")
const issuePublisher = require("../nats/publisher/issue-publisher")
const BadRequestError = require("../Errors/Bad-Request-Error")
const UnauthorizedError = require("../Errors/UnAuthorized-Error")
const { check, validationResult } = require('express-validator');
const issueBacklogModel = require("../models/issueBacklogModel")
const issueProcessModel = require("../models/issueProcessModel")
const router = express.Router()

const createOrdinalNumber = async (issue) => {
    var ordinalNumber = 0
    //generate the newest number for issue in ordinal number
    const getAllIssuesInProjectId = await issueModel.find({ project_id: issue.project_id })
    if (getAllIssuesInProjectId.length === 0) {
        ordinalNumber = 1
    } else {
        const ordinalNumberArrs = getAllIssuesInProjectId.map(issue => issue.ordinal_number)
        ordinalNumber = Math.max(...ordinalNumberArrs) + 1
    }

    return ordinalNumber
}

router.post("/create", async (req, res, next) => {
    try {
        const currentIssue = new issueModel({ ...req.body })

        currentIssue.ordinal_number = await createOrdinalNumber(req.body)

        await currentIssue.save()

        const currentSprintIndex = currentIssue.issue_data_type_object.findIndex(field => field.field_key_issue === "current_sprint")
        const issueStatusIndex = currentIssue.issue_data_type_number.findIndex(field => field.field_key_issue === "issue_status")

        if (currentSprintIndex !== -1 && issueStatusIndex !== -1 && currentIssue.issue_data_type_object[currentSprintIndex].value === null && currentIssue.issue_data_type_number[issueStatusIndex].value !== 4) {
            const findProjectId = await issueBacklogModel.find({ project_id: currentIssue.project_id })
            if (findProjectId.length > 0) {
                const getIssueListInCurrentProject = findProjectId[0].issue_list
                getIssueListInCurrentProject.push(currentIssue._id)
                await issueBacklogModel.updateOne({ project_id: currentIssue.project_id }, { $set: { issue_list: [...getIssueListInCurrentProject] } })

            } else { //if still not exist, proceed to create new and add first issue into backlog
                await new issueBacklogModel({ project_id: currentIssue.project_id, issue_list: [currentIssue._id] }).save()
            }
        }

        if (req.body.current_sprint !== null) {
            const currentSprintIndex = currentIssue.issue_data_type_object.findIndex(field => field.field_key_issue === "current_sprint")
            if (currentSprintIndex !== -1) {
                await issuePublisher({ sprint_id: currentIssue.issue_data_type_object[currentSprintIndex].toString(), issue_id: currentIssue._id.toString() }, 'issueInsertToSprint:created')
            }
        }

        const issueCopy = {
            _id: currentIssue._id,
            project_id: currentIssue.project_id,
            ordinal_number: currentIssue.ordinal_number,
            creator: currentIssue.creator,
            issue_priority: currentIssue.issue_priority,
            issue_data_type_number: currentIssue.issue_data_type_number,
            issue_data_type_array: currentIssue.issue_data_type_array,
            issue_data_type_string: currentIssue.issue_data_type_string,
            issue_data_type_object: currentIssue.issue_data_type_object,
            issue_data_type_array_object: currentIssue.issue_data_type_array_object
        }

        await issuePublisher(issueCopy, 'issue:created')

        // if (req.currentUser) {
        //     const issue = new issueModel(req.body)
        //     const currentIssue = await issue.save()

        //     const issueCopy = { 
        //         _id: currentIssue._id,
        //         issue_priority: currentIssue.issue_priority,
        //         summary: currentIssue.summary,
        //         issue_type: currentIssue.issue_type,
        //         assignees: currentIssue.assignees,
        //         creator: currentIssue.creator,
        //         epic_link: currentIssue.epic_link,
        //         fix_version: currentIssue.fix_version,
        //         issue_tpye: currentIssue.issue_type
        //     }
        //     console.log("public ban copy ", issueCopy);


        //     await issuePublisher(issueCopy, 'issue:created')

        //     return res.status(201).json({
        //         message: "Successfully created an issue",
        //         data: currentIssue
        //     })
        // } else {
        //     throw new UnauthorizedError("Authentication failed")
        // }

        return res.status(201).json({
            message: "Successfully created an issue",
            data: currentIssue
        })

    } catch (error) {
        console.log("error ", error);

        next(error)
    }
})

router.post('/import-issues', async (req, res, next) => {
    try {
        const newArrs = []
        for (let issue of req.body.data) {
            const currentIssue = new issueModel({ ...issue })

            currentIssue.ordinal_number = await createOrdinalNumber(issue)


            const currentSprintIndex = currentIssue.issue_data_type_object.findIndex(field => field.field_key_issue === "current_sprint")
            const issueStatusIndex = currentIssue.issue_data_type_number.findIndex(field => field.field_key_issue === "issue_status")
            const getIssueTypeIndex = currentIssue.issue_data_type_object.findIndex(field => field.field_key_issue === 'issue_type')
            console.log("getIssueTypeIndex ", getIssueTypeIndex);

            if (getIssueTypeIndex !== -1 && !currentIssue.issue_data_type_object[getIssueTypeIndex].value) {
                console.log("vap trong nay ");

                const processList = await issueProcessModel.find({ project_id: issue.project_id })
                console.log("vap trong nay processList ", processList);

                if (processList?.length > 0) {
                    currentIssue.issue_data_type_object[getIssueTypeIndex].value = processList[0]._id
                }
            }

            console.log("ra toi day ne");


            await currentIssue.save()

            if (currentSprintIndex !== -1 && issueStatusIndex !== -1 && currentIssue.issue_data_type_object[currentSprintIndex].value === null && currentIssue.issue_data_type_number[issueStatusIndex].value !== 4) {
                const findProjectId = await issueBacklogModel.find({ project_id: currentIssue.project_id })
                if (findProjectId.length > 0) {
                    const getIssueListInCurrentProject = findProjectId[0].issue_list
                    getIssueListInCurrentProject.push(currentIssue._id)
                    await issueBacklogModel.updateOne({ project_id: currentIssue.project_id }, { $set: { issue_list: [...getIssueListInCurrentProject] } })

                } else { //if still not exist, proceed to create new and add first issue into backlog
                    await new issueBacklogModel({ project_id: currentIssue.project_id, issue_list: [currentIssue._id] }).save()
                }
            }

            newArrs.push(currentIssue)

            const issueCopy = {
                _id: currentIssue._id,
                project_id: currentIssue.project_id,
                ordinal_number: currentIssue.ordinal_number,
                creator: currentIssue.creator,
                issue_priority: currentIssue.issue_priority,
                issue_data_type_number: currentIssue.issue_data_type_number,
                issue_data_type_array: currentIssue.issue_data_type_array,
                issue_data_type_string: currentIssue.issue_data_type_string,
                issue_data_type_object: currentIssue.issue_data_type_object,
                issue_data_type_array_object: currentIssue.issue_data_type_array_object
            }

            await issuePublisher(issueCopy, 'issue:created')
        }

        //attach issues belong to epic link
        const epic_list = []
        newArrs.forEach(issue => {
            const index = issue.issue_data_type_object.findIndex(field => field.field_key_issue === 'epic_link')
            if (index !== -1) {
                if (epic_list.length === 0) {
                    if (issue.issue_data_type_object[index].value) {
                        epic_list.push({
                            epic_id: issue.issue_data_type_object[index].value?.toString(),
                            issues: [issue._id]
                        })
                    }
                } else {
                    if (issue.issue_data_type_object[index].value) {
                        const index1 = epic_list.findIndex(field => field.epic_id?.toString() === issue.issue_data_type_object[index].value?.toString())
                        if (index1 !== -1) {
                            epic_list[index1].issues.push(issue._id)
                        } else {
                            epic_list.push({
                                epic_id: issue.issue_data_type_object[index].value?.toString(),
                                issues: [issue._id]
                            })
                        }
                    }
                }
            }
        })

        for (epic of epic_list) {
            await issuePublisher({
                epic_id: epic.epic_id,
                issues: epic.issues
            }, 'issues-epic:updated')
        }


        //attach issues belong to fix version
        const version_list = []
        newArrs.forEach(issue => {
            const index = issue.issue_data_type_object.findIndex(field => field.field_key_issue === 'fix_version')
            if (index !== -1) {
                if (version_list.length === 0) {
                    if (issue.issue_data_type_object[index].value) {
                        version_list.push({
                            version_id: issue.issue_data_type_object[index].value?.toString(),
                            issues: [issue._id]
                        })
                    }
                } else {
                    if (issue.issue_data_type_object[index].value) {
                        const index1 = version_list.findIndex(field => field.version_id?.toString() === issue.issue_data_type_object[index].value?.toString())
                        if (index1 !== -1) {
                            version_list[index1].issues.push(issue._id)
                        } else {
                            version_list.push({
                                version_id: issue.issue_data_type_object[index].value?.toString(),
                                issues: [issue._id]
                            })
                        }
                    }
                }
            }
        })

        for (version of version_list) {
            await issuePublisher({
                version_id: version.version_id,
                issues: version.issues
            }, 'issues-version:updated')
        }


        //attach issues belong to current_sprint
        const sprint_list = []
        newArrs.forEach(issue => {
            const index = issue.issue_data_type_object.findIndex(field => field.field_key_issue === 'current_sprint')
            if (index !== -1) {
                if (sprint_list.length === 0) {
                    if (issue.issue_data_type_object[index].value) {
                        sprint_list.push({
                            sprint_id: issue.issue_data_type_object[index].value?.toString(),
                            issues: [issue._id]
                        })
                    }
                } else {
                    if (typeof issue.issue_data_type_object[index].value?.toString() === 'string') {
                        const index1 = sprint_list.findIndex(field => field.sprint_id?.toString() === issue.issue_data_type_object[index].value?.toString())
                        if (index1 !== -1) {
                            sprint_list[index1].issues.push(issue._id)
                        } else {
                            sprint_list.push({
                                sprint_id: issue.issue_data_type_object[index].value?.toString(),
                                issues: [issue._id]
                            })
                        }
                    }
                }
            }
        })

        for (sprint of sprint_list) {
            await issuePublisher({
                sprint_id: sprint.sprint_id,
                issues: sprint.issues
            }, 'issues-sprint:updated')
        }

        return res.status(201).json({
            message: "Successfully created issues list",
            data: newArrs
        })
    } catch (error) {
        console.log("error ", error);
        next(error)
    }
})

module.exports = router;