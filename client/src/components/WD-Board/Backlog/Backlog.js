import { Button, Avatar, Col, Switch, Checkbox, Row, Input, Select, Tooltip, Modal, Breadcrumb } from 'antd'
import Search from 'antd/es/input/Search'
import React, { useEffect, useState } from 'react'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { useDispatch, useSelector } from 'react-redux';
import { drawer_edit_form_action } from '../../../redux/actions/DrawerAction';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import './Backlog.css'
import { defaultForIssueType, issueTypeWithoutOptions, iTagForIssueTypes } from '../../../util/CommonFeatures';
import { createIssue, updateIssueFromBacklog, getIssuesBacklog, getIssuesInProject, updateInfoIssue } from '../../../redux/actions/IssueAction';
import CreateEpic from '../../Forms/CreateEpic/CreateEpic';
import { getEpicList, getVersionList, updateEpic, updateVersion } from '../../../redux/actions/CategoryAction';
import { GetProcessListAction, GetProjectAction, GetSprintListAction } from '../../../redux/actions/ListProjectAction';
import { createSprintAction, deleteSprintAction, updateProjectAction, updateSprintAction } from '../../../redux/actions/CreateProjectAction';
import CreateSprint from '../../Forms/CreateSprint/CreateSprint';
import dayjs from 'dayjs';
import { GET_SPRINT_PROJECT } from '../../../redux/constants/constant';
import Axios from 'axios';
import domainName from '../../../util/Config';
import CreateVersion from '../../Forms/CreateVersion/CreateVersion';
import { showNotificationWithIcon } from '../../../util/NotificationUtil';
import { delay } from '../../../util/Delay';
import { displayComponentInModal } from '../../../redux/actions/ModalAction';
import CompleteSprintModal from '../../Modal/CompleteSprintModal/CompleteSprintModal';
import IssueTag from '../../../child-components/IssueTag/IssueTag';
export default function Backlog() {

    const issuesInProject = useSelector(state => state.issue.issuesInProject)
    const issuesBacklog = useSelector(state => state.issue.issuesBacklog)

    const processList = useSelector(state => state.listProject.processList)
    const sprintList = useSelector(state => state.listProject.sprintList)
    const versionList = useSelector(state => state.categories.versionList)
    const projectInfo = useSelector(state => state.listProject.projectInfo)
    const workflowList = useSelector(state => state.listProject.workflowList)
    const epicList = useSelector(state => state.categories.epicList)
    const [searchIssue, setSearchIssue] = useState({
        epics: [],
        versions: []
    })

    const [showCollapseBacklog, setShowCollapseBacklog] = useState(true)
    const [onChangeSettings, setOnChangeSettings] = useState(false)
    // distinguish with choose open epic and version panel
    const [onChangeVersion, setOnChangeVersion] = useState(true)
    const [onChangeEpic, setOnChangeEpic] = useState(true)

    //set display epic and version fields
    const [onChangeEpics, setOnChangeEpics] = useState(true)
    const [onChangeVersions, setOnChangeVersions] = useState(true)

    const [onChangeIssuePriority, setOnChangeIssuePriority] = useState(true)
    const [onChangeIssueStatus, setOnChangeIssueStatus] = useState(true)
    const [onChangeKey, setOnChangeKey] = useState(true)

    const [onChangeIssueType, setOnChangeIssueType] = useState(true)
    const [onChangeAssignees, setOnChangeAssignees] = useState(true)
    const [onChangeStoryPoint, setOnChangeStoryPoint] = useState(true)
    const [onChangeParent, setOnChangeParent] = useState(true)


    const [showCollapseSprint, setShowCollapseSprint] = useState({
        sprintArrs: [],
        curentSprintClicked: ''
    })

    //trigger collapse to show more info epic when user clicks to arrow down
    const [showEpic, setShowEpic] = useState(null)
    const [showVersion, setShowVersion] = useState(null)

    const [countEpic, setCountEpic] = useState(0)
    const [countVersion, setCountVersion] = useState(0)
    const userInfo = useSelector(state => state.user.userInfo)
    const { id } = useParams()
    const [issueStatus, setIssueStatus] = useState(0)
    const [summary, setSummary] = useState('')
    const [searchMyIssue, setSearchMyIssue] = useState(null)

    const [openCreatingSprint, setOpenCreatingSprint] = useState(null)


    const calculatePercentageForProgress = (record) => {
        return Math.round((record.issue_list?.filter(issue => {
            return issue.issue_type === processList[processList.length - 1]?._id
        })?.length / record.issue_list?.length) * 100)
    }

    const updateIssueConfig = (epic_panel, version_panel, issue_status_field, key_field, issue_type_field, epic_field, version_field, issue_priority_field, assignees_field, story_point_field, parent_field) => {
        dispatch(updateProjectAction(id, {
            issue_config: {
                epic_panel: epic_panel,
                version_panel: version_panel,
                issue_status_field: issue_status_field,
                key_field: key_field,
                issue_type_field: issue_type_field,
                epic_field: epic_field,
                version_field: version_field,
                issue_priority_field: issue_priority_field,
                assignees_field: assignees_field,
                story_point_field: story_point_field,
                parent_field: parent_field,
            }
        }, null))
    }

    const dispatch = useDispatch()
    useEffect(() => {
        if (id) {
            dispatch(getEpicList(id))
            dispatch(GetProcessListAction(id))
            dispatch(getVersionList(id))
            dispatch(getIssuesBacklog(id))
            dispatch(GetProjectAction(id, null, null))
            dispatch(GetSprintListAction(id, null))
            dispatch(getIssuesInProject(id, {
                user_id: searchMyIssue,
                epics: searchIssue.epics,
                versions: searchIssue.versions
            }))
        }
    }, [searchIssue, searchMyIssue])

    useEffect(() => {
        setOnChangeEpic(projectInfo?.issue_config?.epic_panel)
        setOnChangeVersion(projectInfo?.issue_config?.version_panel)

        setOnChangeEpics(projectInfo?.issue_config?.epic_field)
        setOnChangeVersions(projectInfo?.issue_config?.version_field)
        setOnChangeKey(projectInfo?.issue_config?.key_field)
        setOnChangeIssueStatus(projectInfo?.issue_config?.issue_status_field)
        setOnChangeIssuePriority(projectInfo?.issue_config?.issue_priority_field)
        setOnChangeIssueType(projectInfo?.issue_config?.issue_type_field)
        setOnChangeStoryPoint(projectInfo?.issue_config?.story_point_field)
        setOnChangeParent(projectInfo?.issue_config?.parent_field)
        setOnChangeAssignees(projectInfo?.issue_config?.assignees_field)
    }, [projectInfo])
    const [chooseEpic, setChooseEpic] = useState([])
    const [chooseVersion, setChooseVersion] = useState([])
    const [currentSprint, setCurrentSprint] = useState({})
    const [open, setOpen] = useState(false);
    const navigate = useNavigate()

    //handle when deleting a sprint to move issues to other places
    const [getIssueToOtherPlaces, setGetIssueToOtherPlaces] = useState({
        old_stored_place: null,
        new_stored_place: 0 //mac dinh se luu tru vao backlog
    })

    const renderIssuesInCurrentSprint = (issue_list) => {
        return issue_list?.filter(issue => {
            //find the issue belongs to issues in backlog
            if (issuesInProject?.map(currentIssue => currentIssue?._id).includes(issue?._id) && issue.issue_status !== 4 && !issue.isCompleted) {
                return true
            }
            return false
        })
    }


    //thanh phan chung voi dashboard trong complete sprint => se gom lai sau
    const handleOk = async () => {
        if (getIssueToOtherPlaces.old_stored_place !== null) {
            if (getIssueToOtherPlaces.new_stored_place === 0) {
                const getIssueListInCurrentSprint = getIssueToOtherPlaces.old_stored_place.issue_list
                // proceed update current_sprint field to backlog in Issue service
                for (let index = 0; index < getIssueListInCurrentSprint.length; index++) {
                    dispatch(updateInfoIssue(
                        getIssueListInCurrentSprint[index]._id.toString(), 
                        id, 
                        { current_sprint: null }, 
                        getIssueToOtherPlaces.old_stored_place.sprint_name, 
                        "backlog", 
                        userInfo.id, 
                        "updated", 
                        "sprint", projectInfo, userInfo
                    ))
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
                            dispatch(updateInfoIssue(newSprint.issue_list[index]._id.toString(), id, { current_sprint: newSprint._id.toString() }, old_sprint_name, newSprint.sprint_name, userInfo.id, "updated", "sprint", projectInfo, userInfo))
                        }
                    }
                }

            } else {    //move to other sprints
                const getIssueListInCurrentSprint = getIssueToOtherPlaces.old_stored_place.issue_list
                //proceed update current_sprint field to other sprints in Issue service
                const getNewSprintInfo = sprintList.filter(sprint => sprint._id === getIssueToOtherPlaces.new_stored_place)
                for (let index = 0; index < getIssueListInCurrentSprint.length; index++) {
                    await delay(100)
                    dispatch(updateSprintAction(getIssueToOtherPlaces.new_stored_place, { issue_id: getIssueListInCurrentSprint[index]._id.toString() }))
                }
                for (let index = 0; index < getIssueListInCurrentSprint.length; index++) {
                    dispatch(updateInfoIssue(getIssueListInCurrentSprint[index]._id.toString(), id, { current_sprint: getIssueToOtherPlaces.new_stored_place }, getIssueToOtherPlaces.old_stored_place.sprint_name, getNewSprintInfo[0].sprint_name, userInfo.id, "updated", "sprint", projectInfo, userInfo))
                }

                // //proceed delete all issues in current sprint
                dispatch(deleteSprintAction(getIssueToOtherPlaces.old_stored_place._id.toString(), id))
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
        const sprintOptions = sprintList?.filter(sprint => sprint._id.toString() !== currentSprintId).map(sprint => {
            return {
                label: sprint.sprint_name,
                value: sprint._id.toString()
            }
        })
        storedOptions = [...storedOptions, ...sprintOptions]
        return storedOptions
    }




    const handleDragEnd = (result) => {
        const source = result.source
        const dest = result.destination
        if (dest === null) {
            return
        }
        console.log("source ", source);
        console.log("dest ", dest);
        if (source.droppableId === dest.droppableId) {
            if (source.index !== dest.index) {
                //check whether name is backlog or sprint
                if (dest.droppableId.indexOf('-') === -1) { //this is backlog
                    dispatch(updateIssueFromBacklog(id, { issue_source_index: source.index, issue_dest_index: dest.index }))
                } else {
                    const getSprintId = source.droppableId.substring(source.droppableId.indexOf('-') + 1)
                    if (typeof getSprintId === "string") {
                        //proceed to swap position between two issues in current sprint
                        dispatch(updateSprintAction(getSprintId, { issue_source_index: source.index, issue_dest_index: dest.index }))
                    }
                }
            }else {
                return null
            }
        }
        else if (source.droppableId.includes("backlog") && dest.droppableId.includes("sprint")) {
            //lay ra sprint hien tai 
            const getSprintId = dest.droppableId.substring(dest.droppableId.indexOf('-') + 1)
            const getIndexSprint = sprintList.findIndex(sprint => sprint._id.toString() === getSprintId)
            if (getIndexSprint !== -1) {
                const issue_id = issuesBacklog[source.index]?._id?.toString()
                if (typeof issue_id === "string" && typeof getSprintId === "string") {
                    dispatch(updateInfoIssue(issue_id, id, { current_sprint: getSprintId }, "None", sprintList[getIndexSprint].sprint_name, userInfo.id, "updated", "sprint", projectInfo, userInfo))
                    //proceed to delete current issue in backlog 
                    dispatch(updateIssueFromBacklog(id, { issue_id: issue_id, inserted_index: -1 }))
                    dispatch(updateSprintAction(getSprintId, { issue_id: issue_id, project_id: id, inserted_index: dest.index }))
                }
            }
        } else if (source.droppableId.includes("sprint") && dest.droppableId.includes("backlog")) {
            //get current sprint by cutting sprint text and only get id
            const getSprintId = source.droppableId.substring(source.droppableId.indexOf('-') + 1)

            //get the current position of sprint in the list
            const getIndexSprint = sprintList.findIndex(sprint => sprint._id.toString() === getSprintId)

            if (getIndexSprint !== -1) {
                const issue_id = sprintList[getIndexSprint].issue_list[source.index]._id.toString()
                dispatch(updateInfoIssue(issue_id, id, { current_sprint: null }, sprintList[getIndexSprint].sprint_name, "None", userInfo.id, "updated", "sprint", projectInfo, userInfo))
                dispatch(updateSprintAction(getSprintId, { issue_id: issue_id, project_id: id, inserted_index: 0 }))    //this inserted_index is meaningless, only for satisfying the condition 

                dispatch(updateIssueFromBacklog(id, { inserted_index: dest.index, issue_id: issue_id }))
            }
        } else if (source.droppableId.includes("sprint") && dest.droppableId.includes("sprint") && source.droppableId !== dest.droppableId) {
            const getSprintIdSource = source.droppableId.substring(source.droppableId.indexOf('-') + 1)
            const getSprintIdDest = dest.droppableId.substring(dest.droppableId.indexOf('-') + 1)

            //get the current position of sprint in the list
            const getIndexSprintSource = sprintList.findIndex(sprint => sprint._id.toString() === getSprintIdSource)
            const getIndexSprintDest = sprintList.findIndex(sprint => sprint._id.toString() === getSprintIdDest)

            if (getIndexSprintSource !== -1 && getIndexSprintDest !== -1) {
                const issueSource_id = sprintList[getIndexSprintSource].issue_list[source.index]._id.toString()
                dispatch(updateSprintAction(getSprintIdSource, { issue_id: issueSource_id, project_id: id, inserted_index: source.index })) //this case for delete issue from current sprint, //this inserted_index is meaningless, only for satisfying the condition 
                dispatch(updateSprintAction(getSprintIdDest, { issue_id: issueSource_id, project_id: id, inserted_index: dest.index })) //this case for add issue to new sprint
            }
        } else if (dest.droppableId.includes("epic") && source.droppableId.includes("backlog")) {
            const getEpicId = dest.droppableId.substring(dest.droppableId.indexOf('-') + 1)
            const getIndexEpic = epicList.findIndex(epic => epic._id.toString() === getEpicId)
            if (getIndexEpic !== -1) {
                const getCurrentIssue = issuesInProject[source.index]
                const getEpicIdInIssue = getCurrentIssue.epic_link?._id.toString()
                const getEpicNameInIssue = getCurrentIssue.epic_link !== null ? getCurrentIssue.epic_link.epic_name : "None"
                //tien hanh them issue vao epic
                dispatch(updateEpic(epicList[getIndexEpic]._id.toString(), { issue_id: getCurrentIssue._id.toString(), epic_id: getEpicIdInIssue ? getEpicIdInIssue : null }, id))
                //tien hanh them id cua epic vao epic link trong issue
                dispatch(updateInfoIssue(getCurrentIssue._id.toString(), id, { epic_link: epicList[getIndexEpic]._id.toString() }, getEpicNameInIssue, epicList[getIndexEpic].epic_name, userInfo.id, "updated", "epic", projectInfo, userInfo))
            }
        } else if (dest.droppableId.includes("epic") && source.droppableId.includes("sprint")) {
            const getSprintIdSource = source.droppableId.substring(source.droppableId.indexOf('-') + 1)
            const getEpicID = dest.droppableId.substring(dest.droppableId.indexOf('-') + 1)
            const getIndexSprintSource = sprintList.findIndex(sprint => sprint._id.toString() === getSprintIdSource)

            const getIndexEpic = epicList.findIndex(epic => epic._id.toString() === getEpicID)

            if (getIndexSprintSource !== -1 && getIndexEpic !== -1) {
                const getCurrentIssue = renderIssuesInCurrentSprint(sprintList[getIndexSprintSource].issue_list)[source.index]
                const getEpicIdInIssue = getCurrentIssue.epic_link?._id.toString()

                const getEpicNameInIssue = getCurrentIssue.epic_link !== null ? getCurrentIssue.epic_link.epic_name : "None"

                //tien hanh them issue vao epic
                dispatch(updateEpic(epicList[getIndexSprintSource]._id.toString(), { issue_id: getCurrentIssue?._id?.toString(), epic_id: getEpicIdInIssue ? getEpicIdInIssue : null }, id))
                //tien hanh them id cua epic vao epic link trong issue
                dispatch(updateInfoIssue(getCurrentIssue._id.toString(), id, { epic_link: epicList[getIndexEpic]?._id?.toString() }, getEpicNameInIssue, epicList[getIndexEpic].epic_name, userInfo.id, "updated", "epic", projectInfo, userInfo))
            }
        } else if (dest.droppableId.includes("version") && source.droppableId.includes("backlog")) {
            const getVersionId = dest.droppableId.substring(dest.droppableId.indexOf('-') + 1)
            const getIndexVersion = versionList.findIndex(version => version._id.toString() === getVersionId)

            if (getIndexVersion !== -1) {
                const getCurrentIssue = issuesInProject[source.index]

                const getVersionIdInIssue = getCurrentIssue.fix_version?._id.toString()
                const getVersionNameInIssue = getCurrentIssue.fix_version !== null ? getCurrentIssue.fix_version.version_name : "None"
                //tien hanh them issue vao version
                dispatch(updateVersion(versionList[getIndexVersion]._id.toString(), { issue_id: getCurrentIssue._id.toString(), version_id: getVersionIdInIssue ? getVersionIdInIssue : null }, id))
                //tien hanh them id cua version vao version link trong issue
                dispatch(updateInfoIssue(getCurrentIssue._id.toString(), id, { fix_version: versionList[getIndexVersion]._id.toString() }, getVersionNameInIssue, versionList[getIndexVersion].version_name, userInfo.id, "updated", "version", projectInfo, userInfo))
            }
        } else if (dest.droppableId.includes("version") && source.droppableId.includes("sprint")) {
            const getSprintIdSource = source.droppableId.substring(source.droppableId.indexOf('-') + 1)
            const getVersionId = dest.droppableId.substring(dest.droppableId.indexOf('-') + 1)
            const getIndexSprintSource = sprintList.findIndex(sprint => sprint._id.toString() === getSprintIdSource)
            const getIndexVersion = versionList.findIndex(version => version._id.toString() === getVersionId)

            if (getIndexSprintSource !== -1 && getIndexVersion !== -1) {
                const getAllIssuesInBacklogFromCurrentSprint = renderIssuesInCurrentSprint(sprintList[getIndexSprintSource].issue_list)
                const getCurrentIssue = getAllIssuesInBacklogFromCurrentSprint[source.index]
                const getVersionIdInIssue = getCurrentIssue.fix_version?._id.toString() //get current version in issue to send to backend for updating new fix version
                const getVersionNameInIssue = getCurrentIssue.fix_version !== null ? getCurrentIssue.fix_version.version_name : "None"
                dispatch(updateVersion(versionList[getIndexVersion]?._id.toString(), { issue_id: getCurrentIssue?._id.toString(), version_id: getVersionIdInIssue ? getVersionIdInIssue : null }, id))
                //tien hanh them id cua version vao version link trong issue
                dispatch(updateInfoIssue(getCurrentIssue?._id.toString(), id, { fix_version: versionList[getIndexVersion]?._id.toString() }, getVersionNameInIssue, versionList[getIndexVersion].version_name, userInfo.id, "updated", "epic", projectInfo, userInfo))
            }
        }

        if (id) {
            dispatch(GetSprintListAction(id))
            dispatch(getIssuesBacklog(id))
        }
    };
    const renderIssuesBacklog = () => {
        const issuesInBacklog = issuesBacklog?.map((issue, index) => {
            return <Draggable draggableId={`${issue._id.toString()}`} key={`${issue?._id?.toString()}`} index={index}>
                {(provided) => {
                    return <IssueTag
                        onChangeAssignees={onChangeAssignees}
                        onChangeStoryPoint={onChangeStoryPoint}
                        onChangeParent={onChangeParent}
                        onChangeIssueType={onChangeIssueType}
                        onChangeKey={onChangeKey}
                        onChangeIssuePriority={onChangeIssuePriority}
                        onChangeIssueStatus={onChangeIssueStatus}
                        onChangeVersions={onChangeVersions}
                        issuesBacklog={issuesBacklog}
                        onChangeEpics={onChangeEpics}
                        issue={issue}
                        index={index}
                        type="0"
                        sprintList={sprintList}
                        userInfo={userInfo}
                        provided={provided}
                        projectInfo={projectInfo}
                        processList={processList}
                        epicList={epicList}
                        versionList={versionList}
                    />
                }}
            </Draggable>
        })
        if (issuesInBacklog.length !== 0) {
            return <Droppable droppableId="issues_backlog dropup">
                {(provided) => {
                    return <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        style={{ listStyle: 'none', zIndex: 1, padding: 0, height: 'fit-content', maxHeight: '197px', overflowY: 'auto', scrollbarWidth: 'none' }}>
                        {issuesInBacklog}
                        {provided.placeholder}
                    </div>
                }}
            </Droppable>
        } else {
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

    const renderArrowInSprint = (sprint) => {
        const index = sprintList?.findIndex(sprint => sprint._id === showCollapseSprint.curentSprintClicked)
        if (index !== -1) {
            if (sprintList[index]?.issue_list?.length !== 0) {
                return <span className='mr-2' style={{ fontSize: 13 }}>{showCollapseSprint.sprintArrs.includes(sprintList[index]._id) ? <i className="fa fa-angle-down"></i> : <i className="fa fa-angle-right"></i>}</span>
            } else {
                return <span className='mr-2' style={{ fontSize: 13 }}>{!showCollapseSprint.sprintArrs.includes(sprintList[index]._id) ? <i className="fa fa-angle-down"></i> : <i className="fa fa-angle-right"></i>}</span>
            }
        } else {
            return renderArrowInSprintDefault(sprint)
        }
    }

    const renderArrowInSprintDefault = (sprint) => {
        if (sprint.issue_list?.length !== 0) {
            return <span className='mr-2' style={{ fontSize: 13 }}>{showCollapseSprint.sprintArrs?.includes(sprint._id) ? <i className="fa fa-angle-down"></i> : <i className="fa fa-angle-right"></i>}</span>
        } else {
            return <span className='mr-2' style={{ fontSize: 13 }}>{!showCollapseSprint.sprintArrs?.includes(sprint._id) ? <i className="fa fa-angle-down"></i> : <i className="fa fa-angle-right"></i>}</span>
        }
    }

    const isShowedOrNot = (sprint) => {
        return sprint.issue_list.length === 0 ? 'show' : showCollapseSprint.sprintArrs.includes(sprint._id) === sprint._id ? 'show' : ''
    }
    const renderSprintList = () => {
        if (!sprintList) {
            return <></>
        }
        const newSprintList = sprintList?.filter(sprint => sprint.sprint_status === 'pending' || sprint.sprint_status === 'processing').map(sprint => {
            return {
                ...sprint, issue_list: renderIssuesInCurrentSprint(sprint.issue_list)
            }
        })
        return newSprintList?.map((sprint, index) => {
            return <div key={index} className='issues-info-sprint m-0 mb-4' style={{ width: '100%', backgroundColor: '#f7f8f9' }}>
                <div className="d-flex justify-content-between align-items-center" style={{ padding: '10px 20px' }}>
                    <div
                        className='d-flex'
                        data-toggle="collapse"
                        data-target={`#issueSprintCollapse-${sprint._id.toString()}`}
                        aria-expanded="false"
                        onClick={() => {
                            if (showCollapseSprint.sprintArrs.includes(sprint._id)) {
                                const index = showCollapseSprint.sprintArrs.findIndex(sp => sp === sprint._id)
                                const temp = [...showCollapseSprint.sprintArrs]
                                temp.splice(index, 1)
                                setShowCollapseSprint({
                                    sprintArrs: [...temp],
                                    curentSprintClicked: sprint._id
                                })

                            } else {
                                const temp = [...showCollapseSprint.sprintArrs]
                                temp.push(sprint._id)
                                setShowCollapseSprint({
                                    sprintArrs: [...temp],
                                    curentSprintClicked: sprint._id
                                })
                            }
                        }}
                        aria-controls={`issueSprintCollapse-${sprint._id.toString()}`}>
                        <h6 className='m-0' style={{ lineHeight: '26px' }}> {sprint._id === showCollapseSprint.curentSprintClicked || showCollapseSprint.curentSprintClicked === '' ? renderArrowInSprint(sprint) : renderArrowInSprintDefault(sprint)} {sprint.sprint_name}</h6>
                        <button style={{ fontSize: '13px', margin: '0 5px' }} className="btn btn-transparent p-0" onClick={() => {
                            dispatch(drawer_edit_form_action(<CreateSprint currentSprint={sprint} />, 'Save', '700px'))
                        }}><i className="fa fa-pen ml-2"></i> Edit sprint</button>
                        <span className='ml-2' style={{ lineHeight: '26px' }}>{sprint.issue_list?.length} issues</span>
                    </div>
                    <div className='d-flex align-items-center'>
                        <div className='mr-2'>
                            {processList?.map((process) => {
                                const countIssueProcess = sprint.issue_list?.filter(issue => {
                                    return issue?.issue_type?._id?.toString() === process._id?.toString()
                                }).length
                                return <Tooltip placement="bottom" title={`${process.name_process[0] + process.name_process.toLowerCase().substring(1)} ${countIssueProcess} of ${sprint.issue_list.length} (issue count)`}>
                                    <Avatar size={'small'} style={{ backgroundColor: process.tag_color }}>{countIssueProcess}</Avatar>
                                </Tooltip>
                            })}
                        </div>
                        {projectInfo?.sprint_id === sprint._id ? <button onClick={() => {
                            dispatch(displayComponentInModal(<CompleteSprintModal sprintInfo={sprint} processList={processList} projectInfo={projectInfo} sprintList={sprintList} userInfo={userInfo} id={id} />))
                        }} className='btn btn-primary'>Complete sprint</button> : (projectInfo?.sprint_id === null && sprint.issue_list.length > 0 ? <button className='btn btn-primary' onClick={() => {
                            //allow to start sprint if no sprints are started and only when a sprint has start and end date
                            //with start date greater than or equal current day
                            if (projectInfo?.sprint_id === null && sprint.start_date !== null && (dayjs(sprint.start_date).isAfter(dayjs(new Date())))) {
                                dispatch(updateProjectAction(id, { sprint_id: sprint._id }, navigate))
                                dispatch(updateSprintAction(sprint._id, { sprint_status: 'processing' }))
                            } else {
                                showNotificationWithIcon('error', '', 'Information is invalid, please checking again')
                            }
                        }}>Start sprint</button> : <button className='btn btn-primary' disabled>Start sprint</button>)}
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
                <div id={`issueSprintCollapse-${sprint._id.toString()}`} className={`collapse ${isShowedOrNot(sprint)}`}>
                    <div className='sprint-info d-flex flex-column' style={{ padding: '5px 20px' }}>
                        {sprint.start_date !== null && sprint.end_date !== null ? <span><span style={{ fontWeight: 'bold' }}>Date: </span> {dayjs(sprint.start_date).format("DD/MM/YYYY hh:mm")} - {dayjs(sprint.end_date).format("DD/MM/YYYY hh:mm")}</span> : <></>}
                        {sprint.sprint_goal !== null ? <span style={{ width: '80%' }}><span style={{ fontWeight: 'bold' }}>Description: </span>{sprint.sprint_goal}</span> : <></>}
                    </div>

                    <Droppable droppableId={`sprint-${sprint._id.toString()}`} >
                        {(provided) => {
                            return <div ref={provided.innerRef} {...provided.droppableProps}>
                                {sprint.issue_list.length === 0 && sprintList.length === 1 ? <div className='description-sprint d-flex align-items-center' style={{ padding: 0, border: '2px dashed #ddd', height: 150, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <img src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1BtLhkORsgCvCDFhKq9ZQ0ICDjaxJAntxfA&s)' style={{ width: '50px', height: '50px' }} alt="sprint img" />
                                    <div className='description-text-sprint d-flex flex-column ml-2'>
                                        <span style={{ fontWeight: '700' }}>Plan your sprint</span>
                                        <span>Drag issues from the <b>Backlog</b> section, or create new issues, to plan the work for this sprint.<br /> Select <b>Start sprint</b> when you're ready</span>
                                    </div>
                                </div> : <div>
                                    {sprint.issue_list.length === 0 ? <div className='description-sprint d-flex align-items-center' style={{ padding: 0, border: '2px dashed #ddd', height: 50, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                        <span>Plan a sprint by dragging the sprint footer down below some issues, or by dragging issues here</span>
                                    </div> : <div className='issues-list-sprint' style={{ maxHeight: '197px', overflowY: 'auto', height: 'fit-content', scrollbarWidth: 'none' }}>
                                        {sprint.issue_list !== null ? sprint.issue_list?.map((issue, index) => {
                                            return <Draggable draggableId={`${issue._id.toString()}`} key={`${issue?._id?.toString()}`} index={index}>
                                                {(provided) => {
                                                    return <IssueTag
                                                        onChangeAssignees={onChangeAssignees}
                                                        onChangeStoryPoint={onChangeStoryPoint}
                                                        onChangeParent={onChangeParent}
                                                        onChangeIssuePriority={onChangeIssuePriority}
                                                        onChangeIssueType={onChangeIssueType}
                                                        index={index}
                                                        issuesBacklog={issuesBacklog}
                                                        onChangeKey={onChangeKey}
                                                        type={sprint?._id}
                                                        onChangeIssueStatus={onChangeIssueStatus}
                                                        onChangeVersions={onChangeVersions}
                                                        onChangeEpics={onChangeEpics}
                                                        issue={issue}
                                                        sprintList={sprintList}
                                                        userInfo={userInfo}
                                                        provided={provided}
                                                        projectInfo={projectInfo}
                                                        processList={processList}
                                                        epicList={epicList}
                                                        versionList={versionList}
                                                    />
                                                }}
                                            </Draggable>
                                        }) : <></>}
                                    </div>}
                                </div>}
                                {provided.placeholder}
                            </div>
                        }}
                    </Droppable>

                    <button className='btn btn-transparent btn-create-issue' style={{ fontSize: '14px', color: '#ddd', display: openCreatingSprint !== sprint._id.toString() ? 'block' : 'none' }} onClick={() => {
                        setIssueStatus(0)
                        setSummary('')
                        setOpenCreatingSprint(sprint._id)
                    }}>
                        <i className="fa-regular fa-plus mr-2"></i>
                        Create issue
                    </button>
                    {
                        openCreatingSprint === sprint._id ? <div className='d-flex' style={{ display: openCreatingSprint ? 'block' : 'none', border: '2px solid #2684FF' }}>
                            <Select className='edit-select-issue-backlog' style={{ border: 'none', borderRadius: 0 }}
                                defaultValue={issueTypeWithoutOptions[0].value}
                                onChange={(value, option) => {
                                    setIssueStatus(value)
                                }}
                                onClick={(e) => e.stopPropagation()}

                                options={issueTypeWithoutOptions.filter(index => [0, 1, 2].includes(index.value))} />
                            <Input className='edit-input-issue-backlog' value={summary} defaultValue={summary} placeholder="What needs to be done?"
                                onChange={(e) => {
                                    setSummary(e.target.value)
                                }}
                                onKeyUp={(e) => {
                                    if (e.key === "Enter") {
                                        if (summary.trim() !== "") {
                                            const tempSummary = summary
                                            //set value for summary to ''
                                            setSummary('')
                                            dispatch(createIssue({
                                                project_id: id,
                                                issue_status: issueStatus,
                                                summary: tempSummary,
                                                creator: userInfo.id,
                                                issue_type: defaultForIssueType(issueStatus, workflowList, processList),
                                                current_sprint: sprint._id
                                            }, id, userInfo.id, sprint._id, null, projectInfo, userInfo))
                                            //set default is 0 which means story
                                            setIssueStatus(0)
                                        }
                                    }
                                }}
                                onBlur={() => setOpenCreatingSprint(null)}
                                style={{ border: 'none', borderRadius: 0 }} />
                        </div> : <></>
                    }
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
                        style={{ border: '1px solid #aaa', borderRadius: 5 }}
                        className={`mt-1 ${chooseVersion?.includes(version._id) ? "selected_version" : "unselected_version"}`}
                        ref={provided.innerRef}
                        {...provided.droppableProps}>
                        <button onClick={(e) => {
                            if (e.target.tagName === "BUTTON") {
                                //if this version is selected, when users click again, it will remove out chooseVersion
                                if (chooseVersion?.includes(version._id)) { //this case means, version has already existed in chooseVersion => remove it from chooseVersion
                                    const index = chooseVersion.findIndex(currentVersion => currentVersion === version._id)
                                    chooseVersion.splice(index, 1)
                                } else {
                                    chooseVersion.push(version._id)
                                }
                                dispatch(getIssuesInProject(id, {
                                    epics: chooseEpic,
                                    versions: chooseVersion
                                }))
                                setChooseVersion([...chooseVersion])
                            }
                        }} style={{ width: '100%', textAlign: 'left', backgroundColor: chooseVersion.includes(version._id) ? '#85B8FF' : version.tag_color }} className="btn btn-transparent">
                            <a data-toggle="collapse"
                                href={versionID}
                                role="button"
                                style={{ color: 'black' }}
                                aria-controls={versionTag}
                                onClick={(e) => {
                                    if (version._id === showVersion) {
                                        setShowVersion(null)
                                    } else {
                                        setShowVersion(version._id)
                                    }
                                }}
                                aria-expanded="false" >
                                <i className="fa-solid fa-caret-down mr-3"></i>
                            </a>{version.version_name}
                        </button>
                        <div className={`collapse card-body ${showVersion === version._id ? "show" : ""}`} id={versionTag} style={{ padding: '5px 5px' }}>
                            <div className='d-flex flex-column'>
                                <div>
                                    <div className="progress mb-2 mt-2" style={{ height: '5px !important' }}>
                                        <div className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow={calculatePercentageForProgress(version)} aria-valuemin={0} aria-valuemax={100} style={{ width: `${calculatePercentageForProgress(version)}%` }} />
                                    </div>
                                    <NavLink to={`/projectDetail/${id}/versions/version-detail/${version._id}`}>Details</NavLink>
                                </div>
                                <hr style={{ width: '100%', height: 8, marginTop: 5 }} />
                                <div style={{ padding: '5px 10px' }}>
                                    <div>
                                        <div className='d-flex align-items-center justify-content-between' style={{ marginBottom: 10 }}>
                                            <span>Start Date</span>
                                            <Input style={{ width: 'max-content' }} defaultValue={dayjs(version.start_date).format('DD/MM/YYYY hh:mm A')} disabled />
                                        </div>
                                        <div className='d-flex align-items-center justify-content-between' style={{ marginBottom: 10 }}>
                                            <span>End Date</span>
                                            <Input style={{ width: 'max-content' }} defaultValue={dayjs(version.end_date).format('DD/MM/YYYY hh:mm A')} disabled />
                                        </div>
                                    </div>
                                    <div>
                                        <div className='d-flex align-items-center justify-content-between' style={{ marginBottom: 10 }}>
                                            <span>Issues </span>
                                            <div style={{ width: 100 }}>
                                                <Avatar size={20}><span style={{ fontSize: 13, display: 'flex' }}>{version?.issue_list?.filter(issue => issue.issue_status !== 4).length}</span></Avatar>
                                            </div>
                                        </div>
                                        <div className='d-flex align-items-center justify-content-between' style={{ marginBottom: 10 }}>
                                            <span>Completed </span>
                                            <div style={{ width: 100 }}>
                                                <Avatar size={20}><span style={{ fontSize: 13, display: 'flex' }}>{version?.issue_list?.filter(issue => {
                                                    return issue?.issue_type === processList[processList.length - 1]?._id && issue.issue_status !== 4
                                                }).length}</span></Avatar>
                                            </div>
                                        </div>
                                        <div className='d-flex align-items-center justify-content-between' style={{ marginBottom: 10 }}>
                                            <span>Unestimated</span>
                                            <div style={{ width: 100 }}>
                                                <Avatar size={20}><span style={{ fontSize: 13, display: 'flex' }}>{version?.issue_list?.filter(issue => issue.story_point === null && issue.issue_status !== 4).length}</span></Avatar>
                                            </div>
                                        </div>
                                        <div className='d-flex align-items-center justify-content-between' style={{ marginBottom: 10 }}>
                                            <span>Estimate</span>
                                            <div style={{ width: 100 }}>
                                                <Avatar size={20}><span style={{ fontSize: 13, display: 'flex' }}>{version?.issue_list?.filter(issue => issue.story_point !== null && issue.issue_status !== 4).length}</span></Avatar>
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
                        className={`card mt-1 ${chooseEpic.includes(epic._id) ? "selected_epic" : "unselected_epic"}`}
                        key={epic._id.toString()}
                        ref={provided.innerRef}
                        {...provided.droppableProps}>
                        <button
                            style={{ width: '100%', textAlign: 'left', backgroundColor: chooseEpic.includes(epic._id) ? '#85B8FF' : epic.tag_color, borderRadius: 3 }}
                            className="btn btn-transparent"
                            onClick={(e) => {
                                if (e.target.tagName === "BUTTON") {
                                    //if this epic is selected, when users click again, it will remove out chooseEpic
                                    if (chooseEpic?.includes(epic._id)) { //this case means, epic has already existed in chooseEpic => remove it from chooseEpic
                                        const index = chooseEpic.findIndex(currentEpic => {
                                            return currentEpic === epic._id

                                        })
                                        chooseEpic.splice(index, 1)
                                    } else {
                                        chooseEpic.push(epic._id)
                                    }
                                    dispatch(getIssuesInProject(id, {
                                        epics: chooseEpic,
                                        versions: chooseVersion
                                    }))
                                    setChooseEpic([...chooseEpic])
                                }
                            }}>

                            <a data-toggle="collapse"
                                href={epicID}
                                role="button"
                                style={{ color: 'black' }}
                                aria-controls={epicTag}
                                onClick={(e) => {
                                    if (epic._id === showEpic) {
                                        setShowEpic(null)
                                    } else {
                                        setShowEpic(epic._id)
                                    }
                                }}
                                aria-expanded="false" >
                                <i className="fa-solid fa-caret-down mr-3"></i>
                            </a><span>{iTagForIssueTypes(3, null, null)}</span> {epic.epic_name}
                        </button>
                        <div className={`collapse card-body ${showEpic === epic._id ? "show" : ""}`} id={epicTag} style={{ padding: '5px 10px' }}>
                            <div className='d-flex flex-column'>
                                <NavLink className="mt-2" to={`/projectDetail/${id}/epics/epic-detail/${epic._id}`}>Details</NavLink>
                                <hr style={{ width: '100%', height: 8, marginTop: 5 }} />
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
                                            <Avatar size={20}><span style={{ fontSize: 13, display: 'flex' }}>{epic?.issue_list?.filter(issue => issue.issue_type === processList[processList.length - 1]?._id).length}</span></Avatar>
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
        <div>
            <Breadcrumb
                style={{ marginBottom: 10 }}
                items={[
                    {
                        title: <a href="/manager">Projects</a>,
                    },
                    {
                        title: <a href={`/projectDetail/${id}/board`}>{projectInfo?.name_project}</a>,
                    }
                ]}
            />
            <div className='d-flex justify-content-between'>
                <h4>Backlog</h4>
                <div>
                    <Button type='primary' className='mr-2'><i className="fa fa-share mr-2"></i> Share</Button>
                    <Button onClick={() => {
                        setOnChangeSettings(!onChangeSettings)
                    }}><span><i className="fa-solid fa-sliders mr-2"></i> View Settings</span></Button>
                </div>
            </div>
            <div className="search-info-backlogs d-flex">
                <div className="search-block">
                    <Search
                        placeholder="Search issues"
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
                <Button type={`${searchMyIssue === null ? "primary" : "default"}`} onClick={() => {
                    if (searchMyIssue !== null) {
                        setSearchMyIssue(null)
                    }
                }} className=' ml-2 mr-2 d-flex justify-content-center'>All issues {searchMyIssue === null ? <span>({issuesInProject?.filter(issue => !issue?.isCompleted && issue?.issue_status !== 4)?.length})</span> : <></>}</Button>
                <Button type={`${searchMyIssue !== null ? "primary" : "default"}`} onClick={() => {
                    if (searchMyIssue === null) {
                        setSearchMyIssue(userInfo.id)
                    } else {
                        setSearchMyIssue(null)
                    }
                }}>
                    Only my issues {searchMyIssue !== null ? <span>({issuesInProject?.filter(issue => (issue?.creator?._id === userInfo.id || issue.assignees.map(currentIssue => currentIssue._id).includes(userInfo.id))).length})</span> : <></>}
                </Button>
                <div>
                    <Button className="mr-2 ml-2" id="dropdownVersionButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        Versions {countVersion !== 0 ? <span className='ml-1 mr-2' style={{ color: 'blue' }}>({countVersion})</span> : <></>} <i className="fa fa-angle-down ml-2"></i>
                    </Button>
                    <div className="dropdown-menu" aria-labelledby="dropdownVersionButton">
                        {versionList !== null && versionList?.length > 0 ? <Checkbox.Group defaultValue={searchIssue.versions} value={searchIssue.versions} style={{ width: '100%' }} onChange={(value) => {
                            setSearchIssue({
                                ...searchIssue,
                                versions: [...value]
                            })
                            setCountVersion(value.length)
                        }}>
                            <Row>
                                <Col span={16} style={{ padding: '5px 10px' }}>
                                    <Checkbox value={null}>Issue without epics</Checkbox>
                                </Col>
                                {versionList?.map(version => {
                                    return <Col span={16} style={{ padding: '5px 10px' }}>
                                        <Checkbox value={version._id}>{version.version_name}</Checkbox>
                                    </Col>
                                })}
                            </Row>
                        </Checkbox.Group> : <p style={{ padding: '5px 20px' }}>Unreleased versions in this project</p>}
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
                    <Button id="dropdownEpicButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        Epics {countEpic !== 0 ? <span className='ml-1 mr-2' style={{ color: 'blue' }}>({countEpic})</span> : <></>} <i className="fa fa-angle-down ml-2"></i>
                    </Button>
                    <div className="dropdown-menu" aria-labelledby="dropdownEpicButton" style={{ width: 'fit-content' }}>
                        {
                            epicList !== null && epicList?.length > 0 ? <Checkbox.Group defaultValue={searchIssue.epics} value={searchIssue.epics} style={{ width: '100%' }} onChange={(value) => {
                                setSearchIssue({
                                    ...searchIssue,
                                    epics: [...value]
                                })
                                setCountEpic(value.length)
                            }}>
                                <Row>
                                    <Col span={16} style={{ padding: '5px 10px' }}>
                                        <Checkbox value={null}>Issue without versions</Checkbox>
                                    </Col>
                                    {epicList?.map(epic => {
                                        return <Col span={16} style={{ padding: '5px 10px' }}>
                                            <Checkbox style={{ width: 'max-content' }} value={epic._id}>{epic.epic_name}</Checkbox>
                                        </Col>
                                    })}
                                </Row>
                            </Checkbox.Group> : <span className='d-flex justify-content-center'>No epics recently</span>
                        }
                        <hr />
                        <div className='d-flex align-items-center' style={{ padding: '0 10px' }}>
                            <Switch onChange={() => {
                                setOnChangeEpic(!onChangeEpic)
                            }} value={onChangeEpic} />
                            <span className='ml-3'>Show epic panel</span>
                        </div>
                    </div>
                </div>
                <div className='ml-2'>
                    <Button onClick={() => {
                        setSearchIssue({
                            epics: [],
                            versions: []
                        })
                        setCountEpic(0)
                        setCountVersion(0)
                        setSearchMyIssue(null)
                        setChooseEpic([])
                        setChooseVersion([])
                    }}>Clear all searches</Button>
                </div>
            </div>
            <div>
                <div className='main-info-backlog' style={{ minHeight: '200px', display: onChangeEpic || onChangeVersion || onChangeSettings ? 'flex' : 'block' }}>
                    <DragDropContext onDragEnd={(result) => {
                        handleDragEnd(result)
                    }}>
                        {/* Card for versions */}
                        <div className={`card version-info-backlog mr-1`} style={{ width: '25rem', display: onChangeVersion ? 'block' : 'none', margin: '10px 0', height: 'fit-content' }}>
                            <div className='d-flex justify-content-between mt-2' style={{ padding: '5px 10px' }}>
                                <h6 className='m-0'>Versions</h6>
                                <i className="fa-solid fa-xmark" onClick={() => {
                                    setOnChangeVersion(!onChangeVersion)
                                }}></i>
                            </div>
                            {versionList?.length !== 0 ? <div>
                                <div style={{ margin: '10px 5px' }}>
                                    <button onClick={() => {
                                        //if this version is selected, when users click again, it will remove out chooseVersion
                                        if (chooseVersion?.includes(null)) { //this case means, version has already existed in chooseVersion => remove it from chooseVersion
                                            const index = chooseVersion.findIndex(currentVersion => currentVersion === null)
                                            chooseVersion.splice(index, 1)
                                        } else {
                                            chooseVersion.push(null)
                                        }
                                        dispatch(getIssuesInProject(id, {
                                            epics: chooseEpic,
                                            versions: chooseVersion
                                        }))
                                        setChooseVersion([...chooseVersion])
                                    }} style={{ width: '100%', textAlign: 'left', border: '1px solid #aaa', borderRadius: '3px' }} className={`btn btn-transparent ${chooseVersion?.includes(null) ? "selected_version" : "unselected_version"}`}>Issue without version</button>
                                    {renderVersionList()}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                    <div style={{ padding: '10px', display: 'flex', alignItems: 'center' }} className='version-footer'>
                                        <i className="fa fa-plus mr-2"></i>
                                        <NavLink style={{ width: '100%', textDecoration: 'none', display: 'block', color: 'black' }} className="version-footer" to='#' onClick={() => {
                                            dispatch(drawer_edit_form_action(<CreateVersion currentVersion={
                                                {
                                                    id: null,
                                                    project_id: id,
                                                    description: '',
                                                    version_name: '',
                                                    start_date: null,
                                                    end_date: null,
                                                    version_id: null
                                                }
                                            } />, 'Create', '500px'))
                                        }}>Create new versions</NavLink>
                                    </div>
                                    <div style={{ padding: '10px', display: 'flex', alignItems: 'center' }} className='version-footer'>
                                        <i className="fa fa-link mr-2"></i>
                                        <NavLink to={`/projectDetail/${id}/releases`} className="version-footer" style={{ color: 'black', textDecoration: 'none' }}>Viewed linked pages</NavLink>
                                    </div>
                                </div>
                            </div> : <div style={{ height: 'fit-content' }}>
                                <div className="card-body d-flex flex-column justify-content-center align-items-center">
                                    <img style={{ width: 100 }} src="https://jira-frontend-bifrost.prod-east.frontend.public.atl-paas.net/assets/releases-80px.782fa98d.svg" />
                                    <p className='text-center'>Versions help you package and schedule project deliveries.</p>
                                    <p className='text-center'>Your unreleased versions will appear here so you can manage them directly from the backlog.</p>
                                </div>
                                <div style={{ padding: '10px 20px' }} className='backlog-creating-sprint'>
                                    <NavLink onClick={() => {
                                        dispatch(drawer_edit_form_action(<CreateVersion currentVersion={
                                            {
                                                id: null,
                                                project_id: id,
                                                description: '',
                                                version_name: '',
                                                start_date: null,
                                                end_date: null,
                                                version_id: null
                                            }
                                        } />, 'Create', '500px'))
                                    }} style={{ textDecoration: 'none', color: 'black' }}><i className="fa fa-plus mr-2"></i>Create version</NavLink>
                                </div>
                            </div>}
                        </div>

                        {/* Card for epics */}
                        <div
                            className="card epic-info-backlog"
                            style={{ width: '25rem', display: onChangeEpic ? 'block' : 'none', margin: '10px 5px', height: 'fit-content', maxHeight: 500, overflowY: 'auto', scrollbarWidth: 'thin' }}>
                            <div className='d-flex justify-content-between mt-2' style={{ padding: '5px 10px' }}>
                                <h6>Epic</h6>
                                <i className="fa-solid fa-xmark" onClick={() => {
                                    setOnChangeEpic(!onChangeEpic)
                                }}></i>
                            </div>
                            {
                                epicList !== null && epicList.length > 0 ? <div>
                                    <div className="card-body d-flex flex-column justify-content-center p-2">
                                        <button onClick={() => {
                                            //if this epic is selected, when users click again, it will remove out chooseEpic
                                            if (chooseEpic?.includes(null)) { //this case means, epic has already existed in chooseEpic => remove it from chooseEpic
                                                const index = chooseEpic.findIndex(currentEpic => currentEpic === null)
                                                chooseEpic.splice(index, 1)
                                            } else {
                                                chooseEpic.push(null)
                                            }

                                            dispatch(getIssuesInProject(id, {
                                                epics: chooseEpic,
                                                versions: chooseVersion
                                            }))
                                            setChooseEpic([...chooseEpic])
                                        }} style={{ width: '100%', textAlign: 'left', border: '1px solid #aaa', borderRadius: 3 }} className={`btn btn-transparent ${chooseEpic?.includes(null) ? "selected_epic" : "unselected_epic"}`}>Issue without epic</button>
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
                                </div> : <div>
                                    <div style={{ height: 'fit-content' }}>
                                        <div className="card-body d-flex flex-column justify-content-center align-items-center">
                                            <img style={{ width: 100 }} src="https://jira-frontend-bifrost.prod-east.frontend.public.atl-paas.net/assets/empty-state-growth-sprout.36bafc1e.svg" />
                                            <p className='text-center'>Plan and prioritize large chunks of work.</p>
                                            <p className='text-center'>Create your first epic to start capturing and breaking down work for your team.</p>
                                        </div>
                                        <div style={{ padding: '10px 20px' }} className='backlog-creating-sprint'>
                                            <NavLink onClick={() => {
                                                dispatch(drawer_edit_form_action(<CreateEpic currentEpic={
                                                    {
                                                        id: null,
                                                        project_id: id,
                                                        summary: '',
                                                        epic_name: '',
                                                        name_project: projectInfo.name_project
                                                    }} />, 'Create', '500px'))
                                            }} style={{ textDecoration: 'none', color: 'black' }}><i className="fa fa-plus mr-2"></i>Create Epic</NavLink>
                                        </div>
                                    </div>
                                </div>
                            }
                        </div>

                        {/* Card for backlog and sprint */}
                        <div className='d-flex flex-column mt-2 mb-2 ' style={{ width: '100%', overflowY: 'auto', height: '75vh' }}>
                            {renderSprintList()}
                            <div className='issues-info-backlog mt-1' style={{ backgroundColor: '#f7f8f9' }}>
                                <div
                                    className="d-flex justify-content-between align-items-center mb-2"
                                    data-toggle="collapse" data-target="#issueBacklogCollapse"
                                    onClick={() => {
                                        setShowCollapseBacklog(!showCollapseBacklog)
                                    }}
                                    aria-expanded="false"
                                    aria-controls="issueBacklogCollapse"
                                    style={{ margin: '10px', padding: '5px 10px' }}>
                                    <h6 className='m-0'><span className='mr-2' style={{ fontSize: 13 }}>{showCollapseBacklog ? <i className="fa fa-angle-down"></i> : <i className="fa fa-angle-right"></i>}</span>Backlog <span style={{ fontSize: 14, fontWeight: 500 }}>{issuesInProject?.filter(issue => issue.current_sprint === null && issue.issue_status !== 4 && !issue?.isCompleted).length} issues</span></h6>
                                    <div className='d-flex align-items-center'>
                                        <div className='mr-2'>
                                            {processList?.map((process) => {
                                                const countIssueProcess = issuesInProject?.filter(issue => issue.current_sprint === null).filter(issue => {
                                                    return issue?.issue_type?._id?.toString() === process?._id?.toString() && issue.issue_status !== 4 && !issue?.isCompleted
                                                }).length
                                                return <Tooltip placement="bottom" title={`${process.name_process[0] + process.name_process.toLowerCase().substring(1)} ${countIssueProcess} of ${issuesInProject.length} (issue count)`}>
                                                    <Avatar size={'small'} style={{ backgroundColor: process.tag_color }}>{countIssueProcess}</Avatar>
                                                </Tooltip>
                                            })}
                                        </div>
                                        <button className='btn btn-primary' onClick={(e) => {
                                            e.stopPropagation()
                                            dispatch(createSprintAction({
                                                project_id: id,
                                                sprint_name: null
                                            }))
                                        }}>Create sprint</button>
                                    </div>

                                </div>
                                <div id="issueBacklogCollapse" className={`collapse ${showCollapseBacklog ? "show" : ""}`}>
                                    {renderIssuesBacklog()}
                                    <button className='btn btn-transparent btn-create-issue' style={{ fontSize: '14px', color: '#ddd', display: openCreatingSprint !== '0' ? 'block' : 'none' }} onClick={() => {
                                        setOpenCreatingSprint('0')
                                        setIssueStatus(0)
                                        setSummary('')
                                    }}>
                                        <i className="fa-regular fa-plus mr-2"></i>
                                        Create issue
                                    </button>
                                    {
                                        openCreatingSprint === '0' ? <div className='d-flex' style={{ border: '2px solid #2684FF' }}>
                                            <Select className='edit-select-issue-backlog' style={{ border: 'none', borderRadius: 0 }}
                                                defaultValue={issueTypeWithoutOptions[0].value}
                                                onChange={(value, option) => {
                                                    setIssueStatus(value)
                                                }}
                                                options={issueTypeWithoutOptions.filter(index => [0, 1, 2].includes(index.value))}
                                            />
                                            <Input
                                                className='edit-input-issue-backlog'
                                                value={summary}
                                                defaultValue={summary}
                                                placeholder="What needs to be done?"
                                                onChange={(e) => {
                                                    console.log("gia tri duoc set ", e.target.value);
                                                    setSummary(e.target.value)
                                                }}
                                                onBlur={() => setOpenCreatingSprint(null)}
                                                onKeyUp={(e) => {
                                                    if (summary.trim() !== "") {
                                                        if (e.key === "Enter") {
                                                            const tempSummary = summary
                                                            //set default is 0 which means story

                                                            if (tempSummary.trim() !== "") {
                                                                dispatch(createIssue({
                                                                    project_id: id,
                                                                    issue_status: issueStatus,
                                                                    summary: tempSummary,
                                                                    creator: userInfo.id,
                                                                    issue_type: defaultForIssueType(issueStatus, workflowList, processList),
                                                                    current_sprint: null
                                                                }, id, userInfo.id, null, null, projectInfo, userInfo))
                                                            }
                                                            setIssueStatus(0)
                                                            setSummary('')
                                                        }
                                                    }
                                                }}
                                                style={{ border: 'none', borderRadius: 0 }} />
                                        </div> : <></>
                                    }
                                </div>
                            </div>
                        </div>

                        <div className={`card info-settings mr-1`} style={{ width: '25rem', display: onChangeSettings ? 'block' : 'none', margin: '0px 10px', height: 'fit-content', marginTop: 7 }}>
                            <div className='d-flex justify-content-between' style={{ padding: '15px 10px' }}>
                                <h6 className='m-0'>View Settings</h6>
                                <i className="fa-solid fa-xmark" onClick={() => {
                                    setOnChangeSettings(!onChangeSettings)
                                }}></i>
                            </div>
                            <div className='row ml-2 mb-2'>
                                <span className='col-8'>Versions</span>
                                <Switch style={{ width: '10%' }} className='col-1' onChange={() => {
                                    updateIssueConfig(onChangeEpic, !onChangeVersion, onChangeIssueStatus, onChangeKey, onChangeIssueType, onChangeEpics, onChangeVersions, onChangeIssuePriority, onChangeAssignees, onChangeStoryPoint, onChangeParent)
                                    setOnChangeVersion(!onChangeVersion)
                                }} value={onChangeVersion} />
                            </div>
                            <div className='row ml-2 mb-2'>
                                <span className='col-8'>Epics</span>
                                <Switch className='col-1' onChange={() => {
                                    updateIssueConfig(!onChangeEpic, onChangeVersion, onChangeIssueStatus, onChangeKey, onChangeIssueType, onChangeEpics, onChangeVersions, onChangeIssuePriority, onChangeAssignees, onChangeStoryPoint, onChangeParent)
                                    setOnChangeEpic(!onChangeEpic)
                                }} value={onChangeEpic} />
                            </div>
                            <hr />
                            <div>
                                <h6 style={{ padding: '0 10px' }}>Fields</h6>
                                <div className='row ml-2 mb-2'>
                                    <span className='col-8'>Issue Status</span>
                                    <Switch className='col-1' onChange={() => {
                                        updateIssueConfig(onChangeEpic, onChangeVersion, !onChangeIssueStatus, onChangeKey, onChangeIssueType, onChangeEpics, onChangeVersions, onChangeIssuePriority, onChangeAssignees, onChangeStoryPoint, onChangeParent)
                                        setOnChangeIssueStatus(!onChangeIssueStatus)
                                    }} value={onChangeIssueStatus} />
                                </div>

                                <div className='row ml-2 mb-2'>
                                    <span className='col-8'>Issue Key</span>
                                    <Switch className='col-1' onChange={() => {
                                        updateIssueConfig(onChangeEpic, onChangeVersion, onChangeIssueStatus, !onChangeKey, onChangeIssueType, onChangeEpics, onChangeVersions, onChangeIssuePriority, onChangeAssignees, onChangeStoryPoint, onChangeParent)

                                        setOnChangeKey(!onChangeKey)
                                    }} value={onChangeKey} />
                                </div>
                                <div className='row ml-2 mb-2'>
                                    <span className='col-8'>Issue Type</span>
                                    <Switch className='col-1' onChange={() => {
                                        updateIssueConfig(onChangeEpic, onChangeVersion, onChangeIssueStatus, onChangeKey, !onChangeIssueType, onChangeEpics, onChangeVersions, onChangeIssuePriority, onChangeAssignees, onChangeStoryPoint, onChangeParent)

                                        setOnChangeIssueType(!onChangeIssueType)
                                    }} value={onChangeIssueType} />
                                </div>
                                <div className='row ml-2 mb-2'>
                                    <span className='col-8'>Epic</span>
                                    <Switch className='col-1' onChange={() => {
                                        updateIssueConfig(onChangeEpic, onChangeVersion, !onChangeIssueStatus, onChangeKey, onChangeIssueType, !onChangeEpics, onChangeVersions, onChangeIssuePriority, onChangeAssignees, onChangeStoryPoint, onChangeParent)

                                        setOnChangeEpics(!onChangeEpics)
                                    }} value={onChangeEpics} />
                                </div>
                                <div className='row ml-2 mb-2'>
                                    <span className='col-8'>Priority</span>
                                    <Switch className='col-1' onChange={() => {
                                        updateIssueConfig(onChangeEpic, onChangeVersion, onChangeIssueStatus, onChangeKey, onChangeIssueType, onChangeEpics, onChangeVersions, !onChangeIssuePriority, onChangeAssignees, onChangeStoryPoint, onChangeParent)

                                        setOnChangeIssuePriority(!onChangeIssuePriority)
                                    }} value={onChangeIssuePriority} />
                                </div>
                                <div className='row ml-2 mb-2'>
                                    <span className='col-8'>Version</span>
                                    <Switch className='col-1' onChange={() => {
                                        updateIssueConfig(onChangeEpic, onChangeVersion, onChangeIssueStatus, onChangeKey, onChangeIssueType, onChangeEpics, !onChangeVersions, onChangeIssuePriority, onChangeAssignees, onChangeStoryPoint, onChangeParent)
                                        setOnChangeVersions(!onChangeVersions)
                                    }} value={onChangeVersions} />
                                </div>
                                <div className='row ml-2 mb-2'>
                                    <span className='col-8'>Assignees</span>
                                    <Switch className='col-1' onChange={() => {
                                        updateIssueConfig(onChangeEpic, onChangeVersion, onChangeIssueStatus, onChangeKey, onChangeIssueType, onChangeEpics, onChangeVersions, onChangeIssuePriority, !onChangeAssignees, onChangeStoryPoint, onChangeParent)
                                        setOnChangeAssignees(!onChangeAssignees)
                                    }} value={onChangeAssignees} />
                                </div>
                                <div className='row ml-2 mb-2'>
                                    <span className='col-8'>Story Point</span>
                                    <Switch className='col-1' onChange={() => {
                                        updateIssueConfig(onChangeEpic, onChangeVersion, onChangeIssueStatus, onChangeKey, onChangeIssueType, onChangeEpics, onChangeVersions, onChangeIssuePriority, onChangeAssignees, !onChangeStoryPoint, onChangeParent)
                                        setOnChangeStoryPoint(!onChangeStoryPoint)
                                    }} value={onChangeStoryPoint} />
                                </div>
                                <div className='row ml-2 mb-2'>
                                    <span className='col-8'>Parent</span>
                                    <Switch className='col-1' onChange={() => {
                                        updateIssueConfig(onChangeEpic, onChangeVersion, onChangeIssueStatus, onChangeKey, onChangeIssueType, onChangeEpics, onChangeVersions, onChangeIssuePriority, onChangeAssignees, onChangeStoryPoint, !onChangeParent)
                                        setOnChangeParent(!onChangeParent)
                                    }} value={onChangeParent} />
                                </div>
                            </div>
                        </div>
                    </DragDropContext>
                </div>
            </div>
            <Modal
                destroyOnClose="true"
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
