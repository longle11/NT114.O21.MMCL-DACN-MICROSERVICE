import React, { useEffect, useState } from 'react'
import DrawerHOC from '../../HOC/DrawerHOC'
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Avatar, Breadcrumb, Button, Collapse, Input, InputNumber, Modal, Select, Switch, Tag, theme, Tooltip } from 'antd';
import { createIssue, getIssuesInProject, updateInfoIssue } from '../../redux/actions/IssueAction';
import { CreateProcessACtion, GetProcessListAction, GetSprintAction, GetSprintListAction, updateManyProcessesAction, UpdateProcessAction } from '../../redux/actions/ListProjectAction';
import { deleteProcessAction, updateProjectAction, updateSprintAction } from '../../redux/actions/CreateProjectAction';
import { CopyLinkButton, issueTypeWithoutOptions, iTagForIssueTypes, iTagForPriorities } from '../../util/CommonFeatures';
import { showNotificationWithIcon } from '../../util/NotificationUtil';
import dayjs from 'dayjs';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { delay } from '../../util/Delay';
import './Dashboard'
import { CaretRightOutlined, UserOutlined } from '@ant-design/icons';
import { DISPLAY_LOADING, HIDE_LOADING } from '../../redux/constants/constant';
import { displayComponentInModal, displayComponentInModalInfo } from '../../redux/actions/ModalAction';
import CompleteSprintModal from '../Modal/CompleteSprintModal/CompleteSprintModal';
import { calculateTaskRemainingTime } from '../../validations/TimeValidation';
import MemberProject from '../../child-components/Member-Project/MemberProject';
import InfoModal from '../Modal/InfoModal/InfoModal';
import domainName from '../../util/Config';
import { getEpicList } from '../../redux/actions/CategoryAction';
import { drawer_edit_form_action } from '../../redux/actions/DrawerAction';
import CreateSprint from '../Forms/CreateSprint/CreateSprint';
import AddFlagModal from '../Modal/AddFlagModal/AddFlagModal';
import { updateUserInfo } from '../../redux/actions/UserAction';
import DeleteProcessModal from '../Modal/DeleteProcessModal/DeleteProcessModal';
import { getValueOfStringFieldInIssue, getValueOfNumberFieldInIssue, getValueOfArrayObjectFieldInIssue, getValueOfObjectFieldInIssue, renderIssuesWithMyIssues } from '../../util/IssueFilter';
import { attributesFiltering } from '../../util/IssueAttributesCreating';
import { searchingIssuesValidConditions } from '../../util/searchingAttributesInIssues';
export default function Dashboard() {
    const dispatch = useDispatch()
    //set display epic and version fields
    const [onChangeEpics, setOnChangeEpics] = useState(true)

    const [onChangeIssuePriority, setOnChangeIssuePriority] = useState(true)
    const [onChangeIssueStatus, setOnChangeIssueStatus] = useState(true)
    const [onChangeKey, setOnChangeKey] = useState(true)

    const [onChangeIssueType, setOnChangeIssueType] = useState(true)
    const [onChangeAssignees, setOnChangeAssignees] = useState(true)
    const [onChangeStoryPoint, setOnChangeStoryPoint] = useState(true)
    const [onChangeParent, setOnChangeParent] = useState(true)

    const [searchDashboard, setSearchDashboard] = useState(false)

    const [openAddProcess, setOpenAddProcess] = useState(false)
    const [openCreatingIssue, setOpenCreatingIssue] = useState('')
    const [summary, setSummary] = useState('')
    const [issueStatus, setIssueStatus] = useState(0)
    const [lockDroppable, setLockDroppable] = useState(true)

    const navigate = useNavigate()

    //sử dụng hiển thị tất cả issue hoặc chỉ các issue liên quan tới user
    const { id, sprintId } = useParams()
    const projectInfo = useSelector(state => state.listProject.projectInfo)
    const userInfo = useSelector(state => state.user.userInfo)
    const issuesInProject = useSelector(state => state.issue.issuesInProject)
    const processList = useSelector(state => state.listProject.processList)
    const sprintList = useSelector(state => state.listProject.sprintList)
    const epicList = useSelector(state => state.categories.epicList)
    const sprintInfo = useSelector(state => state.listProject.sprintInfo)
    const [valueProcess, setValueProcess] = useState('')
    const [onEditNameProcess, setOnEditNameProcess] = useState('')
    const [editNameProcess, setEditNameProcess] = useState('')
    const [editLimitColumnProcess, setEditLimitColumnProcess] = useState(null)
    const [onChangeSettings, setOnChangeSettings] = useState(false)
    const [onChangeInsights, setOnChangeInsights] = useState(false)
    const [onEditSummaryIssue, setOnEditSummaryIssue] = useState('')
    const [editSummaryIssue, setEditSummaryIssue] = useState('')

    const [onEditStoryPointIssue, setOnEditStoryPointIssue] = useState('')
    const [editStoryPointIssue, setEditStoryPointIssue] = useState(null)

    const [onEditAssigneesIssue, setOnEditAssigneesIssue] = useState('')
    const [searchIssue, setSearchIssue] = useState({
        versions: [],
        epics: [],
        types: [],
        statuses: []
    })
    const [searchMyIssue, setSearchMyIssue] = useState(null)

    if (sprintId === 'board' && projectInfo) {
        if (projectInfo?.sprint_id) {
            navigate(`/projectDetail/${id}/board/${projectInfo?.sprint_id}`)
        }
    }
    useEffect(() => {
        if (sprintId !== 'board') {
            dispatch(GetSprintAction(sprintId))
        }
    }, [sprintId])

    useEffect(() => {
        dispatch(GetProcessListAction(id))
        dispatch(getEpicList(id))
        dispatch(getIssuesInProject(id, null))
        dispatch(GetSprintListAction(id))
    }, [])

    const handleSearchIssue = (versions, epics, types, statuses) => {
        setSearchIssue({ ...searchIssue, versions: versions, epics: epics, types: types, statuses: statuses })
    }

    const renderOptionAssignee = (issueInfo) => {
        return projectInfo?.members?.filter((value, index) => {
            const isExisted = issueInfo?.assignees?.findIndex((user) => {
                return user._id === value.user_info._id
            })
            return !(issueInfo?.creator._id === value.user_info._id || isExisted !== -1)
        }).map((valueIssue, index) => {
            return {
                label: <span><span style={{ fontWeight: 'bold' }}>{valueIssue.user_info.username}</span> ({valueIssue.user_info.email})</span>,
                value: valueIssue.user_info._id
            }
        })
    }

    const [isOpenModalSetColumn, setIsOpenModalSetColumn] = useState(false)

    const handleModalSetColumnOk = () => {
        dispatch(UpdateProcessAction(editLimitColumnProcess._id, editLimitColumnProcess.project_id, { limited_number_issues: editLimitColumnProcess?.limited_number_issues }))
        setIsOpenModalSetColumn(false)
    }

    const handleModalSetColumnCancel = () => {
        setIsOpenModalSetColumn(false)
        setEditLimitColumnProcess(null)
    }


    const renderTooltipForRemainingDay = (sprintInfo) => {
        if (Object.keys(sprintInfo).length !== 0) {
            return <div>
                <span>{calculateTaskRemainingTime(dayjs(new Date()), dayjs(sprintInfo.end_date))} remaining</span>
                <div className='d-flex flex-column mb-2'>
                    <label style={{ fontSize: '15px', fontWeight: 'bold', padding: 0, margin: 0 }} htmlFor='start_date'>Start date</label>
                    <span id="start_date" name="start_date">{dayjs(sprintInfo.start_date).format("DD/MM/YYYY-hh:mm")}</span>
                </div>
                <div className='d-flex flex-column'>
                    <label style={{ fontSize: '15px', fontWeight: 'bold', padding: 0, margin: 0 }} htmlFor='start_date'>Projected end date</label>
                    <span id="start_date" name="start_date">{dayjs(sprintInfo.end_date).format("DD/MM/YYYY-hh:mm")}</span>
                </div>
            </div>
        }
        return null
    }

    const renderTooltipForStartingDateYet = (sprintInfo) => {
        if (Object.keys(sprintInfo).length !== 0) {
            return <div>
                <div className='d-flex flex-column mb-2'>
                    <label style={{ fontSize: '15px', fontWeight: 'bold', padding: 0, margin: 0 }} htmlFor='start_date'>Start date</label>
                    <span id="start_date" name="start_date">{dayjs(sprintInfo.start_date).format("DD/MM/YYYY-hh:mm")}</span>
                </div>
                <div className='d-flex flex-column'>
                    <label style={{ fontSize: '15px', fontWeight: 'bold', padding: 0, margin: 0 }} htmlFor='start_date'>Projected end date</label>
                    <span id="start_date" name="start_date">{dayjs(sprintInfo.end_date).format("DD/MM/YYYY-hh:mm")}</span>
                </div>
            </div>
        }
        return null
    }

    const handleDragEnd = async (result) => {
        const source = result.source
        const dest = result.destination

        console.log("source ", source?.droppableId);
        console.log("dest ", dest?.droppableId);

        if (dest?.droppableId === undefined || source?.droppableId === undefined) {
            return null
        }

        if ((source.droppableId.includes("process") && !dest.droppableId.includes("process")) || (dest.droppableId.includes("process") && !source.droppableId.includes("process"))) {
            return null
        }
        if (source.droppableId === dest.droppableId) {
            if (source.droppableId === 'process') {  //this is for updating the position of cols
                dispatch(updateManyProcessesAction(id, { source_col_index: processList[source.index]._id, dest_col_index: processList[dest.index]._id }))
            } else { //this is for updating position of 2 issues in the same cols
                const getAllIssuesBelongToProcess = sprintInfo?.issue_list?.filter(issue => getValueOfObjectFieldInIssue(issue, 'issue_type')?._id?.toString() === source?.droppableId && getValueOfObjectFieldInIssue(issue, 'current_sprint')?._id?.toString() === sprintId)
                const sourceIndexInProject = getAllIssuesBelongToProcess[source.index]
                const destIndexInProject = getAllIssuesBelongToProcess[dest.index]
                if (sourceIndexInProject && destIndexInProject) {
                    dispatch(updateSprintAction(
                        sprintId,
                        { issue_source_index: sprintInfo?.issue_list.findIndex(issue => issue._id.toString() === sourceIndexInProject._id.toString()), issue_dest_index: sprintInfo?.issue_list.findIndex(issue => issue._id.toString() === destIndexInProject._id.toString()) },
                        id,
                        null,
                        null,
                        null
                    ))
                }
            }
        } else {
            const getSourceTypeIndex = processList.findIndex(process => process._id === source.droppableId)
            const getIssue = sprintInfo.issue_list.filter(issue => getValueOfObjectFieldInIssue(issue, "issue_type")._id === processList[getSourceTypeIndex]._id)[source.index]
            const getDestTypeIndex = processList.findIndex(process => process._id === dest.droppableId)
            dispatch({
                type: DISPLAY_LOADING
            })
            if (Number.isInteger(getSourceTypeIndex) && getIssue && Number.isInteger(getDestTypeIndex)) {
                //check status of issue type is done or not
                dispatch(updateInfoIssue(getIssue._id, id, { issue_type: dest.droppableId }, processList[getSourceTypeIndex].name_process, processList[getDestTypeIndex].name_process, userInfo.id, "updated", "type", projectInfo, userInfo))
            }
            await delay(1000)

            if (sprintId !== 'board') {
                dispatch(GetSprintAction(sprintId))
            }
            dispatch({
                type: HIDE_LOADING
            })
        }
    }

    //type là loại được chọn để hiển thị (tất cả vấn đề / các vấn đề thuộc user)
    const renderIssue = (allIssues, type, processId, limitcol) => {
        if (sprintInfo === null || !allIssues) return <></>
        var listIssues = []
        var issuesInProjectAfterSearching = searchingIssuesValidConditions(searchIssue, allIssues)
        if (issuesInProjectAfterSearching.findIndex(issue => getValueOfNumberFieldInIssue(issue, 'issue_status') === 4) !== -1) {
            listIssues = issuesInProjectAfterSearching?.filter(issue => {
                if (getValueOfNumberFieldInIssue(issue, 'issue_status') === 4 && type === 'subtask') {
                    const getParentId = getValueOfObjectFieldInIssue(issue, 'parent')?._id
                    if (getParentId && issuesInProject?.findIndex(currentIssue => currentIssue._id?.toString() === getParentId && getValueOfArrayObjectFieldInIssue(currentIssue, 'current_sprint')?._id?.toString() === sprintId?.toString())) {
                        return true
                    }
                }
            })
        } else {
            listIssues = [...issuesInProjectAfterSearching]
        }

        var loopIssues = renderIssuesWithMyIssues(listIssues
            ?.filter((issue, index) => processId === getValueOfObjectFieldInIssue(issue, "issue_type")?._id), searchMyIssue)

        if (Number.isInteger(limitcol) && loopIssues?.length > limitcol) {
            loopIssues = [...loopIssues?.splice(0, limitcol)]
        }

        const issueTags = loopIssues.map((issue, index) => {
            return <Draggable draggableId={issue?._id} index={index} key={issue?._id}>
                {(provided) => {
                    return <div
                        key={issue._id}
                        className="list-group-item p-0"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        onClick={async (e) => {
                            //if target contains button setting => hide open modal
                            if (!(e.target.className.includes("fa-ellipsis-h") || e.target.className.includes("ant-btn"))) {
                                dispatch({
                                    type: DISPLAY_LOADING
                                })

                                dispatch(displayComponentInModalInfo(<InfoModal
                                    issueIdForIssueDetail={issue._id}
                                    userInfo={userInfo}
                                    colLeft={8}
                                    colRight={4}
                                    height={630}
                                    displayNumberCharacterInSummarySubIssue={10}
                                />, 1200))

                                //dispatch event to update viewed issue in auth service
                                dispatch(updateUserInfo(userInfo?.id, { viewed_issue: issue._id }))

                                await delay(500)
                                dispatch({
                                    type: HIDE_LOADING
                                })
                            }
                        }}
                        onKeyDown={() => { }}>
                        <div className={`${issue?.isFlagged ? "isFlagged" : ""}`} style={{ cursor: 'pointer', backgroundColor: issue?.isFlagged ? "#F1CA45" : "#ffff", height: '100%', width: '100%', padding: '10px' }}>
                            <div className='d-flex justify-content-between'>
                                {/* Render Summary */}
                                {onEditSummaryIssue === issue._id ? <div style={{ position: 'relative' }}>
                                    <Input onClick={(e) => {
                                        e.stopPropagation();
                                    }} onChange={(e) => { setEditSummaryIssue(e.target.value) }} defaultValue={getValueOfStringFieldInIssue(issue, "summary")} value={editSummaryIssue} style={{ borderRadius: 0 }} />
                                    <div className='d-flex' style={{ position: 'absolute', right: 0, zIndex: 9999 }}>
                                        <Button onClick={(e) => {
                                            e.stopPropagation()
                                            if (editSummaryIssue.trim() !== "") {
                                                dispatch(updateInfoIssue(issue._id, issue.project_id, { summary: editSummaryIssue.trim() }, null, null, userInfo.id, "updated", "summary", projectInfo, userInfo))
                                            }
                                            setOnEditSummaryIssue('')
                                            setEditSummaryIssue('')
                                        }} className='mr-1'><i className="fa fa-check"></i></Button>
                                        <Button onClick={(e) => {
                                            e.stopPropagation()
                                            setOnEditSummaryIssue('')
                                            setEditSummaryIssue('')
                                        }}><i className="fa fa-times"></i></Button>
                                    </div>
                                </div> : <NavLink
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setOnEditSummaryIssue(issue._id)
                                    }} className='issues-summary-dashboard-hover'
                                    style={{ padding: '5px 5px 5px 0', color: '#000', fontWeight: 'normal', width: 'fit-content', textDecoration: getValueOfObjectFieldInIssue(issue, 'issue_type').type_process === 'done' ? "line-through" : "none" }}>
                                    {getValueOfStringFieldInIssue(issue, "summary")?.length > 15 ? `${getValueOfStringFieldInIssue(issue, "summary")?.substring(0, 15)}...` : getValueOfStringFieldInIssue(issue, "summary")} <i className="fa fa-pen ml-2 hide-items d-none" style={{ fontSize: 12 }}></i>
                                </NavLink>}
                                <div className="dropdown">
                                    <Button onClick={(e) => {
                                        if (!e.target?.className?.includes("fa-ellipsis-h") || !e.target?.className?.includes("ant-btn")) {
                                            return
                                        } else {
                                            e.stopPropagation()
                                        }
                                    }} className='hide-items d-none' data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                        {/* Setting button for this issue */}
                                        <i style={{ fontSize: 20 }} className="fa fa-ellipsis-h"></i>
                                    </Button>
                                    <div className="dropdown-menu">
                                        <a className="dropdown-item" href="##" onClick={(e) => {
                                            e.stopPropagation()
                                            CopyLinkButton(`${domainName}/projectDetail/${id}/issues/issue-detail/${issue._id}`)
                                        }}>Copy issue link</a>
                                        <a className="dropdown-item" href="##" onClick={(e) => {
                                            e.stopPropagation()
                                            CopyLinkButton(`${projectInfo?.key_name}-${issue.ordinal_number}`)
                                        }}>Copy issue key</a>
                                        <div className="dropdown-divider" />
                                        {
                                            !issue?.isFlagged ? <a className="dropdown-item" href="##" onClick={(e) => {
                                                e.stopPropagation()
                                                dispatch(displayComponentInModal(<AddFlagModal editCurrentIssue={issue} projectInfo={projectInfo} userInfo={userInfo} />, 1024, <h4><i style={{ fontSize: 25, color: '#FF5630' }} className="fa fa-flag mr-3"></i> Add Flag</h4>))
                                            }}>Add flag</a> : <a className="dropdown-item" href="##" onClick={(e) => {
                                                e.stopPropagation()
                                                dispatch(updateInfoIssue(issue._id, issue.project_id._id, { isFlagged: false }, null, null, userInfo.id, "canceled", "flag", projectInfo, userInfo))
                                            }}>Remove flag</a>
                                        }
                                        <a className="dropdown-item" href="##">Link Issue</a>
                                        <a className="dropdown-item" href="##">Change Parent</a>
                                        <div className="dropdown-divider" />
                                        <a className="dropdown-item" href="##">Delete</a>
                                    </div>
                                </div>
                            </div>

                            {/* Render Epic */}
                            <div>
                                {getValueOfObjectFieldInIssue(issue, "epic_link") ? <Tag className='mt-1 mb-1' style={{ borderRadius: 0 }} color={getValueOfObjectFieldInIssue(issue, "epic_link")?.tag_color}>
                                    <span style={{ color: 'black' }}>{getValueOfObjectFieldInIssue(issue, "epic_link")?.epic_name}</span>
                                </Tag> : <></>}
                            </div>

                            <div className="block" style={{ display: 'flex' }}>
                                <div className="block-left d-flex align-items-center">
                                    <span className='mr-2'>{projectInfo?.key_name}-{issue?.ordinal_number}</span>
                                    {iTagForIssueTypes(getValueOfNumberFieldInIssue(issue, "issue_status"), null, null, projectInfo?.issue_types_default)}
                                    {iTagForPriorities(getValueOfNumberFieldInIssue(issue, "issue_priority"), null, null)}
                                </div>
                                <div className="block-right" style={{ display: 'flex', alignItems: 'center' }}>
                                    {issue?.isFlagged ? <i style={{ fontSize: 15, color: '#FF5630' }} className="fa fa-flag mr-3"></i> : <></>}
                                    {getValueOfObjectFieldInIssue(issue, "issue_type")?.type_process === 'done' ? <span className='mr-2 font-weight-bold'><i style={{ color: 'green' }} className="fa fa-check"></i></span> : <></>}
                                    {onEditStoryPointIssue === issue._id ? <div style={{ position: 'relative' }}>
                                        <InputNumber onClick={(e) => e.stopPropagation()} onChange={(value) => { setEditStoryPointIssue(value) }} defaultValue={getValueOfNumberFieldInIssue(issue, "story_point")} value={editStoryPointIssue} style={{ borderRadius: 0 }} />
                                        <div className='d-flex' style={{ position: 'absolute', right: 0, zIndex: 9999 }}>
                                            <Button onClick={(e) => {
                                                e.stopPropagation()
                                                if (parseInt(editStoryPointIssue) && editStoryPointIssue > 0) {
                                                    dispatch(updateInfoIssue(issue._id, issue.project_id, { story_point: editStoryPointIssue }, getValueOfNumberFieldInIssue(issue, "story_point") ? getValueOfNumberFieldInIssue(issue, "story_point").toString() : "None", editStoryPointIssue.toString(), userInfo.id, "updated", "story point", projectInfo, userInfo))
                                                } else {
                                                    showNotificationWithIcon('error', '', 'Input value is invalid')
                                                }
                                                setOnEditStoryPointIssue('')
                                                setEditStoryPointIssue(null)
                                            }} className='mr-1'><i className="fa fa-check"></i></Button>
                                            <Button onClick={(e) => {
                                                e.stopPropagation()
                                                setOnEditStoryPointIssue('')
                                                setEditStoryPointIssue(null)
                                            }}><i className="fa fa-times"></i></Button>
                                        </div>
                                    </div> : <div className='hide-items d-none'>
                                        <Avatar onClick={(e) => {
                                            e.stopPropagation()
                                            setOnEditStoryPointIssue(issue._id)
                                        }} style={{ width: 20, height: 20 }} className='mr-2'><span className='d-flex'>{getValueOfNumberFieldInIssue(issue, "story_point") ? getValueOfNumberFieldInIssue(issue, "story_point") : "-"}</span></Avatar>
                                    </div>}

                                    <div className="avatar-group" style={{ position: 'relative' }}>
                                        {/* them avatar cua cac assignees */}
                                        {
                                            getValueOfArrayObjectFieldInIssue(issue, "assignees")?.length > 0 ? <Avatar.Group>
                                                {getValueOfArrayObjectFieldInIssue(issue, "assignees")?.map((user, index) => {
                                                    if (index === 3) {
                                                        return <Avatar key={issue._id} size={30}><span className='d-flex'>...</span></Avatar>
                                                    } else if (index <= 2) {
                                                        return <Avatar size={30} key={issue._id} src={user.avatar} />
                                                    }
                                                    return null
                                                })}
                                            </Avatar.Group> : <Avatar onClick={(e) => {
                                                e.stopPropagation()
                                                setOnEditAssigneesIssue(issue._id)
                                            }} size="small" icon={<UserOutlined />} />
                                        }
                                        {onEditAssigneesIssue === issue?._id ? <div style={{ position: 'absolute', zIndex: 9999, right: '-100%' }}>
                                            <Select onClick={(e) => e.stopPropagation()} style={{ width: '200px', borderRadius: 0 }} options={renderOptionAssignee(issue)} />
                                            <div style={{ right: 0, position: 'absolute' }}>
                                                <Button onClick={(e) => {
                                                    e.stopPropagation()

                                                    setOnEditAssigneesIssue('')
                                                }} className='mr-1'><i className="fa fa-check"></i></Button>
                                                <Button onClick={(e) => {
                                                    e.stopPropagation()
                                                    setOnEditAssigneesIssue('')
                                                }}><i className="fa fa-times"></i></Button>
                                            </div>
                                        </div> : <></>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                }}
            </Draggable>
        })
        return <div>
            {issueTags}
            {openCreatingIssue !== processId ? (typeof projectInfo?.sprint_id === 'string' && type !== 'subtask' ? <NavLink onClick={() => {
                setOpenCreatingIssue(processId)
                setSummary('')
                setIssueStatus(0)
            }} className={`dashboard-creating-issue ${issueTags?.length === 0 || issueTags?.length <= 3 ? 'd-none' : 'd-block'}`} style={{ padding: '10px 20px', display: 'block', width: '100%', color: 'black', textDecoration: 'none' }}><i className="fa fa-plus mr-2"></i>Create issue</NavLink> : <></>) :
                <div
                    style={{ height: 100, backgroundColor: '#ffff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', margin: 5, border: '2px solid #2684FF' }}>
                    <Input className='dashboard-edit-input-ant' onChange={(e) => {
                        setSummary(e.target.value)
                    }} style={{ border: 'none', borderRadius: 0 }} placeholder='What need to be done?' />
                    <div className='d-flex justify-content-between' style={{ padding: '0 10px 10px 10px' }}>
                        <Select className='dashboard-edit-select-ant' style={{ border: 'none !important', borderRadius: 0 }}
                            defaultValue={issueTypeWithoutOptions(projectInfo?.issue_types_default)[0].value}
                            onChange={(value, option) => {
                                setIssueStatus(value)
                            }}
                            options={issueTypeWithoutOptions(projectInfo?.issue_types_default)} />
                        <Button
                            onClick={() => {
                                setOpenCreatingIssue('')
                                setIssueStatus(0)
                                setSummary('')
                            }}
                            style={{ border: 'none', borderRadius: 0 }}>Cancel</Button>
                        {summary.trim() === "" ? <Button disabled style={{ border: 'none', borderRadius: 0 }}>Create</Button> : <Button onClick={(e) => {
                            e.stopPropagation()
                            e.preventDefault()
                            dispatch(createIssue(attributesFiltering(projectInfo, {
                                project_id: id,
                                issue_status: issueStatus,
                                summary: summary,
                                issue_type: processList.length === 0 ? null : processId,
                                current_sprint: sprintId,
                                creator: userInfo.id
                            }),
                                id,
                                userInfo.id,
                                sprintId,
                                null,
                                projectInfo,
                                userInfo
                            ))
                            setOpenCreatingIssue('')
                            setIssueStatus(0)
                            setSummary('')
                        }} type='primary' style={{ border: 'none', borderRadius: 0 }}>Create</Button>}
                    </div>
                </div>}
        </div>
    }

    const renderSettings = () => {
        return <div className={`card info-settings mr-1`} style={{ width: '25rem', display: onChangeSettings ? 'block' : 'none', margin: '0px 10px', height: 'fit-content', marginTop: 7 }}>
            <div className='d-flex justify-content-between' style={{ padding: '15px 10px' }}>
                <h6 className='m-0'>View Settings</h6>
                <i className="fa-solid fa-xmark" onClick={() => {
                    setOnChangeSettings(!onChangeSettings)
                }}></i>
            </div>
            <div className='row ml-2 mb-2'>
                <span className='col-8'>Versions</span>
                <Switch style={{ width: '10%' }} className='col-1' onChange={() => {
                    updateIssueConfig(onChangeIssueStatus, onChangeKey, onChangeIssueType, onChangeIssuePriority, onChangeAssignees, onChangeStoryPoint, onChangeParent)
                }} />
            </div>
            <div className='row ml-2 mb-2'>
                <span className='col-8'>Epics</span>
                <Switch className='col-1' onChange={() => {
                    updateIssueConfig(!onChangeIssueStatus, onChangeKey, onChangeIssueType, onChangeIssuePriority, onChangeAssignees, onChangeStoryPoint, onChangeParent)
                }} />
            </div>
            <hr />
            <div>
                <h6 style={{ padding: '0 10px' }}>Fields</h6>
                <div className='row ml-2 mb-2'>
                    <span className='col-8'>Issue Status</span>
                    <Switch className='col-1' onChange={() => {
                        updateIssueConfig(!onChangeIssueStatus, onChangeKey, onChangeIssueType, onChangeIssuePriority, onChangeAssignees, onChangeStoryPoint, onChangeParent)
                        setOnChangeIssueStatus(!onChangeIssueStatus)
                    }} value={onChangeIssueStatus} />
                </div>

                <div className='row ml-2 mb-2'>
                    <span className='col-8'>Issue Key</span>
                    <Switch className='col-1' onChange={() => {
                        updateIssueConfig(onChangeIssueStatus, !onChangeKey, onChangeIssueType, onChangeIssuePriority, onChangeAssignees, onChangeStoryPoint, onChangeParent)

                        setOnChangeKey(!onChangeKey)
                    }} value={onChangeKey} />
                </div>
                <div className='row ml-2 mb-2'>
                    <span className='col-8'>Issue Type</span>
                    <Switch className='col-1' onChange={() => {
                        updateIssueConfig(onChangeIssueStatus, onChangeKey, !onChangeIssueType, onChangeIssuePriority, onChangeAssignees, onChangeStoryPoint, onChangeParent)

                        setOnChangeIssueType(!onChangeIssueType)
                    }} value={onChangeIssueType} />
                </div>
                <div className='row ml-2 mb-2'>
                    <span className='col-8'>Epic</span>
                    <Switch className='col-1' onChange={() => {
                        updateIssueConfig(!onChangeIssueStatus, onChangeKey, onChangeIssueType, onChangeIssuePriority, onChangeAssignees, onChangeStoryPoint, onChangeParent)

                        setOnChangeEpics(!onChangeEpics)
                    }} value={onChangeEpics} />
                </div>
                <div className='row ml-2 mb-2'>
                    <span className='col-8'>Priority</span>
                    <Switch className='col-1' onChange={() => {
                        updateIssueConfig(onChangeIssueStatus, onChangeKey, onChangeIssueType, !onChangeIssuePriority, onChangeAssignees, onChangeStoryPoint, onChangeParent)

                        setOnChangeIssuePriority(!onChangeIssuePriority)
                    }} value={onChangeIssuePriority} />
                </div>
                <div className='row ml-2 mb-2'>
                    <span className='col-8'>Assignees</span>
                    <Switch className='col-1' onChange={() => {
                        updateIssueConfig(onChangeIssueStatus, onChangeKey, onChangeIssueType, onChangeIssuePriority, !onChangeAssignees, onChangeStoryPoint, onChangeParent)
                        setOnChangeAssignees(!onChangeAssignees)
                    }} value={onChangeAssignees} />
                </div>
                <div className='row ml-2 mb-2'>
                    <span className='col-8'>Story Point</span>
                    <Switch className='col-1' onChange={() => {
                        updateIssueConfig(onChangeIssueStatus, onChangeKey, onChangeIssueType, onChangeIssuePriority, onChangeAssignees, !onChangeStoryPoint, onChangeParent)
                        setOnChangeStoryPoint(!onChangeStoryPoint)
                    }} value={onChangeStoryPoint} />
                </div>
                <div className='row ml-2 mb-2'>
                    <span className='col-8'>Parent</span>
                    <Switch className='col-1' onChange={() => {
                        updateIssueConfig(onChangeIssueStatus, onChangeKey, onChangeIssueType, onChangeIssuePriority, onChangeAssignees, onChangeStoryPoint, !onChangeParent)
                        setOnChangeParent(!onChangeParent)
                    }} value={onChangeParent} />
                </div>
            </div>
        </div>
    }

    const renderProcessList = (arrs) => {
        if (!arrs) return []
        const arrsResult = []
        arrs?.forEach(issue => {
            const index = arrsResult.findIndex(process => process.process_name === getValueOfObjectFieldInIssue(issue, 'issue_type')?.name_process)
            if (index !== -1) {
                arrsResult[index].process_count += 1
            } else {
                arrsResult.push({
                    process_name: getValueOfObjectFieldInIssue(issue, 'issue_type')?.name_process,
                    process_color: getValueOfObjectFieldInIssue(issue, 'issue_type')?.tag_color,
                    process_count: 1
                })
            }
        })
        return arrsResult
    }

    const renderTotalProcessList = (arrs) => {
        const total = renderProcessList(arrs)?.reduce((total, value) => {
            return total + value.process_count
        }, 0)
        return total !== 0 ? total : 0
    }

    const renderPercentOfCurrentProcess = (arrs, type) => {
        const result = renderProcessList(arrs)?.find(process => process.process_name?.toLowerCase() === type)
        return result ? result?.process_count : 0
    }

    const renderProgressForInsight = (arrs) => {
        return <div className="progress process-dashboard">
            {renderProcessList(arrs).map(process => {
                return <div
                    className="progress-bar"
                    role="progressbar"
                    style={{
                        width: `${(process.process_count / renderTotalProcessList(arrs)) * 100}%`,
                        backgroundColor: process.process_color
                    }}
                    aria-valuenow={(process.process_count / renderTotalProcessList(arrs)) * 100}
                    aria-valuemin={0}
                    aria-valuemax={100}
                />
            })}
        </div>
    }

    const renderInsights = () => {
        return <div className={`card info-ingishts mr-1`} style={{
            width: '28rem',
            overflowY: 'auto',
            display: onChangeInsights ? 'block' : 'none',
            padding: 15,
            margin: '0px 10px',
            height: 600,
            marginTop: 7
        }}>
            <h5>Sprint insights</h5>
            <span style={{ fontSize: 15 }}>View your sprint health and progress towards your goals.</span>
            <span className='font-weight-bold d-block mt-1'>Sprint: <span style={{ fontWeight: 'normal' }}>{sprintInfo?.sprint_name}</span></span>
            <div className="card mt-2">
                <div className="card-title mt-2 ml-2" style={{ fontSize: 16 }}>
                    Issues for attention
                </div>
                <div className="card-body" style={{ padding: '0 10px' }}>
                    There are no issues for attention right now. Once you have stuck, blocked or flagged issues, this is where you’ll find them.
                </div>
            </div>
            <div className="card mt-2">
                <div className="card-title mb-1 ml-2 mt-2" style={{ fontSize: 16 }}>
                    Sprint progress
                </div>
                {
                    renderPercentOfCurrentProcess(sprintInfo?.issue_list, 'done') !== 0 && renderTotalProcessList(sprintInfo?.issue_list) !== 0 ? <div className='card-body' style={{ padding: '0 10px' }}>
                        <div className='d-flex align-items-center'>
                            {renderProgressForInsight(sprintInfo?.issue_list)}
                            <span className='ml-2' style={{ width: 100 }}>{Math.round((renderPercentOfCurrentProcess(sprintInfo?.issue_list, 'done') / renderTotalProcessList(sprintInfo?.issue_list)) * 100)}% done</span>
                        </div>
                        <div className='d-flex flex-wrap'>
                            {
                                renderProcessList(sprintInfo?.issue_list)?.map(process => {
                                    return <div className='d-flex flex-column ml-2 text-center'>
                                        <span style={{ width: 'max-content', color: '#6b778c', fontSize: 12 }}>{process.process_name}</span>
                                        <span style={{ fontSize: 20, color: process.process_color }}>{Math.round(((renderPercentOfCurrentProcess(sprintInfo?.issue_list, process.process_name?.toLowerCase()) / renderTotalProcessList(sprintInfo?.issue_list)) * 100))}%</span>
                                    </div>
                                })
                            }
                        </div>
                    </div> : <></>
                }
            </div>

            <div className="card mt-2">
                <div className="card-title mb-1 ml-2 mt-2" style={{ fontSize: 16 }}>
                    Epic progress
                </div>
                <span>This sprint is working towards {epicList?.length} epics</span>
                {
                    epicList?.map(epicInfo => {
                        const convertedIssues = epicInfo.issue_list.filter(issue => getValueOfObjectFieldInIssue(issue, 'current_sprint')?.toString() === sprintId).map(issue => issuesInProject.find(current_issue => current_issue._id === issue._id))

                        const doneProgress = renderPercentOfCurrentProcess(convertedIssues, 'done')
                        const totalProgress = renderTotalProcessList(convertedIssues)
                        return <div className='card-body' style={{ padding: '0 10px', margin: '5px 0' }}>
                            <div className='d-flex justify-content-between'>
                                <NavLink to={`${domainName}/projectDetail/${id}/epics/epic-detail/${epicInfo._id}`}>{epicInfo.epic_name}</NavLink>
                                <span>{Math.round(doneProgress !== 0 && totalProgress !== 0 ? (doneProgress / totalProgress) * 100 : 0)}% done</span>
                            </div>
                            <div className='d-flex align-items-center mt-2'>
                                {renderProgressForInsight(convertedIssues)}
                            </div>
                            <div className='d-flex flex-wrap'>
                                {
                                    renderProcessList(convertedIssues)?.map(process => {
                                        return <div className='d-flex flex-column ml-2 text-center'>
                                            <span style={{ width: 'max-content', color: '#6b778c', fontSize: 12 }}>{process.process_name}</span>
                                            <span style={{ fontSize: 20, color: process.process_color }}>{Math.round(((renderPercentOfCurrentProcess(convertedIssues, process.process_name?.toLowerCase()) / renderTotalProcessList(convertedIssues)) * 100))}%</span>
                                        </div>
                                    })
                                }
                            </div>
                        </div>
                    })
                }
            </div>
        </div>
    }

    const updateIssueConfig = (issue_status_field, key_field, issue_type_field, epic_field, version_field, issue_priority_field, assignees_field, story_point_field, parent_field) => {
        dispatch(updateProjectAction(id, {
            issue_config: {
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

    const renderHeaderProcesses = (process) => {
        return <div
            className='d-flex justify-content-between align-items-center process-header'
            style={{
                backgroundColor: process.tag_color,
                color: 'white', padding: '3px 10px'
            }}>
            {
                onEditNameProcess === process?._id ? <div style={{ position: 'relative' }}>
                    <Input onChange={(e) => { setEditNameProcess(e.target.value) }} defaultValue={process?.name_process} style={{ borderRadius: 0 }} />
                    <div className='d-flex' style={{ position: 'absolute', right: 0, zIndex: 9999 }}>
                        <Button onClick={() => {
                            if (editNameProcess.trim() !== "") {
                                dispatch(UpdateProcessAction(process._id, id, { name_process: editNameProcess.toUpperCase() }))
                            }
                            setOnEditNameProcess('')
                            setEditNameProcess('')
                        }} className='mr-1'><i className="fa fa-check"></i></Button>
                        <Button onClick={() => {
                            setOnEditNameProcess('')
                            setEditNameProcess('')
                        }}><i className="fa fa-times"></i></Button>
                    </div>
                </div> : <div className="card-header d-flex align-items-center hover-name_process-dashboard" style={{ color: 'black', padding: '5px 10px', borderRadius: 0 }}>
                    <div>
                        <NavLink onClick={() => {
                            setOnEditNameProcess(process._id)
                        }} style={{ textDecoration: 'none', color: '#454545' }}>{process?.name_process}</NavLink>
                        <Avatar className='ml-2' size={25}><span style={{ fontSize: 12, display: 'flex' }}>{sprintInfo !== null && Object.keys(sprintInfo).length !== 0 ? sprintInfo?.issue_list?.filter(issue => {
                            return getValueOfObjectFieldInIssue(issue, "issue_type")?._id === process?._id && getValueOfObjectFieldInIssue(issue, "issue_type") !== 4
                        }).length : '0'}</span></Avatar>
                        {process?.type_process === 'done' ? <span className='ml-2 font-weight-bold'><i style={{ color: 'green' }} className="fa fa-check"></i></span> : <></>}
                    </div>
                    <div>
                        {Number.parseInt(process?.limited_number_issues) ? <span style={{ marginLeft: 10, fontSize: 12, backgroundColor: '#fbf7f7', padding: '2px 5px' }}>MAX: {process?.limited_number_issues?.toString()}</span> : <></>}
                    </div>
                </div>
            }
            <div className='dropdown'>
                <button style={{ height: '30px', display: 'none' }} className='btn btn-light p-0 pl-3 pr-3 btn-dashboard-setting' type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <i className="fa-sharp fa-solid fa-bars"></i>
                </button>
                <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                    <button onClick={() => {
                        setEditLimitColumnProcess(process)
                        setIsOpenModalSetColumn(true)
                    }} className="dropdown-item">Set column limit</button>
                    <button className="dropdown-item" onClick={() => {
                        const checkIssueExisted = sprintInfo?.issue_list?.filter(issue => getValueOfObjectFieldInIssue(issue, "issue_type")?._id === process._id)
                        if (checkIssueExisted?.length > 0) {
                            dispatch(displayComponentInModal(<DeleteProcessModal
                                issuesInProject={issuesInProject}
                                issue_list={checkIssueExisted.map(issue => issue._id)}
                                processList={processList}
                                sprintInfo={sprintInfo}
                                projectInfo={projectInfo}
                                userInfo={userInfo}
                                process={process} />, 500, ''
                            ))
                        } else {
                            dispatch(deleteProcessAction(process._id, id))
                        }
                    }}>Delete</button>
                    <button onClick={() => {
                        //get old done column and proceed to delete it's status
                        const getOldDoneCol = processList?.find(col => col.type_process === 'done')
                        dispatch(UpdateProcessAction(getOldDoneCol?._id, id, { type_process: 'normal' }))
                        dispatch(UpdateProcessAction(process._id, id, { type_process: 'done' }))
                    }} className="dropdown-item">Update to done column</button>
                </div>
            </div>
        </div>
    }

    const renderRowProcessesWithoutSearching = (index, process, issueList) => {
        return <Droppable droppableId={process._id}>
            {(provided) => {
                return <div className="list-group list-group-flush" style={{ overflowY: 'auto', height: '33rem', scrollbarWidth: 'none' }} ref={provided.innerRef} {...provided.droppableProps}>
                    {index === 0 && sprintId === 'board' ? <div className='d-flex flex-column align-items-center ml-2 mr-2 mt-5'>
                        <img src="https://jira-frontend-bifrost.prod-east.frontend.public.atl-paas.net/assets/agile.52407441.svg" style={{ height: 150, width: 150 }} alt="img-backlog" />
                        <p style={{ fontWeight: 'bold', marginBottom: 5 }}>Get started in the backlog</p>
                        <span style={{ fontWeight: 'normal', textAlign: 'center' }}>Plan and start a sprint to see issues here.</span>
                        <Button className='mt-2' danger onClick={() => {
                            navigate(`/projectDetail/${id}/backlog`)
                        }}>Go to Backlog</Button>
                    </div> : renderIssue(issueList, '', process._id, process?.limited_number_issues)}
                    {provided.placeholder}
                </div>
            }}
        </Droppable>
    }

    const renderRowProcessesWithSearching = (type, process, issueList) => {
        return <Droppable droppableId={`searching-${process._id}`}>
            {(provided) => {
                return <div className="list-group list-group-flush" style={{ overflowY: 'auto', height: '33rem', scrollbarWidth: 'none' }} ref={provided.innerRef} {...provided.droppableProps}>
                    {renderIssue(issueList, type, process._id, process?.limited_number_issues)}
                    {provided.placeholder}
                </div>
            }}
        </Droppable>
    }

    const renderRowData = (issueList, type) => {
        return processList?.sort((firstProcess, secondProcess) => {
            return firstProcess.index_col - secondProcess.index_col
        })?.map((process) => {
            return <div
                style={{ overflowY: 'auto', scrollbarWidth: 'none', height: 350 }}
                className="card">
                <div
                    style={{
                        width: 'max-content',
                        minWidth: '16rem',
                        fontWeight: 'bold',
                        scrollbarWidth: 'none',
                        overflowY: 'none'
                    }}>
                    {renderRowProcessesWithSearching(type, process, issueList)}
                </div>
            </div>
        })
    }

    const { token } = theme.useToken();

    const panelStyle = {
        marginBottom: 24,
        background: 'transparent',
        borderRadius: token.borderRadiusLG,
        border: 'none'
    }

    const renderRowProcessesWithSearchingTemplate = (process) => {
        const getIssuesWithSubtask = issuesInProject?.filter(issue => issue.sub_issue_list.length > 0)
        const getIssuesWithoutSubtask = issuesInProject
            ?.filter(issue => issue.sub_issue_list.length === 0 && getValueOfObjectFieldInIssue(issue, 'current_sprint')?._id?.toString() === sprintId.toString())
        return <Collapse
            bordered={false}
            defaultActiveKey={['-1']}
            expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
            style={{
                background: token.colorBgContainer,
                marginTop: 50,
                height: '90vh',
                overflowY: 'auto',
                scrollbarWidth: 'none'
            }}
            items={getItems(getIssuesWithSubtask, getIssuesWithoutSubtask, process)}
        />
    }

    const getItems = (getIssuesWithSubtask, getIssuesWithoutSubtask, process) => {
        const renderIssuesContainSubtask = getIssuesWithSubtask
            ?.filter(issue => {
                if (searchIssue.types.length === 0 || (searchIssue.types.includes(getValueOfObjectFieldInIssue(issue, 'issue_type')?._id?.toString()))) {
                    return true
                }
                return false
            })
            ?.filter(issue => {
                if (searchIssue.statuses.length === 0 || (searchIssue.statuses.includes(getValueOfNumberFieldInIssue(issue, 'issue_status')))) {
                    return true
                }
                return false
            })
            ?.filter(issue => {
                const epicInfo = getValueOfObjectFieldInIssue(issue, 'epic_link')
                if (searchIssue.epics.length === 0 || (searchIssue.epics.includes(epicInfo ? epicInfo?._id?.toString() : null))) {
                    return true
                }

                return false
            })
            ?.map((issue, index) => {
                const summary = getValueOfStringFieldInIssue(issue, 'summary')
                return {
                    key: `${index}`,
                    label: <div className='d-flex'>
                        <span>{issueTypeWithoutOptions(projectInfo?.issue_types_default)[getValueOfNumberFieldInIssue(issue, 'issue_status')]?.label}</span>
                        <span className='font-weight-bold mr-2'>{projectInfo?.key_name}-{issue.ordinal_number}</span>
                        <span className='mr-2'>{summary?.length > 50 ? summary.substring(0, 30) + '...' + summary.substring(summary.length - 5) : summary}</span>
                        <span>( {issue?.sub_issue_list?.length} subtasks )</span>
                        {getValueOfObjectFieldInIssue(issue, 'epic_link') ? <Tag className='ml-2' color={getValueOfObjectFieldInIssue(issue, 'epic_link')?.tag_color}>{getValueOfObjectFieldInIssue(issue, 'epic_link')?.epic_name}</Tag> : <></>}
                        {getValueOfObjectFieldInIssue(issue, 'issue_type') ? <Tag className='ml-2' color={getValueOfObjectFieldInIssue(issue, 'issue_type')?.tag_color}>{getValueOfObjectFieldInIssue(issue, 'issue_type')?.name_process}</Tag> : <></>}
                    </div>,
                    children: <div className='d-flex'>
                        {renderRowData(issue.sub_issue_list, 'subtask')}
                    </div>,
                    style: panelStyle,
                }
            })

        var data = []

        if (!searchIssue.types.includes(4)) {
            data = renderIssuesContainSubtask?.concat([{
                key: '-1',
                label: <span> Everything else ({getIssuesWithoutSubtask?.length}) </span>,
                children: <div className='d-flex'>
                    {renderRowData(getIssuesWithoutSubtask, '')}
                </div>,
                style: panelStyle,
            }])
        } else {
            data = renderIssuesContainSubtask
        }

        //set limit column

        return data?.length > process?.limited_number_issues && typeof process?.limited_number_issues === 'number'
            ? data?.slice(0, process?.limited_number_issues) : data
    }

    return (
        <div style={{ margin: '0 20px' }}>
            <DrawerHOC />
            <div className="header">
                <Breadcrumb
                    style={{ marginBottom: 10 }}
                    items={[
                        {
                            title: <a href="/">Projects</a>,
                        },
                        {
                            title: <a href={`/projectDetail/${id}/board`}>{projectInfo?.name_project}</a>,
                        }
                    ]}
                />
            </div>
            <div className='title'>
                <h4>{sprintInfo === null || sprintInfo === undefined || Object?.keys(sprintInfo).length === 0 ? "Dashboard" : sprintInfo.sprint_name}</h4>
                <div className='d-flex align-items-center'>
                    <button className='btn btn-transparent m-0 mr-2' onClick={() => {
                        dispatch(updateProjectAction(id, {
                            marked: !projectInfo?.marked,
                            sprint_id: projectInfo.sprint_id
                        }, navigate))
                    }} style={{ fontSize: '12px' }}>{projectInfo.marked === true ? <i className="fa-solid fa-star" style={{ color: '#ff8b00', fontSize: 15 }}></i> : <i className="fa-solid fa-star" style={{ fontSize: 15 }}></i>}</button>
                    {sprintId && sprintInfo && Object.keys(sprintInfo).length !== 0 ? (dayjs(new Date()).isAfter(dayjs(sprintInfo?.start_date)) || dayjs(new Date()).isSame(dayjs(sprintInfo?.start_date)) ? <Tooltip placement='bottom' title={renderTooltipForRemainingDay(sprintInfo)}>
                        <span className='m-0 mr-2 align-items-center d-flex bg-light' style={{ padding: '10px 20px' }}>
                            <i className="fa fa-clock mr-2"></i>{calculateTaskRemainingTime(dayjs(new Date()), dayjs(sprintInfo.end_date))}
                        </span>
                    </Tooltip> : <Tooltip placement='bottom' title={renderTooltipForStartingDateYet(sprintInfo)}>
                        <span className='m-0 mr-2 align-items-center d-flex bg-light font-weight-bold' style={{ padding: '10px 20px' }}>Project start date not yet</span>
                    </Tooltip>) : <></>}
                    {sprintId && sprintInfo && Object.keys(sprintInfo).length !== 0 ? <Button className='m-0 mr-2' type='primary' onClick={() => {
                        dispatch(displayComponentInModal(<CompleteSprintModal sprintInfo={sprintInfo} processList={processList} id={id} userInfo={userInfo} sprintList={sprintList} projectInfo={projectInfo} />))
                    }}>Complete Sprint</Button> : <></>}
                    <NavLink to="https://github.com/longle11/NT114.O21.MMCL-DACN-MICROSERVICE" target="_blank" style={{ textDecoration: 'none' }}>
                        <Button className='m-0 mr-2' type='primary'>
                            <i className="fab fa-github mr-2"></i>
                            <div>Github Repo</div>
                        </Button>
                    </NavLink>
                    <Button className='m-0 mr-2' type='primary'><i className="fa fa-share mr-2"></i> Share</Button>
                    <div className="dropdown">
                        <Button className='m-0 mr-2' id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <i style={{ fontSize: 20 }} className="fa fa-ellipsis-h"></i>
                        </Button>
                        <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                            {
                                projectInfo?.sprint_id !== null ? <a className="dropdown-item" href="##" onClick={() => {
                                    dispatch(drawer_edit_form_action(<CreateSprint currentSprint={sprintInfo} />, 'Save', '700px'))
                                }}>Edit Sprint</a> : <></>
                            }
                            <a className="dropdown-item" href={`/projectDetail/${id}/workflows`}>Manage Workflow</a>
                        </div>
                    </div>

                </div>
            </div>
            <p>{sprintInfo === null || sprintInfo === undefined || Object?.keys(sprintInfo).length === 0 ? "" : sprintInfo.sprint_goal}</p>
            <div className='d-flex justify-content-between'>
                <div>
                    <MemberProject
                        projectInfo={projectInfo}
                        id={id}
                        processList={processList}
                        userInfo={userInfo}
                        setSearchDashboard={setSearchDashboard}
                        setOnChangeVersion={null}
                        setOnChangeEpic={null}
                        onChangeVersion={null}
                        onChangeEpic={null}
                        searchMyIssue={searchMyIssue}
                        setSearchMyIssue={setSearchMyIssue}
                        searchDashboard={searchDashboard}
                        allIssues={sprintInfo.issue_list}
                        epicList={epicList}
                        versionList={null}
                        typeInterface="scum-dashboard"
                        handleSearchIssue={handleSearchIssue}
                        searchIssue={searchIssue}
                    />

                </div>
                <div className='d-flex'>
                    <div className='mr-1 d-flex align-items-center'>
                        <span style={{ color: '#626F86', fontSize: 11, padding: '0 5px' }}>GROUP BY</span>
                        <div className="dropdown">
                            <Button className="dropdown-toggle" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                None
                            </Button>
                            <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                <a className="dropdown-item" href="#">None</a>
                                <a className="dropdown-item" href="#">Assignee</a>
                                <a className="dropdown-item" href="#">Epic</a>
                                <a className="dropdown-item" href="#">Subtask</a>
                            </div>
                        </div>
                    </div>
                    <Button
                        type={onChangeInsights ? 'primary' : 'default'}
                        onClick={() => {
                            setOnChangeInsights(!onChangeInsights)
                        }}
                        className='mr-1'>
                        <i className="fa fa-chart-line mr-2"></i> Insights
                    </Button>
                    <Button
                        type={onChangeSettings ? 'primary' : 'default'}
                        onClick={() => {
                            setOnChangeSettings(!onChangeSettings)
                        }}><span><i className="fa-solid fa-sliders mr-2"></i> View Settings</span>
                    </Button>
                </div>
            </div>
            <DragDropContext
                onDragStart={(e) => {
                    if (e.draggableId.includes('process')) {
                        setLockDroppable(false)
                    } else {
                        setLockDroppable(true)
                    }
                }}
                onDragEnd={(result) => {
                    handleDragEnd(result)
                }}>
                <div className='d-flex' style={{ height: !searchDashboard ? 1000 : 700, marginTop: 20 }}>
                    <Droppable
                        direction='horizontal'
                        droppableId='process'
                        isDropDisabled={lockDroppable}>
                        {(provided) => {
                            return <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className="content"
                                style={{
                                    overflowX: 'scroll',
                                    overflowY: 'hidden',
                                    height: '78vh',
                                    width: '100%',
                                    display: '-webkit-box',
                                    padding: 0,
                                    margin: '8px 0',
                                    scrollbarWidth: 'none',
                                    backgroundColor: 'white'
                                }}
                            >
                                {<div className='d-flex flex-column'>
                                    <div className='d-flex' style={{ padding: '0 15px' }}>
                                        {processList
                                            ?.sort((firstProcess, secondProcess) => {
                                                return firstProcess.index_col - secondProcess.index_col
                                            })
                                            ?.map((process, index) => {
                                                return <Draggable draggableId={`process-${process?._id?.toString()}`} key={`process-${process?._id?.toString()}`} index={index}>
                                                    {(provided) => {
                                                        return <div ref={provided.innerRef}
                                                            {...provided.dragHandleProps}
                                                            {...provided.draggableProps}>
                                                            <div
                                                                className="card"
                                                                style={{ height: !searchDashboard ? '100%' : 0 }}>
                                                                <div
                                                                    style={{
                                                                        width: 'max-content',
                                                                        minWidth: '16rem',
                                                                        fontWeight: 'bold',
                                                                        scrollbarWidth: 'none',
                                                                        overflowY: 'none'
                                                                    }}>
                                                                    {renderHeaderProcesses(process)}
                                                                    {!searchDashboard ? renderRowProcessesWithoutSearching(index, process, sprintInfo?.issue_list?.map(issue => {
                                                                        return issuesInProject.find(currentIssue => issue._id.toString() === currentIssue._id.toString())
                                                                    })) : <></>}
                                                                </div>
                                                                {provided.placeholder}
                                                            </div>
                                                        </div>
                                                    }}
                                                </Draggable>
                                            })}
                                    </div>
                                    {searchDashboard ? renderRowProcessesWithSearchingTemplate(processList) : <></>}
                                </div>}
                                <div className='add-process'>
                                    <Button style={{ display: !openAddProcess ? "block" : "none" }} onClick={() => {
                                        setOpenAddProcess(true)
                                    }} type="primary"><i className="fa fa-plus"></i></Button>
                                    <div style={{ display: openAddProcess ? "block" : "none" }}>
                                        <Input defaultValue='' value={valueProcess} style={{ width: '100%' }} onChange={(e) => {
                                            setValueProcess(e.target.value)
                                        }} />
                                        <div className='d-flex justify-content-end'>
                                            <Button onClick={() => {
                                                if (valueProcess.trim() !== "") {
                                                    dispatch(CreateProcessACtion({
                                                        project_id: id,
                                                        name_process: valueProcess.toUpperCase()
                                                    }))
                                                    setOpenAddProcess(false)
                                                    setValueProcess('')
                                                } else {
                                                    showNotificationWithIcon('error', '', 'Created failed, please entering again')
                                                }
                                            }} type="primary"><i className="fa fa-check"></i></Button>
                                            <Button onClick={() => {
                                                setOpenAddProcess(false)
                                                setValueProcess('')
                                            }}><i className="fa-solid fa-xmark"></i></Button>
                                        </div>
                                    </div>
                                </div>
                                {provided.placeholder}
                            </div>
                        }}
                    </Droppable>

                    {renderSettings()}

                    {renderInsights()}
                </div>

                <Modal destroyOnClose={true} title="Column limit" open={isOpenModalSetColumn} onOk={handleModalSetColumnOk} onCancel={handleModalSetColumnCancel}>
                    <p>We'll highlight this column if the number of issues in it passes this limit.</p>
                    <div className='d-flex flex-column'>
                        <label>Maximum issues</label>
                        <div className='d-flex'>
                            <InputNumber min={1} style={{ width: '50%', borderRadius: 0 }} defaultValue={editLimitColumnProcess?.limited_number_issues} value={editLimitColumnProcess?.limited_number_issues} onChange={(value) => {
                                setEditLimitColumnProcess({ ...editLimitColumnProcess, limited_number_issues: value })
                            }} />
                            <Button style={{ borderRadius: 0 }} onClick={() => {
                                setEditLimitColumnProcess({ ...editLimitColumnProcess, limited_number_issues: null })
                            }} className='ml-2'>Clear limit</Button>
                        </div>
                    </div>
                </Modal>
            </DragDropContext>
        </div>
    )
}
