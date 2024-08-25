import { Button, Tag, Avatar, Col, Switch, Checkbox, Row, Input, Select, Tooltip, Modal, InputNumber, Breadcrumb } from 'antd'
import Search from 'antd/es/input/Search'
import React, { useEffect, useState } from 'react'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { useDispatch, useSelector } from 'react-redux';
import { drawer_edit_form_action } from '../../../redux/actions/DrawerAction';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import './Backlog.css'
import { issueTypeWithoutOptions, iTagForIssueTypes, iTagForPriorities } from '../../../util/CommonFeatures';
import { createIssue, getInfoIssue, getIssuesBacklog, updateInfoIssue } from '../../../redux/actions/IssueAction';
import CreateEpic from '../../Forms/CreateEpic/CreateEpic';
import { getEpicList, getVersionList, updateEpic, updateVersion } from '../../../redux/actions/CategoryAction';
import { GetProcessListAction, GetProjectAction, GetSprintListAction } from '../../../redux/actions/ListProjectAction';
import { createSprintAction, deleteSprintAction, updateProjectAction, updateSprintAction } from '../../../redux/actions/CreateProjectAction';
import CreateSprint from '../../Forms/CreateSprint/CreateSprint';
import dayjs from 'dayjs';
import { GET_ISSUES_BACKLOG, GET_SPRINT_PROJECT } from '../../../redux/constants/constant';
import Axios from 'axios';
import domainName from '../../../util/Config';
import CreateVersion from '../../Forms/CreateVersion/CreateVersion';
export default function Backlog() {
    const [onChangeVersion, setOnChangeVersion] = useState(false)
    const [onChangeEpic, setOnChangeEpic] = useState(false)
    const issuesBacklog = useSelector(state => state.issue.issuesBacklog)
    const processList = useSelector(state => state.listProject.processList)
    const sprintList = useSelector(state => state.listProject.sprintList)
    const versionList = useSelector(state => state.categories.versionList)
    const projectInfo = useSelector(state => state.listProject.projectInfo)
    const workflowList = useSelector(state => state.listProject.workflowList)
    const dispatch = useDispatch()
    const onChange = (checkedValues) => {
        console.log('checked = ', checkedValues);
    };
    const [dropDownLeft, setDropDownLeft] = useState(false)
    const [currentSprint, setCurrentSprint] = useState({})
    const [open, setOpen] = useState(false);
    const navigate = useNavigate()

    //handle when deleting a sprint to move issues to other places
    const [getIssueToOtherPlaces, setGetIssueToOtherPlaces] = useState({
        old_stored_place: null,
        new_stored_place: 0 //mac dinh se luu tru vao backlog
    })

    //create default type for issue base on workflow's status
    const defaultForIssueType = (current_status) => {
        const getCurrentWorkflowsActive = workflowList.filter(workflow => workflow.isActivated)
        if (getCurrentWorkflowsActive !== null && getCurrentWorkflowsActive.length === 0) {
            //it means that doesn't have any workflow is applied so we will get the first value in process
            return processList[0]._id
        } else {
            //proceed to get workflow contains current_status
            const getWorkflow = getCurrentWorkflowsActive.filter(workflow => workflow.issue_statuses.includes(current_status))
            if (getWorkflow !== null && getWorkflow.length === 0) {  //although existing workflows, it doesn't contains this status
                return processList[0]._id
            } else {
                const edges = getWorkflow[0].edges
                //get the edge has souce id equal 0
                const getEdge = edges.filter(edge => edge.source === '0')
                //proceed link that destination of edges to default issue type
                
                return getEdge[0].target
            }
        }
    }

    const handleOk = async () => {
        if (getIssueToOtherPlaces.old_stored_place !== null) {
            if (getIssueToOtherPlaces.new_stored_place === 0) {
                const getIssueListInCurrentSprint = getIssueToOtherPlaces.old_stored_place.issue_list
                //proceed update current_sprint field to backlog in Issue service
                for (let index = 0; index < getIssueListInCurrentSprint.length; index++) {
                    dispatch(updateInfoIssue(getIssueListInCurrentSprint[index]._id.toString(), id, { current_sprint: null }, getIssueToOtherPlaces.old_stored_place.sprint_name, "backlog", userInfo.id, "updated", "sprint"))
                }
                //proceed delete all issues in current sprint
                dispatch(deleteSprintAction(getIssueToOtherPlaces.old_stored_place._id.toString(), id))
            } else if (getIssueToOtherPlaces.new_stored_place === 1) {
                const old_sprint_list = sprintList.map(sprint => sprint._id.toString())
                const old_sprint_name = getIssueToOtherPlaces.old_stored_place.sprint_name
                //proceed delete all issues in current sprint
                dispatch(deleteSprintAction(getIssueToOtherPlaces.old_stored_place._id.toString(), id))
                //proceed create new sprint and insert all issue from old sprint to new sprint
                const res = await Axios.post(`${domainName}/api/sprint/create`, { issue_list: getIssueToOtherPlaces.old_stored_place.issue_list, project_id: id })
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
                            dispatch(updateInfoIssue(newSprint.issue_list[index]._id.toString(), id, { current_sprint: newSprint._id.toString() }, old_sprint_name, newSprint.sprint_name, userInfo.id, "updated", "sprint"))
                        }
                    }
                }

            } else {

            }
        }

        setGetIssueToOtherPlaces({
            old_stored_place: null,
            new_stored_place: 0
        })
    };

    const handleCancel = () => {
        setOpen(false);
        setCurrentSprint({})
    };

    const renderStoredIssuePlace = (currentSprintId) => {
        var storedOptions = [
            {
                label: 'backlog',
                value: 0
            },
            {
                label: 'new sprint',
                value: 1
            }
        ]
        const sprintOptions = sprintList.filter(sprint => sprint._id.toString() !== currentSprintId).map(sprint => {
            return {
                label: sprint.sprint_name,
                value: sprint._id.toString()
            }
        })
        storedOptions = [...storedOptions, ...sprintOptions]
        return storedOptions
    }

    const epicList = useSelector(state => state.categories.epicList)
    useEffect(() => {
        dispatch(getIssuesBacklog(id))
        dispatch(getEpicList(id))
        dispatch(GetProcessListAction(id))
        dispatch(GetSprintListAction(id))
        dispatch(getVersionList(id))
        dispatch(GetProjectAction(id))
    }, [])
    const userInfo = useSelector(state => state.user.userInfo)
    const { id } = useParams()
    const [issueStatus, setIssueStatus] = useState(0)
    const [summary, setSummary] = useState('')
    const [openCreatingBacklog, setOpenCreatingBacklog] = useState(false)
    const [openCreatingSprint, setOpenCreatingSprint] = useState({
        id: null,
        open: false
    })


    const handleDragEnd = (result) => {
        const source = result.source
        const dest = result.destination
        if (dest === null) {
            return
        }
        console.log("source ", source);
        console.log("dest ", dest);
        if (source.droppableId === dest.droppableId) {
            const tempIssueBacklog = [...issuesBacklog.filter(issue => issue.current_sprint === null)]
            const temp = tempIssueBacklog[source.index]

            tempIssueBacklog[source.index] = tempIssueBacklog[dest.index]
            tempIssueBacklog[dest.index] = temp
            dispatch({
                type: GET_ISSUES_BACKLOG,
                issuesBacklog: tempIssueBacklog
            })
        }
        else if (source.droppableId.includes("backlog") && dest.droppableId.includes("sprint")) {
            //lay ra sprint hien tai 
            const getSprintId = dest.droppableId.substring(dest.droppableId.indexOf('-') + 1)
            const getIndexSprint = sprintList.findIndex(sprint => sprint._id.toString() === getSprintId)
            if (getIndexSprint !== -1) {
                const issue_id = issuesBacklog.filter(issue => issue.current_sprint === null)[source.index]._id.toString()
                const project_id = issuesBacklog.filter(issue => issue.current_sprint === null)[source.index].project_id.toString()
                dispatch(updateInfoIssue(issue_id, project_id, { current_sprint: getSprintId, }, "None", sprintList[getIndexSprint].sprint_name, userInfo.id, "updated", "sprint"))
                dispatch(updateSprintAction(getSprintId, { issue_id: issue_id, project_id: project_id }))
            }
        } else if (source.droppableId.includes("sprint") && dest.droppableId.includes("backlog")) {
            //get current sprint by cutting sprint text and only get id
            const getSprintId = source.droppableId.substring(source.droppableId.indexOf('-') + 1)

            //get the current position of sprint in the list
            const getIndexSprint = sprintList.findIndex(sprint => sprint._id.toString() === getSprintId)

            if (getIndexSprint !== -1) {
                const issue_id = sprintList[getIndexSprint].issue_list[source.index]._id.toString()
                dispatch(updateInfoIssue(issue_id, id, { current_sprint: null }, sprintList[getIndexSprint].sprint_name, "None", userInfo.id, "updated", "sprint"))
                dispatch(updateSprintAction(getSprintId, { issue_id: issue_id, project_id: id }))
            }
        } else if (source.droppableId.includes("sprint") && dest.droppableId.includes("sprint") && source.droppableId !== dest.droppableId) {
            const getSprintIdSource = source.droppableId.substring(source.droppableId.indexOf('-') + 1)
            const getSprintIdDest = dest.droppableId.substring(dest.droppableId.indexOf('-') + 1)

            //get the current position of sprint in the list
            const getIndexSprintSource = sprintList.findIndex(sprint => sprint._id.toString() === getSprintIdSource)
            const getIndexSprintDest = sprintList.findIndex(sprint => sprint._id.toString() === getSprintIdDest)

            if (getIndexSprintSource !== -1 && getIndexSprintDest !== -1) {
                const issueSource_id = sprintList[getIndexSprintSource].issue_list[source.index]._id.toString()
                dispatch(updateSprintAction(getSprintIdSource, { issue_id: issueSource_id, project_id: id }))
                dispatch(updateSprintAction(getSprintIdDest, { issue_id: issueSource_id, project_id: id }))
            }
        } else if (dest.droppableId.includes("epic") && source.droppableId.includes("backlog")) {
            const getEpicId = dest.droppableId.substring(dest.droppableId.indexOf('-') + 1)
            const getIndexEpic = epicList.findIndex(epic => epic._id.toString() === getEpicId)
            if (getIndexEpic !== -1) {
                const getCurrentIssue = issuesBacklog.filter(issue => issue.current_sprint === null)[source.index]
                const getEpicIdInIssue = getCurrentIssue.epic_link?._id.toString()
                const getEpicNameInIssue = getCurrentIssue.epic_link !== null ? getCurrentIssue.epic_link.epic_name : "None"
                //tien hanh them issue vao epic
                dispatch(updateEpic(epicList[getIndexEpic]._id.toString(), { issue_id: getCurrentIssue._id.toString(), epic_id: getEpicIdInIssue ? getEpicIdInIssue : "null" }, id))
                //tien hanh them id cua epic vao epic link trong issue
                dispatch(updateInfoIssue(getCurrentIssue._id.toString(), id, { epic_link: epicList[getIndexEpic]._id.toString() }, getEpicNameInIssue, epicList[getIndexEpic].epic_name, userInfo.id, "updated", "epic link"))
            }
        } else if (dest.droppableId.includes("epic") && source.droppableId.includes("sprint")) {
            const getSprintIdSource = source.droppableId.substring(source.droppableId.indexOf('-') + 1)
            const getEpicID = dest.droppableId.substring(dest.droppableId.indexOf('-') + 1)
            const getIndexSprintSource = sprintList.findIndex(sprint => sprint._id.toString() === getSprintIdSource)

            const getIndexEpic = epicList.findIndex(epic => epic._id.toString() === getEpicID)

            if (getIndexSprintSource !== -1 && getIndexEpic !== -1) {
                const getCurrentIssue = sprintList[getIndexSprintSource].issue_list[source.index]
                const getEpicIdInIssue = getCurrentIssue.epic_link?._id.toString()

                const getEpicNameInIssue = getCurrentIssue.epic_link !== null ? getCurrentIssue.epic_link.epic_name : "None"


                //tien hanh them issue vao epic
                dispatch(updateEpic(epicList[getIndexSprintSource]._id.toString(), { issue_id: getCurrentIssue._id.toString(), epic_id: getEpicIdInIssue ? getEpicIdInIssue : "null" }, id))
                //tien hanh them id cua epic vao epic link trong issue
                dispatch(updateInfoIssue(getCurrentIssue._id.toString(), id, { epic_link: epicList[getIndexEpic]._id.toString() }, getEpicNameInIssue, epicList[getIndexEpic].epic_name, userInfo.id, "updated", "epic link"))
            }
        } else if (dest.droppableId.includes("version") && source.droppableId.includes("backlog")) {
            const getVersionId = dest.droppableId.substring(dest.droppableId.indexOf('-') + 1)
            const getIndexVersion = versionList.findIndex(version => version._id.toString() === getVersionId)
            console.log("versionList ", versionList, " getIndexVersion ", getIndexVersion);

            if (getIndexVersion !== -1) {
                const getCurrentIssue = issuesBacklog.filter(issue => issue.current_sprint === null)[source.index]

                const getVersionIdInIssue = getCurrentIssue.fix_version?._id.toString()
                const getVersionNameInIssue = getCurrentIssue.fix_version !== null ? getCurrentIssue.fix_version.version_name : "None"
                //tien hanh them issue vao version
                dispatch(updateVersion(versionList[getIndexVersion]._id.toString(), { issue_id: getCurrentIssue._id.toString(), version_id: getVersionIdInIssue ? getVersionIdInIssue : "null" }, id))
                //tien hanh them id cua version vao version link trong issue
                dispatch(updateInfoIssue(getCurrentIssue._id.toString(), id, { fix_version: versionList[getIndexVersion]._id.toString() }, getVersionNameInIssue, versionList[getIndexVersion].version_name, userInfo.id, "updated", "version"))
            }
        } else if (dest.droppableId.includes("version") && source.droppableId.includes("sprint")) {
            const getSprintIdSource = source.droppableId.substring(source.droppableId.indexOf('-') + 1)
            const getVersionId = dest.droppableId.substring(dest.droppableId.indexOf('-') + 1)
            const getIndexSprintSource = sprintList.findIndex(sprint => sprint._id.toString() === getSprintIdSource)

            const getIndexVersion = sprintList.findIndex(sprint => sprint._id.toString() === getVersionId)

            if (getIndexSprintSource !== -1 && getIndexVersion !== -1) {
                const getCurrentIssue = sprintList[getIndexSprintSource].issue_list[source.index]
                const getVersionIdInIssue = getCurrentIssue.fix_version?._id.toString()

                const getVersionNameInIssue = getCurrentIssue.fix_version !== null ? getCurrentIssue.fix_version.version_name : "None"


                //tien hanh them issue vao version
                dispatch(updateVersion(versionList[getIndexSprintSource]._id.toString(), { issue_id: getCurrentIssue._id.toString(), version_id: getVersionIdInIssue ? getVersionIdInIssue : "null" }, id))
                //tien hanh them id cua version vao version link trong issue
                dispatch(updateInfoIssue(getCurrentIssue._id.toString(), id, { fix_version: versionList[getIndexVersion]._id.toString() }, getVersionNameInIssue, versionList[getIndexVersion].version_name, userInfo.id, "updated", "epic"))
            }
        }
    };
    const renderIssuesBacklog = () => {
        const issuesInBacklog = issuesBacklog?.filter(issue => issue?.current_sprint === null).map((issue, index) => {
            return <Draggable key={issue._id.toString()} index={index} draggableId={issue._id.toString()}>
                {(provided) => {
                    return <div
                        data-toggle="modal"
                        data-target="#infoModal"
                        ref={provided.innerRef}
                        {...provided.dragHandleProps}
                        {...provided.draggableProps}
                        key={issue._id.toString()}
                        onClick={() => {
                            dispatch(getInfoIssue(issue._id.toString()))
                        }}
                        className="issues-backlog-detail issue-info p-0">
                        <div style={{ cursor: 'pointer', borderBottom: '1px solid #ddd', padding: '5px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div className='content-issue-backlog'>
                                {iTagForIssueTypes(issue.issue_status)}
                                <span>{issue.summary}</span>
                            </div>
                            <div className='attach-issue-backlog d-flex align-items-center'>
                                {/* specify which components does issue belong to? */}
                                {issue.epic_link !== null ? <Tag color={issue.epic_link.tag_color}>{issue.epic_link.epic_name}</Tag> : <></>}
                                {/* specify which epics does issue belong to? */}
                                {issue.fix_version !== null ? <Tag className='ml-2' color={issue.fix_version.tag_color}>{issue.fix_version.version_name}</Tag> : <></>}
                                {/* Assigness */}
                                <div className='ml-2'>
                                    {/* <Avatar icon={<UserOutlined />} /> */}
                                    <Avatar src={issue.creator.avatar} />
                                </div>
                                {/* issue id */}
                                <span className='ml-2'>WD-{issue._id.toString()}</span>
                                {/* priority backlog */}
                                <span className='ml-2'>{iTagForPriorities(issue.issue_priority)}</span>
                                {/* Story points for issue Backlog */}
                                <span className='ml-2'>{issue.story_point !== null ? <Avatar size={20}><span className='d-flex' style={{ fontSize: 10 }}>{issue?.story_point}</span></Avatar> : <Avatar size={20}>-</Avatar>}</span>
                                <button
                                    className='ml-1 setting-issue btn btn-light'
                                    id="dropdownMenuButton"
                                    data-toggle="dropdown"
                                    aria-haspopup="true"
                                    aria-expanded="false"
                                    style={{ visibility: 'hidden' }}
                                    onClick={() => {
                                        setDropDownLeft(false)
                                    }}>
                                    <i className="fa fa-bars"></i>
                                </button >
                                <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                    <li style={{ padding: '5px 15px' }}>
                                        <div className='d-flex justify-content-between align-items-center'>
                                            <span style={{ marginRight: 20 }}>Move to</span>
                                            <i className="fa fa-angle-right" style={{ fontSize: 13 }}></i>
                                        </div>
                                        <ul className="dropdown-menu dropdown-submenu">
                                            {sprintList?.map(sprint => {
                                                return <li style={{ padding: '5px 15px' }}>{sprint.sprint_name}</li>
                                            })}
                                            <hr style={{ margin: '2px 0' }} />
                                            <li style={{ padding: '5px 15px' }}>Top of backlog</li>
                                            <li style={{ padding: '5px 15px' }}>Move up</li>
                                            <li style={{ padding: '5px 15px' }}>Move down</li>
                                            <li style={{ padding: '5px 15px' }}>Bottom of backlog</li>
                                        </ul>
                                    </li>
                                    <hr style={{ margin: '2px 0' }} />
                                    <li style={{ padding: '5px 15px' }}>Copy issue link</li>
                                    <hr style={{ margin: '2px 0' }} />
                                    <li style={{ padding: '5px 15px' }}>
                                        <div className='d-flex justify-content-between align-items-center'>
                                            <span style={{ marginRight: 20 }}>Assignee</span>
                                            <i className="fa fa-angle-right" style={{ fontSize: 13 }}></i>
                                        </div>
                                        <ul className="dropdown-menu dropdown-submenu">
                                            <li style={{ padding: '5px 15px' }}>
                                                <Search
                                                    placeholder="Search"
                                                    style={{
                                                        width: 200
                                                    }}
                                                />
                                            </li>
                                            <hr style={{ margin: '2px 0' }} />
                                            {/* dispay info members in project */}
                                        </ul>
                                    </li>
                                    <li style={{ padding: '5px 15px' }}>
                                        <div className='d-flex justify-content-between align-items-center'>
                                            <span style={{ marginRight: 20 }}>Story point estimate</span>
                                            <i className="fa fa-angle-right" style={{ fontSize: 13 }}></i>
                                        </div>
                                        <ul className="dropdown-menu dropdown-submenu">
                                            <li style={{ padding: '5px 15px' }}>
                                                <InputNumber min={1} max={100} />
                                            </li>
                                        </ul>
                                    </li>
                                    <hr style={{ margin: '2px 0' }} />
                                    <li style={{ padding: '5px 15px' }}>Delete</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                }}
            </Draggable>
        })
        if (issuesInBacklog.length !== 0) {
            return <Droppable droppableId="issues_backlog dropup">
                {(provided) => {
                    return <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        style={{ listStyle: 'none', padding: 0, border: '1px solid #ddd', height: 'fit-content', maxHeight: '200px', overflowY: 'auto', scrollbarWidth: 'none' }}>
                        {issuesInBacklog}
                        {provided.placeholder}
                    </div>
                }}
            </Droppable>
        }
        else {
            return <Droppable droppableId="issues_backlog">
                {(provided) => {
                    return <div ref={provided.innerRef}
                        {...provided.droppableProps}
                        style={{ padding: 0, border: '2px dashed #ddd', height: '60px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <p className='m-0'>Your backlog is empty</p>
                    </div>
                }}
            </Droppable>
        }
    }

    const renderSprintList = () => {
        if (sprintList === null) {
            return <></>
        }
        return sprintList?.map(sprint => {
            return <div className='issues-info-sprint m-0 mb-4' style={{ width: '100%', backgroundColor: '#f7f8f9' }}>
                <div className="d-flex justify-content-between align-items-center mb-1" style={{ padding: '5px 10px' }}>
                    <div
                        className='d-flex'
                        data-toggle="collapse"
                        data-target={`#issueSprintCollapse-${sprint._id.toString()}`}
                        aria-expanded="true"
                        aria-controls={`issueSprintCollapse-${sprint._id.toString()}`}>
                        <h6 className='m-0' style={{ lineHeight: '26px' }}>{sprint.sprint_name}</h6>
                        <button style={{ fontSize: '13px', margin: '0 5px' }} className="btn btn-transparent p-0" onClick={() => {
                            dispatch(drawer_edit_form_action(<CreateSprint currentSprint={sprint} />, 'Save', '700px'))
                        }}><i className="fa fa-pen ml-2"></i> Edit sprint</button>
                        <span className='ml-2' style={{ lineHeight: '26px' }}>{sprint.issue_list.length} issues</span>
                    </div>
                    <div className='d-flex align-items-center'>
                        <div className='mr-2'>
                            {processList?.map((process) => {
                                const countIssueProcess = sprint.issue_list.filter(issue => {
                                    return issue?.issue_type?.toString() === process._id.toString()
                                }).length
                                return <Tooltip placement="bottom" title={`${process.name_process[0] + process.name_process.toLowerCase().substring(1)} ${countIssueProcess} of ${sprint.issue_list.length} (issue count)`}>
                                    <Avatar size={'small'} style={{ backgroundColor: process.tag_color }}>{countIssueProcess}</Avatar>
                                </Tooltip>
                            })}
                        </div>
                        {sprint.issue_list.length !== 0 || projectInfo.sprint_id !== null? <button className='btn btn-primary' onClick={() => {
                            //allow to start sprint if no sprints are started and only when a sprint has start and end date
                            //with start date greater than or equal current day
                            if (sprint.start_date !== null && dayjs(sprint.start_date) >= dayjs(new Date())) {
                                dispatch(updateProjectAction(id, { sprint_id: sprint._id }, navigate))
                            }
                        }}>Start sprint</button> : <button className='btn btn-primary' disabled>Start sprint</button>}
                        {/* display drop down to select more options in current sprint */}
                        <div className='dropdown'>
                            <button
                                className='btn btn-transparent'
                                type="button" id="dropdownMenuButton"
                                data-toggle="dropdown"
                                aria-haspopup="true"
                                aria-expanded="true">
                                <i className="fa-sharp fa-solid fa-bars"></i>
                            </button>
                            <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                <button className="dropdown-item" onClick={() => {
                                    dispatch(drawer_edit_form_action(<CreateSprint currentSprint={sprint} />, 'Save', '700px'))
                                }}>Edit sprint</button>
                                <button className="dropdown-item" onClick={() => {
                                    if (sprint.issue_list.length === 0) {
                                        dispatch(deleteSprintAction(sprint._id.toString(), sprint.project_id.toString()))
                                    } else {
                                        setCurrentSprint(sprint)
                                        setOpen(true)
                                    }
                                }}>Delete Sprint</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div id={`issueSprintCollapse-${sprint._id.toString()}`} className='collapse show'>
                    <div className='sprint-info d-flex flex-column' style={{ padding: '5px 10px' }}>
                        {sprint.start_date !== null && sprint.end_date !== null ? <span><span style={{ fontWeight: 'bold' }}>Date: </span> {dayjs(sprint.start_date).format("DD/MM/YYYY hh:mm")} - {dayjs(sprint.end_date).format("DD/MM/YYYY hh:mm")}</span> : <></>}
                        {sprint.sprint_goal !== null ? <span><span style={{ fontWeight: 'bold' }}>Description: </span>{sprint.sprint_goal}</span> : <></>}
                    </div>

                    <Droppable droppableId={`sprint-${sprint._id.toString()}`} >
                        {(provided) => {
                            return <div ref={provided.innerRef} {...provided.droppableProps}>
                                {sprint.issue_list.length === 0 ? <div style={{ padding: 0, border: '2px dashed #ddd', height: sprint.issue_list.length > 1 ? 150 : 50, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    {sprint.issue_list.length === 1 ? <div className='description-sprint d-flex align-items-center'>
                                        <img src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1BtLhkORsgCvCDFhKq9ZQ0ICDjaxJAntxfA&s)' style={{ width: '50px', height: '50px' }} alt="sprint img" />
                                        <div className='description-text-sprint d-flex flex-column ml-2'>
                                            <span style={{ fontWeight: '700' }}>Plan your sprint</span>
                                            <span>Drag issues from the <b>Backlog</b> section, or create new issues, to plan the work for this sprint.<br /> Select <b>Start sprint</b> when you're ready</span>
                                        </div>
                                    </div> : <div className='description-sprint d-flex align-items-center'>
                                        <span>Plan a sprint by dragging the sprint footer down below some issues, or by dragging issues here</span>
                                    </div>}
                                </div> : <div className='issues-list-sprint'>
                                    {sprint.issue_list !== null ? sprint.issue_list?.map((issue, index) => {
                                        return <Draggable
                                            key={issue._id?.toString()}
                                            draggableId={issue._id?.toString()}
                                            index={index}>
                                            {(provided) => {
                                                return <div
                                                    className='issue-info'
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    onClick={() => {
                                                        dispatch(getInfoIssue(issue._id.toString()))
                                                    }}
                                                    data-toggle="modal"
                                                    data-target="#infoModal">
                                                    <div style={{ cursor: 'pointer', border: '1px solid #ddd', borderBottom: 'none', borderBottom: '1px solid #ddd', padding: '5px 20px', paddingRight: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <div className='content-issue-sprint'>
                                                            {iTagForIssueTypes(issue.issue_status)}
                                                            <span>{issue.summary}</span>
                                                        </div>
                                                        <div className='attach-issue-sprint d-flex align-items-center'>
                                                            {/* specify which components does issue belong to? */}
                                                            {issue.epic_link !== null ? <Tag color={issue?.epic_link?.tag_color}>{issue?.epic_link?.epic_name}</Tag> : <></>}
                                                            {/* specify which epics does issue belong to? */}
                                                            {issue.fix_version !== null ? <Tag className='ml-2' color={issue?.fix_version?.tag_color}>{issue?.fix_version?.version_name}</Tag> : <></>}
                                                            {/* Assigness */}
                                                            <div className='ml-2'>
                                                                {/* <Avatar icon={<UserOutlined />} /> */}
                                                                <Avatar src={issue?.creator?.avatar} />
                                                            </div>
                                                            {/* issue id */}
                                                            <span className='ml-2'>WD-{issue?._id?.toString()}</span>
                                                            {/* priority sprint */}
                                                            <span className='ml-2'>{iTagForPriorities(issue.issue_priority)}</span>
                                                            {/* Story points for issue sprint */}
                                                            <span className='ml-2'>{issue?.story_point !== null ? <Avatar size={20}><span className='d-flex' style={{ fontSize: 10 }}>{issue?.story_point}</span></Avatar> : <Avatar size={20}>-</Avatar>}</span>
                                                            <button
                                                                className='ml-1 setting-issue btn btn-light'
                                                                id="dropdownMenuButton"
                                                                data-toggle="dropdown"
                                                                aria-haspopup="true"
                                                                aria-expanded="false"
                                                                style={{ visibility: 'hidden' }}
                                                                onClick={() => {
                                                                    setDropDownLeft(false)
                                                                }}>
                                                                <i className="fa fa-bars"></i>
                                                            </button >
                                                            <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                                                <li style={{ padding: '5px 15px' }}>
                                                                    <div className='d-flex justify-content-between align-items-center'>
                                                                        <span style={{ marginRight: 20 }}>Move to</span>
                                                                        <i className="fa fa-angle-right" style={{ fontSize: 13 }}></i>
                                                                    </div>
                                                                    <ul className="dropdown-menu dropdown-submenu">
                                                                        {sprintList?.filter(sp => sp._id.toString() !== sprint._id.toString()).map(sprint => {
                                                                            return <li style={{ padding: '5px 15px' }}>{sprint.sprint_name}</li>
                                                                        })}
                                                                        <hr style={{ margin: '2px 0' }} />
                                                                        <li style={{ padding: '5px 15px' }}>Top of backlog</li>
                                                                        <li style={{ padding: '5px 15px' }}>Move up</li>
                                                                        <li style={{ padding: '5px 15px' }}>Move down</li>
                                                                        <li style={{ padding: '5px 15px' }}>Bottom of backlog</li>
                                                                    </ul>
                                                                </li>
                                                                <hr style={{ margin: '2px 0' }} />
                                                                <li style={{ padding: '5px 15px' }}>Copy issue link</li>
                                                                <hr style={{ margin: '2px 0' }} />
                                                                <li style={{ padding: '5px 15px' }}>
                                                                    <div className='d-flex justify-content-between align-items-center'>
                                                                        <span style={{ marginRight: 20 }}>Assignee</span>
                                                                        <i className="fa fa-angle-right" style={{ fontSize: 13 }}></i>
                                                                    </div>
                                                                    <ul className="dropdown-menu dropdown-submenu">
                                                                        <li style={{ padding: '5px 15px' }}>
                                                                            <Search
                                                                                placeholder="Search"
                                                                                style={{
                                                                                    width: 200
                                                                                }}
                                                                            />
                                                                        </li>
                                                                        <hr style={{ margin: '2px 0' }} />
                                                                        {/* dispay info members in project */}
                                                                    </ul>
                                                                </li>
                                                                <li style={{ padding: '5px 15px' }}>
                                                                    <div className='d-flex justify-content-between align-items-center'>
                                                                        <span style={{ marginRight: 20 }}>Story point estimate</span>
                                                                        <i className="fa fa-angle-right" style={{ fontSize: 13 }}></i>
                                                                    </div>
                                                                    <ul className="dropdown-menu dropdown-submenu">
                                                                        <li style={{ padding: '5px 15px' }}>
                                                                            <InputNumber min={1} max={100} />
                                                                        </li>
                                                                    </ul>
                                                                </li>
                                                                <hr style={{ margin: '2px 0' }} />
                                                                <li style={{ padding: '5px 15px' }}>Delete</li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                            }}
                                        </Draggable>
                                    }) : <></>}
                                </div>}
                                {provided.placeholder}
                            </div>
                        }}
                    </Droppable>

                    <button className='btn btn-transparent btn-create-issue' style={{ fontSize: '14px', color: '#ddd', display: openCreatingSprint.open && openCreatingSprint.id === sprint._id.toString() ? 'none' : 'block' }} onClick={() => {
                        setOpenCreatingSprint({
                            id: sprint._id.toString(),
                            open: true
                        })
                    }}>
                        <i className="fa-regular fa-plus mr-2"></i>
                        Create issue
                    </button>
                    {sprintList?.map(currentSprint => {
                        if (currentSprint._id.toString() === openCreatingSprint.id && openCreatingSprint.open && currentSprint._id.toString() === sprint._id.toString()) {
                            return <div className='d-flex' style={{ display: openCreatingSprint ? 'block' : 'none' }}>
                                <Select style={{ border: 'none', borderRadius: 0 }}
                                    defaultValue={issueTypeWithoutOptions[0].value}
                                    onChange={(value, option) => {
                                        setIssueStatus(value)
                                    }}

                                    options={issueTypeWithoutOptions} />
                                <Input placeholder="What need to be done?" onChange={(e) => {
                                    if(e.target.value.trim() !== "") {
                                        setSummary(e.target.value)
                                    }
                                }} onKeyUp={(e) => {
                                    if (e.key === "Enter") {
                                        if(summary.trim() !== "") {
                                            dispatch(createIssue({
                                                project_id: id,
                                                issue_status: issueStatus,
                                                summary: summary,
                                                creator: userInfo.id,
                                                issue_type: defaultForIssueType(issueStatus),
                                                current_sprint: currentSprint._id.toString()
                                            }, issuesBacklog, null, null, userInfo.id))
    
                                            //set default is 0 which means story
                                            setIssueStatus(0)
    
                                            //set value for summary to ''
                                            setSummary('')
                                        }
                                    }
                                }} onBlur={() => {
                                    setOpenCreatingSprint({
                                        id: null,
                                        open: false
                                    })
                                    setSummary('    ')
                                }} style={{ border: 'none', borderRadius: 0 }} />
                            </div>
                        }
                        return <></>
                    })}
                </div>
            </div>
        })
    }

    const renderVersionList = () => {
        const getVersions = versionList.map(version => {
            const versionTag = "collapse" + version._id.toString()
            const versionID = "#" + versionTag
            return <Droppable key={`version-${version._id.toString()}`} droppableId={`version-${version._id.toString()}`}>
                {(provided) => {
                    return <div
                        key={version._id.toString()}
                        style={{ border: '2px solid #aaa', borderRadius: '10px' }}
                        ref={provided.innerRef}
                        {...provided.droppableProps}>
                        <button style={{ width: '100%', textAlign: 'left', backgroundColor: version.tag_color }} className="btn btn-transparent" type="button" data-toggle="collapse" data-target={versionID} aria-expanded="false" aria-controls={versionTag}>
                            <i className="fa-solid fa-caret-down mr-3"></i>{version.version_name}
                        </button>
                        <div className="collapse" id={versionTag} style={{ padding: '5px 5px' }}>
                            <div className='d-flex flex-column'>
                                <div>
                                    <Input style={{ border: 0, height: 40, marginTop: 10, marginBottom: 10 }} defaultValue={version.description} disabled />
                                    <NavLink to={`/projectDetail/${id}/releases`}>Details</NavLink>
                                </div>
                                <hr style={{ width: '100%', height: 8 }} />
                                <div style={{ padding: '5px 10px' }}>
                                    <div>
                                        <div className='d-flex align-items-center justify-content-between' style={{ marginBottom: 10 }}>
                                            <span>Start Date</span>
                                            <Input style={{ width: 100 }} defaultValue={version.start_date} disabled />
                                        </div>
                                        <div className='d-flex align-items-center justify-content-between' style={{ marginBottom: 10 }}>
                                            <span>End Date</span>
                                            <Input style={{ width: 100 }} defaultValue={version.end_date} disabled />
                                        </div>
                                    </div>
                                    <div>
                                        <div className='d-flex align-items-center justify-content-between' style={{ marginBottom: 10 }}>
                                            <span>Issues </span>
                                            <div style={{ width: 100 }}>
                                                <Avatar size={20}><span style={{ fontSize: 13, display: 'flex' }}>{version?.issue_list?.length}</span></Avatar>
                                            </div>
                                        </div>
                                        <div className='d-flex align-items-center justify-content-between' style={{ marginBottom: 10 }}>
                                            <span>Completed </span>
                                            <div style={{ width: 100 }}>
                                                <Avatar size={20}><span style={{ fontSize: 13, display: 'flex' }}>{version?.issue_list?.length}</span></Avatar>
                                            </div>
                                        </div>
                                        <div className='d-flex align-items-center justify-content-between' style={{ marginBottom: 10 }}>
                                            <span>Unestimated</span>
                                            <div style={{ width: 100 }}>
                                                <Avatar size={20}><span style={{ fontSize: 13, display: 'flex' }}>{version?.issue_list?.filter(issue => issue.story_point === null).length}</span></Avatar>
                                            </div>
                                        </div>
                                        <div className='d-flex align-items-center justify-content-between' style={{ marginBottom: 10 }}>
                                            <span>Estimate</span>
                                            <div style={{ width: 100 }}>
                                                <Avatar size={20}><span style={{ fontSize: 13, display: 'flex' }}>{version?.issue_list?.filter(issue => issue.story_point !== null).length}</span></Avatar>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {provided.placeholder}
                    </div>
                }}
            </Droppable>
        })
        return <div>
            {getVersions}
        </div>
    }

    const renderEpicList = () => {
        const getEpics = epicList.map(epic => {
            const epicTag = "collapse" + epic._id.toString()
            const epicID = "#" + epicTag
            return <Droppable key={`epic-${epic._id.toString()}`} droppableId={`epic-${epic._id.toString()}`}>
                {(provided) => {
                    return <div
                        className='card'
                        key={epic._id.toString()}
                        ref={provided.innerRef}
                        {...provided.droppableProps}>
                        <button
                            style={{ width: '100%', textAlign: 'left', backgroundColor: epic.tag_color, borderRadius: 3 }}
                            className="btn btn-transparent"
                            type="button"
                            data-toggle="collapse"
                            data-target={epicID}
                            aria-expanded="false"
                            aria-controls={epicTag}>
                            <i className="fa-solid fa-caret-down mr-3"></i>{epic.epic_name}
                        </button>
                        <div className="collapse card-body" id={epicTag} style={{ padding: '5px 10px' }}>
                            <div className='d-flex flex-column'>
                                <div>
                                    <div className='d-flex align-items-center justify-content-between' style={{ marginBottom: 10 }}>
                                        <span>Issues </span>
                                        <div style={{ width: 100 }}>
                                            <Avatar size={20}><span style={{ fontSize: 13, display: 'flex' }}>{epic?.issue_list?.length}</span></Avatar>
                                        </div>
                                    </div>
                                    <div className='d-flex align-items-center justify-content-between' style={{ marginBottom: 10 }}>
                                        <span>Completed </span>
                                        <div style={{ width: 100 }}>
                                            <Avatar size={20}><span style={{ fontSize: 13, display: 'flex' }}>{epic?.issue_list?.length}</span></Avatar>
                                        </div>
                                    </div>
                                    <div className='d-flex align-items-center justify-content-between' style={{ marginBottom: 10 }}>
                                        <span>Unestimated</span>
                                        <div style={{ width: 100 }}>
                                            <Avatar size={20}><span style={{ fontSize: 13, display: 'flex' }}>{epic?.issue_list?.filter(issue => issue.story_point === null).length}</span></Avatar>
                                        </div>
                                    </div>
                                    <div className='d-flex align-items-center justify-content-between' style={{ marginBottom: 10 }}>
                                        <span>Estimate</span>
                                        <div style={{ width: 100 }}>
                                            <Avatar size={20}><span style={{ fontSize: 13, display: 'flex' }}>{epic?.issue_list?.filter(issue => issue.story_point !== null).length}</span></Avatar>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {provided.placeholder}
                    </div>
                }}
            </Droppable>
        })
        return <div>
            {getEpics}
        </div>
    }
    return (
        <div style={{ margin: '10px 40px' }}>
            <Breadcrumb
                style={{ marginBottom: 10 }}
                items={[
                    {
                        title: <a href="">Projects</a>,
                    },
                    {
                        title: <a href="">{projectInfo?.name_project}</a>,
                    }
                ]}
            />
            <div className='d-flex justify-content-between'>
                <h4>Backlog</h4>
                <div>
                    <Button type='primary' className='mr-2'>Share</Button>
                    <Button >Setting</Button>
                </div>
            </div>
            <div className="search-info-backlogs d-flex">
                <div className="search-block">
                    <Search
                        placeholder="input search text"
                        style={{ width: 200 }}
                        onSearch={value => {
                        }}
                    />
                </div>
                <div className="avatar-group d-flex">
                    {/* {projectInfo?.members?.map((value, index) => {
                        const table = <Table cols={memberCols} rowKey={value._id} dataSource={projectInfo?.members} />
                        return renderAvatarMembers(value, table)
                    })} */}
                </div>
                <Button type="primary" onClick={() => {
                    // setType(0)
                }} className=' ml-2 mr-2'>All issues</Button>
                <Button onClick={() => {
                    // setType(1)
                }}>Only my issues</Button>
                <div>
                    <Button className="mr-2 ml-2" type='primary' id="dropdownVersionButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        VERSIONS <i className="fa fa-angle-down ml-2"></i>
                    </Button>
                    <div className="dropdown-menu" aria-labelledby="dropdownVersionButton">
                        <p style={{ padding: '5px 20px' }}>Unreleased versions in this project</p>
                        <hr />
                        <div className='d-flex align-items-center' style={{ padding: '5px 20px' }}>
                            <Switch onChange={() => {
                                setOnChangeVersion(!onChangeVersion)
                            }} value={onChangeVersion} />
                            <span className='ml-3'>Show version panel</span>
                        </div>
                    </div>
                </div>
                <div>
                    <Button type='primary' id="dropdownEpicButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        Epics <i className="fa fa-angle-down ml-2"></i>
                    </Button>
                    <div className="dropdown-menu" aria-labelledby="dropdownEpicButton" style={{ width: 'fit-content' }}>
                        <Checkbox.Group style={{ width: 'fit-content' }} onChange={onChange}>
                            <Row>
                                {epicList?.map(epic => {
                                    return <Col span={16} style={{ padding: '5px 10px' }}>
                                        <Checkbox value={epic._id}>{epic.epic_name}</Checkbox>
                                    </Col>
                                })}
                            </Row>
                        </Checkbox.Group>
                        <hr />
                        <div className='d-flex align-items-center'>
                            <Switch onChange={() => {
                                setOnChangeEpic(!onChangeEpic)
                            }} value={onChangeEpic} />
                            <span className='mr-3'>Show epic panel</span>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <div className='main-info-backlog' style={{ minHeight: '200px', display: onChangeEpic || onChangeVersion ? 'flex' : 'block' }}>
                    <DragDropContext onDragEnd={(result) => {
                        handleDragEnd(result)
                    }}>
                        <div className="card version-info-backlog" style={{ width: '25rem', display: onChangeVersion ? 'block' : 'none', margin: '10px 0', height: 'fit-content' }}>
                            {versionList?.length !== 0 ? <div>
                                <button style={{ width: '100%', textAlign: 'left', border: '2px solid #aaa', borderRadius: '10px' }} className='btn btn-transparent'>Issue without version</button>
                                {renderVersionList()}
                                <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                    <div style={{ padding: '10px', display: 'flex', alignItems: 'center' }} className='version-footer'>
                                        <i className="fa fa-plus mr-2"></i>
                                        <NavLink style={{ width: '100%', textDecoration: 'none', display: 'block', color: 'black' }} to='#' onClick={() => {
                                            dispatch(drawer_edit_form_action(<CreateVersion />, 'Create', '760px'))
                                        }}>Create new versions</NavLink>
                                    </div>
                                    <div style={{ padding: '10px', display: 'flex', alignItems: 'center' }} className='version-footer'>
                                        <i className="fa fa-link mr-2"></i>
                                        <NavLink to={`/projectDetail/${id}/versions`} style={{ color: 'black', textDecoration: 'none' }}>Viewed linked pages</NavLink>
                                    </div>
                                </div>
                            </div> : <div style={{ height: 'fit-content' }}>
                                <div className='d-flex justify-content-between' style={{ padding: '5px 10px' }}>
                                    <h6 className='m-0'>Versions</h6>
                                    <i className="fa-solid fa-xmark" onClick={() => {
                                        setOnChangeVersion(!onChangeVersion)
                                    }}></i>
                                </div>
                                <div className="card-body d-flex flex-column justify-content-center">
                                    <img src="https://jira-frontend-bifrost.prod-east.frontend.public.atl-paas.net/assets/releases-80px.782fa98d.svg" />
                                    <p>Versions help you package and schedule project deliveries.</p>
                                    <p>Your unreleased versions will appear here so you can manage them directly from the backlog.</p>
                                </div>
                            </div>}
                        </div>

                        <div
                            className="card epic-info-backlog"
                            style={{ width: '25rem', display: onChangeEpic ? 'block' : 'none', margin: '10px 5px', height: 'fit-content', maxHeight: 500, overflowY: 'auto' }}>
                            <div className='d-flex justify-content-between' style={{ padding: '5px 10px' }}>
                                <h6>Epic</h6>
                                <i className="fa-solid fa-xmark" onClick={() => {
                                    setOnChangeEpic(!onChangeEpic)
                                }}></i>
                            </div>
                            <div className="card-body d-flex flex-column justify-content-center p-2">
                                <button style={{ width: '100%', textAlign: 'left', border: '1px solid #aaa', borderRadius: 3 }} className='btn btn-transparent'>Issue without epic</button>
                                {renderEpicList()}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                <div style={{ padding: '10px', display: 'flex', alignItems: 'center' }} className='epic-footer'>
                                    <i className="fa fa-plus mr-2"></i>
                                    <NavLink style={{ width: '100%', textDecoration: 'none', display: 'block', color: 'black' }} to='#' onClick={() => {
                                        dispatch(drawer_edit_form_action(<CreateEpic currentEpic={{ project_id: id, creator: userInfo.id, summary: '', epic_name: '' }} />, 'Create', '760px'))
                                    }}>Create issue in epic</NavLink>
                                </div>
                                <div style={{ padding: '10px', display: 'flex', alignItems: 'center' }} className='epic-footer'>
                                    <i className="fa fa-link mr-2"></i>
                                    <NavLink to={`/projectDetail/${id}/epics`} style={{ color: 'black', textDecoration: 'none' }}>Viewed linked pages</NavLink>
                                </div>
                            </div>
                        </div>

                        <div className='d-flex flex-column' style={{ width: '100%' }}>
                            {renderSprintList()}
                            <div className='issues-info-backlog' style={{ backgroundColor: '#f7f8f9' }}>
                                <div
                                    className="d-flex justify-content-between align-items-center mb-4"
                                    data-toggle="collapse" data-target="#issueBacklogCollapse"
                                    aria-expanded="false"
                                    aria-controls="issueBacklogCollapse"
                                    style={{ width: '100%', margin: '10px', padding: '5px 10px' }}>
                                    <h6 className='m-0'>Backlog <span>7 issues</span></h6>
                                    <div className='d-flex align-items-center'>
                                        <div className='mr-2'>
                                            {processList?.map((process) => {
                                                const countIssueProcess = issuesBacklog.filter(issue => {
                                                    return issue?.issue_type?.toString() === process._id.toString()
                                                }).length
                                                return <Tooltip placement="bottom" title={`${process.name_process[0] + process.name_process.toLowerCase().substring(1)} ${countIssueProcess} of ${issuesBacklog.length} (issue count)`}>
                                                    <Avatar size={'small'} style={{ backgroundColor: process.tag_color }}>{countIssueProcess}</Avatar>
                                                </Tooltip>
                                            })}
                                        </div>
                                        <button className='btn btn-primary' onClick={() => {
                                            dispatch(createSprintAction({
                                                project_id: id,
                                                sprint_name: null
                                            }))
                                        }}>Create sprint</button>
                                    </div>
                                </div>
                                <div id="issueBacklogCollapse" className='collapse show'>
                                    {renderIssuesBacklog()}
                                    {!openCreatingBacklog ? <button className='btn btn-transparent btn-create-issue' style={{ fontSize: '14px', color: '#ddd' }} onClick={() => {
                                        setOpenCreatingBacklog(true)
                                    }}>
                                        <i className="fa-regular fa-plus mr-2"></i>
                                        Create issue
                                    </button> : <div className='d-flex'>
                                        <Select style={{ border: 'none', borderRadius: 0 }}
                                            defaultValue={issueTypeWithoutOptions[0].value}
                                            onChange={(value, option) => {
                                                setIssueStatus(value)
                                            }}
                                            options={issueTypeWithoutOptions}
                                        />
                                        <Input placeholder="What need to be done?" onChange={(e) => {
                                            if(e.target.value.trim() !== "") {
                                                setSummary(e.target.value)
                                            }
                                        }} onKeyUp={(e) => {
                                            if(summary.trim() !== "") {
                                                if (e.key === "Enter") {
                                                    dispatch(createIssue({
                                                        project_id: id,
                                                        issue_status: issueStatus,
                                                        summary: summary,
                                                        creator: userInfo.id,
                                                        issue_type: defaultForIssueType(issueStatus),
                                                        current_sprint: null
                                                    }, issuesBacklog, null, null, userInfo.id))
                                                    //set default is 0 which means story
                                                    setIssueStatus(0)
                                                    setSummary('')
                                                }
                                            }
                                        }} onBlur={() => {
                                            setOpenCreatingBacklog(false)
                                            setSummary('')
                                        }} style={{ border: 'none', borderRadius: 0 }} />
                                    </div>}
                                </div>
                            </div>
                        </div>
                    </DragDropContext>
                </div>
            </div>
            <Modal
                open={open}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <div className='d-flex'>
                    <i className="glyphicon glyphicon-alert"></i>
                    <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Move issues from {currentSprint?.sprint_name}</span>
                </div>
                <p>Select a new home for any issues with the <span>{currentSprint?.sprint_name}</span> other sprints, including work in the backlog.</p>
                <div className='d-flex justify-content-between align-items-center'>
                    <div className='d-flex flex-column'>
                        <label htmlFor='currentProcess'>This status will be deleted:</label>
                        <div style={{ textDecoration: 'line-through', isplay: 'inline' }}>{currentSprint?.sprint_name}</div>
                    </div>
                    <i className="fa fa-long-arrow-alt-right"></i>
                    <div className='d-flex flex-column'>
                        <label htmlFor='newProcess?'>Move existing issues to:</label>
                        <Select
                            showSearch
                            optionFilterProp="label"
                            onChange={(value) => {
                                setGetIssueToOtherPlaces({
                                    old_stored_place: currentSprint,
                                    new_stored_place: value
                                })
                            }}
                            options={renderStoredIssuePlace(currentSprint?._id?.toString())}
                            defaultValue={renderStoredIssuePlace(currentSprint?._id?.toString())[0].value}
                        />
                    </div>
                </div>
            </Modal>
        </div>
    )
}
