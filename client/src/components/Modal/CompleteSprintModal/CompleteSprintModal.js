import { Select } from 'antd'
import React, { useEffect, useState } from 'react'
import { GET_SPRINT_PROJECT } from '../../../redux/constants/constant'
import { useDispatch } from 'react-redux'
import { handleClickOk, openModal } from '../../../redux/actions/ModalAction'
import { updateInfoIssue } from '../../../redux/actions/IssueAction'
import { updateProjectAction, updateSprintAction } from '../../../redux/actions/CreateProjectAction'
import Axios from 'axios'
import domainName from '../../../util/Config'
import { delay } from '../../../util/Delay'
import { useNavigate } from 'react-router-dom'

export default function CompleteSprintModal(props) {
    const sprintInfo = props.sprintInfo
    const processList = props.processList
    const projectInfo = props.projectInfo
    const sprintList = props.sprintList
    const userInfo = props.userInfo
    const id = props.id
    const [getIssueToOtherPlaces, setGetIssueToOtherPlaces] = useState({
        old_stored_place: null,
        new_stored_place: -1 //mac dinh se luu tru vao backlog
    })

    useEffect(() => {
        dispatch(handleClickOk(handleCompletingSprintOk))
    }, [getIssueToOtherPlaces])
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const handleCompletingSprintOk = async () => {
        if (getIssueToOtherPlaces.old_stored_place !== null && getIssueToOtherPlaces.new_stored_place !== -1) {
            const getIssuesCompleted = getIssueToOtherPlaces.old_stored_place.issue_list.filter(issue => {
                return issue.issue_type._id === processList[processList.length - 1]._id
            })
            const uncompletedIssueList = getIssueToOtherPlaces.old_stored_place.issue_list.filter(issue => issue.issue_type._id !== processList[processList.length - 1]._id)

            if (uncompletedIssueList.length !== 0) {
                if (getIssueToOtherPlaces.new_stored_place === 0) {
                    //proceed update uncompleted issues in current_sprint field to backlog in Issue service
                    for (let index = 0; index < uncompletedIssueList.length; index++) {
                        dispatch(updateInfoIssue(uncompletedIssueList[index]._id.toString(), id, { current_sprint: null, old_sprint: getIssueToOtherPlaces.old_stored_place._id }, getIssueToOtherPlaces.old_stored_place.sprint_name, "backlog", userInfo.id, "updated", "sprint"))
                        await delay(200)
                    }
                } else if (getIssueToOtherPlaces.new_stored_place === 1) {  //proceed to move all uncompleted issues from old sprint to new sprint
                    const old_sprint_list = sprintList.map(sprint => sprint._id.toString())
                    const old_sprint_name = getIssueToOtherPlaces.old_stored_place.sprint_name
                    //move status of this sprint to completed
                    //proceed create new sprint and insert all issue from old sprint to new sprint
                    const res = await Axios.post(`${domainName}/api/sprint/create`, { issue_list: uncompletedIssueList, project_id: id })
                    if (res.status === 201) {
                        dispatch({
                            type: GET_SPRINT_PROJECT,
                            sprintList: res.data.data
                        })

                        //get index of new sprint just created to update current_issue field in backlog
                        const getIndexOfNewSprint = res.data.data.findIndex(sprint => {
                            return !old_sprint_list.includes(sprint._id.toString())
                        })

                        if (getIndexOfNewSprint !== -1) {
                            for (let index = 0; index < res.data.data[getIndexOfNewSprint].issue_list.length; index++) {
                                const newSprint = res.data.data[getIndexOfNewSprint]
                                dispatch(updateInfoIssue(newSprint.issue_list[index]._id.toString(), id, { current_sprint: newSprint._id.toString(), old_sprint: getIssueToOtherPlaces.old_stored_place._id }, old_sprint_name, newSprint.sprint_name, userInfo.id, "updated", "sprint"))
                            }
                        }
                    }

                } else {    //move to other sprints
                    //proceed update current_sprint field to other sprints in Issue service
                    const getNewSprintInfo = sprintList.filter(sprint => sprint._id === getIssueToOtherPlaces.new_stored_place)
                    dispatch(updateSprintAction(getIssueToOtherPlaces.new_stored_place, { issue_list: uncompletedIssueList }))

                    for (let index = 0; index < uncompletedIssueList.length; index++) {
                        dispatch(updateInfoIssue(uncompletedIssueList[index]._id.toString(), id, { current_sprint: getIssueToOtherPlaces.new_stored_place, old_sprint: getIssueToOtherPlaces.old_stored_place._id }, getIssueToOtherPlaces.old_stored_place.sprint_name, getNewSprintInfo[0].sprint_name, userInfo.id, "updated", "sprint"))
                        await delay(300)
                    }
                }
            }

            dispatch(updateSprintAction(getIssueToOtherPlaces.old_stored_place._id.toString(), {
                sprint_status: "completed",
                completed_issue_list: [...getIssuesCompleted]
            }))
            //proceed marked "completed" for all completed issues
            for (let index = 0; index < getIssuesCompleted.length; index++) {
                console.log("vao trong nay nhe em trai");

                dispatch(updateInfoIssue(getIssuesCompleted[index]._id, projectInfo._id, { isCompleted: true }, getIssuesCompleted[index].issue_type.name_process, getIssuesCompleted[index].issue_type.name_process, userInfo.id, "Updated", "type"))
                await delay(300)
            }
            navigate(`/projectDetail/${id}/backlog`)
            dispatch(updateProjectAction(id, { sprint_id: null }, null))
            dispatch(openModal(false))
        }
        //proceed move to backlog page and delete this sprint out project and change it's status to "finished"
        setGetIssueToOtherPlaces({
            old_stored_place: null,
            new_stored_place: -1
        })

    };
    const optionsMoveUncompletedIssues = () => {
        const options = [
            {
                label: 'Backlog',
                value: 0
            },
            {
                label: 'New Sprint',
                value: 1
            }
        ]
        const getSprints = sprintList?.filter(sprint => sprint._id !== projectInfo?.sprint_id).map(sprint => {
            return {
                label: sprint.sprint_name,
                value: sprint._id.toString()
            }
        })

        return options.concat(getSprints)
    }

    return (
        <div>
            <h5>Complete sprint {sprintInfo?.sprint_name}</h5>
            <label htmlFor='uncompleted_issues'>Uncompleted issues:</label>
            <ul>
                {
                    processList?.filter(process => process.name_process.toLowerCase() !== "done").map(process => {
                        const countIssues = sprintInfo?.issue_list?.filter(issue => issue.issue_type._id === process._id).length
                        return <li>{countIssues} issues for <span style={{ fontWeight: 'bold' }}>{process?.name_process?.toLowerCase()}</span></li>
                    })
                }
            </ul>
            <label htmlFor='completed_issues'>Completed issues:</label>
            <ul>
                {
                    processList?.filter(process => process.name_process.toLowerCase() === "done").map(process => {
                        const countIssues = sprintInfo?.issue_list?.filter(issue => issue.issue_type._id === process._id).length
                        return <li>{countIssues} issues for <span style={{ fontWeight: 'bold' }}>{process?.name_process?.toLowerCase()}</span></li>
                    })
                }
            </ul>
            <div className='d-flex flex-column'>
                <label htmlFor='moveTaskTo'>Move uncompleted issues to</label>
                <Select
                    options={optionsMoveUncompletedIssues()}
                    onSelect={(value) => {
                        console.log("gia tri duoc lua chon ", sprintInfo);

                        setGetIssueToOtherPlaces({
                            old_stored_place: { ...sprintInfo },
                            new_stored_place: value
                        })
                    }}
                    style={{ width: '100%' }}
                />
            </div>
        </div>
    )
}
