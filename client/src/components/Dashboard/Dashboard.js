import React, { useEffect, useRef, useState } from 'react'
import DrawerHOC from '../../HOC/DrawerHOC'
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Avatar, Breadcrumb, Button, Input, InputNumber, Modal, Select, Tag, Tooltip } from 'antd';
import { createIssue, getIssuesBacklog, updateInfoIssue } from '../../redux/actions/IssueAction';
import { CreateProcessACtion, GetProcessListAction, GetProjectAction, GetSprintAction, GetSprintListAction, UpdateProcessAction } from '../../redux/actions/ListProjectAction';
import { updateProjectAction } from '../../redux/actions/CreateProjectAction';
import { CopyLinkButton, issueTypeWithoutOptions, iTagForIssueTypes, iTagForPriorities, renderAssignees } from '../../util/CommonFeatures';
import { showNotificationWithIcon } from '../../util/NotificationUtil';
import dayjs from 'dayjs';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { delay } from '../../util/Delay';
import './Dashboard'
import { UserOutlined } from '@ant-design/icons';
import { DISPLAY_LOADING, HIDE_LOADING } from '../../redux/constants/constant';
import { displayComponentInModal, displayComponentInModalInfo } from '../../redux/actions/ModalAction';
import CompleteSprintModal from '../Modal/CompleteSprintModal/CompleteSprintModal';
import { calculateTaskRemainingTime } from '../../validations/TimeValidation';
import MemberProject from '../../child-components/Member-Project/MemberProject';
import InfoModal from '../Modal/InfoModal/InfoModal';
import domainName from '../../util/Config';
import { Editor } from '@tinymce/tinymce-react';
import { createCommentAction } from '../../redux/actions/CommentAction';
import { getEpicList } from '../../redux/actions/CategoryAction';
export default function Dashboard() {
    const dispatch = useDispatch()

    //sử dụng hiển thị tất cả issue hoặc chỉ các issue liên quan tới user
    const { id, sprintId } = useParams()

    const projectInfo = useSelector(state => state.listProject.projectInfo)
    const userInfo = useSelector(state => state.user.userInfo)
    const issuesBacklog = useSelector(state => state.issue.issuesBacklog)
    const processList = useSelector(state => state.listProject.processList)
    const sprintList = useSelector(state => state.listProject.sprintList)
    const epicList = useSelector(state => state.categories.epicList)
    const [currentProcess, setCurrentProcess] = useState(null)
    const sprintInfo = useSelector(state => state.listProject.sprintInfo)
    const [valueProcess, setValueProcess] = useState('')
    const [onEditNameProcess, setOnEditNameProcess] = useState('')
    const [editNameProcess, setEditNameProcess] = useState('')
    const [editLimitColumnProcess, setEditLimitColumnProcess] = useState(null)

    const [searchIssue, setSearchIssue] = useState({
        versions: [],
        epics: []
    })

    const handleSearchIssue = (versions, epics) => {
        setSearchIssue({ ...searchIssue, versions: versions, epics: epics })
    }

    const [onEditSummaryIssue, setOnEditSummaryIssue] = useState('')
    const [editSummaryIssue, setEditSummaryIssue] = useState('')

    const [onEditStoryPointIssue, setOnEditStoryPointIssue] = useState('')
    const [editStoryPointIssue, setEditStoryPointIssue] = useState(null)

    const [onEditAssigneesIssue, setOnEditAssigneesIssue] = useState('')
    const [editAssigneesIssue, setEditAssigneesIssue] = useState([])
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

    const [isOpenModalSetColumn, setIsOpenModalSetColumn] = useState(false);
    const handleModalSetColumnOk = () => {
        dispatch(UpdateProcessAction(editLimitColumnProcess._id, editLimitColumnProcess.project_id, { limited_number_issues: editLimitColumnProcess?.limited_number_issues }))
        setIsOpenModalSetColumn(false);
    };
    const handleModalSetColumnCancel = () => {
        setIsOpenModalSetColumn(false);
        setEditLimitColumnProcess(null)
    };

    const [editCurrentIssue, setEditCurrentIssue] = useState(null)
    const [isOpenModalFlagged, setIsOpenModalFlagged] = useState(false)
    const [editDescriptionFlagged, setEditDescriptionFlagged] = useState('')
    const handleOpenModalFlaggedOk = () => {
        dispatch(updateInfoIssue(editCurrentIssue._id, editCurrentIssue.project_id._id, { isFlagged: true }, null, null, userInfo.id, "added", "flag"))

        if (editDescriptionFlagged.trim() !== '') {
            //create comment to emphasize that is the flag added into the issue
            dispatch(createCommentAction({ content: `<span><i style={{ fontSize: 23 }} className="fa fa-flag mr-1 flag-icon-comment"></i><span className="font-weight-bold"}>Flag added</span><span><br/>${editDescriptionFlagged}`, issueId: editCurrentIssue._id, creator: userInfo?.id }))
        }
        setEditDescriptionFlagged('')
        setIsOpenModalFlagged(false);
    };
    const handleOpenModalFlaggedCancel = () => {
        setEditDescriptionFlagged('')
        setIsOpenModalFlagged(false);
    };

    useEffect(() => {
        dispatch(GetProcessListAction(id))
        if (sprintId) {
            dispatch(GetSprintAction(sprintId))
        }
        dispatch(getEpicList(id))
        dispatch(getIssuesBacklog(id))
        dispatch(GetProjectAction(id, null, navigate))
        dispatch(GetSprintListAction(id))
    }, [])
    //su dung cho debounce search
    const search = useRef(null)
    const navigate = useNavigate()

    const [open, setOpen] = useState(false);
    const [openAddProcess, setOpenAddProcess] = useState(false)
    const [openCreatingIssue, setOpenCreatingIssue] = useState('')
    const [summary, setSummary] = useState('')
    const [issueStatus, setIssueStatus] = useState(0)
    const [lockDroppable, setLockDroppable] = useState(true)


    const showModal = () => {
        setOpen(true);
    };

    const handleOk = () => {

    };

    const handleCancel = () => {
        console.log('Clicked cancel button');
        setOpen(false);
    };

    const renderProcessListOptions = (currentProcessId) => {
        var processListOptions = []
        processList.filter(process => {
            if (process._id.toString() !== currentProcessId) {
                const processOption = {
                    label: <span style={{ backgroundColor: process.tag_color, width: '100%', height: '100%', display: 'block' }}>{process.name_process}</span>,
                    value: process._id.toString()
                }
                processListOptions.push(processOption)
                return true
            }
            return false
        })
        return processListOptions
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

        } else {
            const getSourceTypeIndex = processList.findIndex(process => process._id === source.droppableId)
            const getIssue = sprintInfo.issue_list.filter(issue => issue.issue_type._id === processList[getSourceTypeIndex]._id)[source.index]
            const getDestTypeIndex = processList.findIndex(process => process._id === dest.droppableId)
            dispatch({
                type: DISPLAY_LOADING
            })
            if (Number.isInteger(getSourceTypeIndex) && getIssue && Number.isInteger(getDestTypeIndex)) {
                dispatch(updateInfoIssue(getIssue._id, id, { issue_type: dest.droppableId }, processList[getSourceTypeIndex].name_process, processList[getDestTypeIndex].name_process, userInfo.id, "updated", "type"))
            }
            await delay(1000)

            dispatch(GetSprintAction(sprintId))
            dispatch({
                type: HIDE_LOADING
            })
        }
    }

    //type là loại được chọn để hiển thị (tất cả vấn đề / các vấn đề thuộc user)
    const renderIssue = (processId, limitcol) => {
        if (sprintInfo === null) return <></>
        console.log("searchIssue.epicsv ", searchIssue.epics);
        var issuesBacklogAfterSearching = []
        if (searchIssue.epics.length > 0) {
            issuesBacklogAfterSearching = [...issuesBacklog?.filter(issue => searchIssue.epics.includes(issue.epic_link ? issue.epic_link?._id : null))]
        } else {
            issuesBacklogAfterSearching = [...issuesBacklog]
        }
        const listIssues = issuesBacklogAfterSearching?.filter(issue => sprintInfo?.issue_list?.map(issue => issue._id.toString())?.includes(issue._id) && issue.issue_status !== 4)
        if (limitcol && listIssues?.length > limitcol) {
            listIssues?.splice(0, limitcol)
        }
        const issueTags = listIssues?.filter((issue, index) => processId === issue.issue_type._id).map((issue, index) => {
            return <Draggable draggableId={issue._id} index={index} key={issue._id}>
                {(provided) => {
                    return <div
                        key={issue._id}
                        className="list-group-item p-0"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        onClick={() => {
                            dispatch(displayComponentInModalInfo(<InfoModal issueInfo={issue} userInfo={userInfo} displayNumberCharacterInSummarySubIssue={10} />))
                        }}
                        onKeyDown={() => { }}>
                        <div className={`${issue?.isFlagged ? "isFlagged" : ""}`} style={{ cursor: 'pointer', backgroundColor: issue?.isFlagged ? "#F1CA45" : "#ffff", height: '100%', width: '100%', padding: '10px' }}>
                            <div className='d-flex justify-content-between'>
                                {/* Render Summary */}
                                {onEditSummaryIssue === issue._id ? <div style={{ position: 'relative' }}>
                                    <Input onClick={(e) => {
                                        e.stopPropagation();
                                    }} onChange={(e) => { setEditSummaryIssue(e.target.value) }} defaultValue={issue?.summary} value={editSummaryIssue} style={{ borderRadius: 0 }} />
                                    <div className='d-flex' style={{ position: 'absolute', right: 0, zIndex: 9999 }}>
                                        <Button onClick={(e) => {
                                            e.stopPropagation()
                                            if (editSummaryIssue.trim() !== "") {
                                                dispatch(updateInfoIssue(issue._id, issue.project_id, { summary: editSummaryIssue.trim() }, null, null, userInfo.id, "updated", "summary"))
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
                                </div> : <NavLink onClick={(e) => {
                                    e.stopPropagation()
                                    setOnEditSummaryIssue(issue._id)
                                }} className='issues-summary-dashboard-hover' style={{ padding: '5px 5px 5px 0', color: '#000', fontWeight: 'normal', width: 'fit-content' }}>
                                    {issue?.summary?.length > 15 ? `${issue?.summary?.substring(0, 15)}...` : issue?.summary} <i className="fa fa-pen ml-2 hide-items d-none" style={{ fontSize: 12 }}></i>
                                </NavLink>}
                                <div className="btn-group">
                                    <Button className='hide-items d-none' data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                        <i style={{ fontSize: 20 }} className="fa fa-ellipsis-h"></i>
                                    </Button>
                                    <div className="dropdown-menu">
                                        <a className="dropdown-item" href="##" onClick={(e) => {
                                            e.stopPropagation()
                                            CopyLinkButton(`${domainName}/projectDetail/${id}/issues/issue-detail/${issue._id}`)
                                        }}>Copy issue link</a>
                                        <a className="dropdown-item" href="##" onClick={(e) => {
                                            e.stopPropagation()
                                            CopyLinkButton(`WD-${issue.ordinal_number}`)
                                        }}>Copy issue key</a>
                                        <div className="dropdown-divider" />
                                        {
                                            !issue?.isFlagged ? <a className="dropdown-item" href="##" onClick={(e) => {
                                                e.stopPropagation()
                                                setEditCurrentIssue(issue)
                                                setIsOpenModalFlagged(true)
                                            }}>Add flag</a> : <a className="dropdown-item" href="##" onClick={(e) => {
                                                e.stopPropagation()
                                                dispatch(updateInfoIssue(issue._id, issue.project_id._id, { isFlagged: false }, null, null, userInfo.id, "canceled", "flag"))
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
                                {issue?.epic_link ? <Tag className='mt-1 mb-1' style={{ borderRadius: 0 }} color={issue?.epic_link?.tag_color}>{issue?.epic_link?.epic_name}</Tag> : <></>}
                            </div>

                            <div className="block" style={{ display: 'flex' }}>
                                <div className="block-left d-flex align-items-center">
                                    <span className='mr-2'>WD-{issue?.ordinal_number}</span>
                                    {iTagForIssueTypes(issue.issue_status, null, null)}
                                    {iTagForPriorities(issue.issue_priority, null, null)}
                                </div>
                                <div className="block-right" style={{ display: 'flex', alignItems: 'center' }}>
                                    {issue?.isFlagged ? <i style={{ fontSize: 15, color: '#FF5630' }} className="fa fa-flag mr-3"></i> : <></>}
                                    {issue?.issue_type?._id === processList[processList.length - 1]?._id ? <span className='mr-2 font-weight-bold'><i style={{ color: 'green' }} className="fa fa-check"></i></span> : <></>}
                                    {onEditStoryPointIssue === issue._id ? <div style={{ position: 'relative' }}>
                                        <InputNumber onClick={(e) => e.stopPropagation()} onChange={(value) => { setEditStoryPointIssue(value) }} defaultValue={issue?.story_point} value={editStoryPointIssue} style={{ borderRadius: 0 }} />
                                        <div className='d-flex' style={{ position: 'absolute', right: 0, zIndex: 9999 }}>
                                            <Button onClick={(e) => {
                                                e.stopPropagation()
                                                if (parseInt(editStoryPointIssue) && editStoryPointIssue > 0) {
                                                    dispatch(updateInfoIssue(issue._id, issue.project_id, { story_point: editStoryPointIssue }, issue.story_point ? issue.story_point.toString() : "None", editStoryPointIssue.toString(), userInfo.id, "updated", "story point"))
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
                                        }} style={{ width: 20, height: 20 }} className='mr-2'><span className='d-flex'>{issue?.story_point ? issue?.story_point : "-"}</span></Avatar>
                                    </div>}

                                    <div className="avatar-group" style={{ position: 'relative' }}>
                                        {/* them avatar cua cac assignees */}
                                        {
                                            issue?.assignees?.length > 0 ? <Avatar.Group>
                                                {issue?.assignees?.map((user, index) => {
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
            {openCreatingIssue !== processId ? <NavLink onClick={() => {
                setOpenCreatingIssue(processId)
                setSummary('')
                setIssueStatus(0)
            }} className={`dashboard-creating-issue ${issueTags?.length === 0 || issueTags?.length <= 3 ? 'd-none' : 'd-block'}`} style={{ padding: '10px 20px', display: 'block', width: '100%', color: 'black', textDecoration: 'none' }}><i className="fa fa-plus mr-2"></i>Create issue</NavLink> :
                <div
                    style={{ height: 100, backgroundColor: '#ffff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', margin: 5, border: '2px solid #2684FF' }}>
                    <Input className='dashboard-edit-input-ant' onChange={(e) => {
                        setSummary(e.target.value)
                    }} style={{ border: 'none', borderRadius: 0 }} placeholder='What need to be done?' />
                    <div className='d-flex justify-content-between' style={{ padding: '0 10px 10px 10px' }}>
                        <Select className='dashboard-edit-select-ant' style={{ border: 'none !important', borderRadius: 0 }}
                            defaultValue={issueTypeWithoutOptions[0].value}
                            onChange={(value, option) => {
                                setIssueStatus(value)
                            }}
                            options={issueTypeWithoutOptions} />
                        {summary.trim() === "" ? <Button disabled style={{ border: 'none', borderRadius: 0 }}>Create</Button> : <Button onClick={(e) => {
                            e.stopPropagation()
                            e.preventDefault()
                            dispatch(createIssue({ summary: summary, issue_status: issueStatus, issue_type: processId, current_sprint: sprintId, project_id: id, creator: userInfo.id }, id, userInfo.id, sprintId, null))
                            setOpenCreatingIssue('')
                            setIssueStatus(0)
                            setSummary('')
                        }} type='primary' style={{ border: 'none', borderRadius: 0 }}>Create</Button>}
                    </div>
                </div>}
        </div>
        // return listIssues?.filter(issue => {
        //     return issue.issueStatus === position
        // })
        //     .sort((issue1, issue2) => issue1.priority - issue2.priority)
        //     .map((value, index) => {
        //         return (<li key={value._id} className="list-group-item" data-toggle="modal" data-target="#infoModal" style={{ cursor: 'pointer' }} onClick={() => {
        //             dispatch(getInfoIssue(value._id))
        //         }} onKeyDown={() => { }}>
        //             <p>
        //                 {value.shortSummary}
        //             </p>
        //             <div className="block" style={{ display: 'flex' }}>
        //                 <div className="block-left">
        //                     {iTagForIssueTypes(value.issueType)}
        //                     {iTagForPriorities(value.priority)}
        //                 </div>
        //                 <div className="block-right" style={{ display: 'flex', alignItems: 'center' }}>
        //                     <div className="avatar-group">
        //                         {/* them avatar cua cac assignees */}
        //                         {
        //                             value?.assignees?.map((user, index) => {
        //                                 if (index === 3) {
        //                                     return <Avatar key={value._id} size={40}>...</Avatar>
        //                                 } else if (index <= 2) {
        //                                     return <Avatar size={30} key={value._id} src={user.avatar} />
        //                                 }
        //                                 return null
        //                             })
        //                         }
        //                     </div>
        //                 </div>
        //             </div>
        //         </li>)
        //     })
    }

    // const renderMembersAndFeatureAdd = () => {
    //     return <AutoComplete
    //         style={{ width: '100%' }}
    //         onSearch={(value) => {
    //             //kiem tra gia tri co khac null khong, khac thi xoa
    //             if (search.current) {
    //                 clearTimeout(search.current)
    //             }
    //             search.current = setTimeout(() => {
    //                 dispatch(getUserKeyword(value))
    //             }, 500)
    //         }}
    //         value={valueDashboard}
    //         onChange={(value) => {
    //             setValueDashboard(value)
    //         }}
    //         defaultValue=''
    //         options={listUser?.reduce((newListUser, user) => {
    //             if (user._id !== userInfo.id) {
    //                 return [...newListUser, { label: user.username, value: user._id }]
    //             }
    //             return newListUser
    //         }, [])}
    //         onSelect={(value, option) => {
    //             setValueDashboard(option.label)
    //             dispatch(insertUserIntoProject({
    //                 project_id: projectInfo?._id,  //id cua project
    //                 user_id: value   //id cua username
    //             }))

    //             dispatch(GetProjectAction(projectInfo?._id, ""))
    //         }}
    //         placeholder="input here"
    //     />
    // }

    // const addNewProcess = () => {
    //     const newListProcesses = [...listProcesses, { nameProcess: "hihi" }];
    //     console.log("listProcesses ", newListProcesses);
    //     setListProcesses(newListProcesses);
    // }
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
                    {sprintId && sprintInfo !== null && Object.keys(sprintInfo).length !== 0 ? (dayjs(new Date()).isAfter(dayjs(sprintInfo?.start_date)) || dayjs(new Date()).isSame(dayjs(sprintInfo?.start_date)) ? <Tooltip placement='bottom' title={renderTooltipForRemainingDay(sprintInfo)}>
                        <span className='m-0 mr-2 align-items-center d-flex bg-light' style={{ padding: '10px 20px' }}>
                            <i className="fa fa-clock mr-2"></i>{calculateTaskRemainingTime(dayjs(sprintInfo.start_date), dayjs(sprintInfo.end_date))}
                        </span>
                    </Tooltip> : <Tooltip placement='bottom' title={renderTooltipForStartingDateYet(sprintInfo)}>
                        <span className='m-0 mr-2 align-items-center d-flex bg-light font-weight-bold' style={{ padding: '10px 20px' }}>Project start date not yet</span>
                    </Tooltip>) : <></>}
                    {sprintId && sprintInfo !== null && Object.keys(sprintInfo).length !== 0 ? <Button className='m-0 mr-2' type='primary' onClick={() => {
                        dispatch(displayComponentInModal(<CompleteSprintModal sprintInfo={sprintInfo} processList={processList} id={id} userInfo={userInfo} sprintList={sprintList} projectInfo={projectInfo} />))
                    }}>Complete Sprint</Button> : <></>}

                    <NavLink to="https://github.com/longle11/NT114.O21.MMCL-DACN-MICROSERVICE" target="_blank" style={{ textDecoration: 'none' }}>
                        <Button className='m-0 mr-2' type='primary'>
                            <i className="fab fa-github mr-2"></i>
                            <div>Github Repo</div>
                        </Button>
                    </NavLink>
                    <Button className='m-0 mr-2' type='primary'><i className="fa fa-share"></i></Button>
                    <Button className='m-0 mr-2' type='primary'><i className="fa fa-bars"></i></Button>
                </div>
            </div>
            <p>{sprintInfo === null || sprintInfo === undefined || Object?.keys(sprintInfo).length === 0 ? "" : sprintInfo.sprint_goal}</p>
            <MemberProject projectInfo={projectInfo} id={id} userInfo={userInfo} allIssues={sprintInfo.issue_list} epicList={epicList} typeInterface="dashboard" handleSearchIssue={handleSearchIssue} searchIssue={searchIssue} />
            <DragDropContext onDragStart={(e) => {
                if (e.draggableId.includes('process')) {
                    setLockDroppable(false)
                } else {
                    setLockDroppable(true)
                }
            }} onDragEnd={(result) => {
                handleDragEnd(result)
            }}>
                <Droppable direction='horizontal' droppableId='process' isDropDisabled={lockDroppable}>
                    {(provided) => {
                        return <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="content"
                            style={{ overflowX: 'scroll', overflowY: 'hidden', height: 'fit-content', width: '100%', display: '-webkit-box', padding: '15px 0', scrollbarWidth: 'none', backgroundColor: 'white' }}
                        >
                            {processList?.map((process, index) => {
                                return <Draggable draggableId={`process-${process._id}`} key={`process-${process._id}`} index={index}>
                                    {(provided) => {
                                        return <div
                                            ref={provided.innerRef}
                                            {...provided.dragHandleProps}
                                            {...provided.draggableProps}
                                            className="card">
                                            <div style={{ width: 'max-content', minWidth: '16rem', height: '28rem', fontWeight: 'bold', scrollbarWidth: 'none', overflowY: 'none' }}>
                                                <div className='d-flex justify-content-between align-items-center process-header' style={{ backgroundColor: process.tag_color, color: 'white', padding: '3px 10px' }}>
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
                                                                    return issue.issue_type._id === process._id && issue.issue_status !== 4
                                                                }).length : '0'}</span></Avatar>
                                                                {process?._id === processList[processList.length - 1]?._id ? <span className='ml-2 font-weight-bold'><i style={{ color: 'green' }} className="fa fa-check"></i></span> : <></>}
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
                                                                setCurrentProcess(process)
                                                                showModal()
                                                            }}>Delete</button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Droppable droppableId={process._id}>
                                                    {(provided) => {
                                                        return <div className="list-group list-group-flush" style={{ overflowY: 'auto', height: '24rem', scrollbarWidth: 'none' }} ref={provided.innerRef} {...provided.droppableProps}>
                                                            {index === 0 && sprintId === null ? <div className='d-flex flex-column align-items-center ml-2 mr-2 mt-5'>
                                                                <img src="https://jira-frontend-bifrost.prod-east.frontend.public.atl-paas.net/assets/agile.52407441.svg" style={{ height: 150, width: 150 }} alt="img-backlog" />
                                                                <p style={{ fontWeight: 'bold', marginBottom: 5 }}>Get started in the backlog</p>
                                                                <span style={{ fontWeight: 'normal', textAlign: 'center' }}>Plan and start a sprint to see issues here.</span>
                                                                <Button className='mt-2' danger onClick={() => {
                                                                    navigate(`/projectDetail/${id}/backlog`)
                                                                }}>Go to Backlog</Button>
                                                            </div> : renderIssue(process._id, process?.limited_number_issues)}
                                                            {provided.placeholder}
                                                        </div>
                                                    }}
                                                </Droppable>
                                            </div>
                                            {provided.placeholder}
                                        </div>
                                    }}
                                </Draggable>
                            })}
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

                <Modal
                    open={open}
                    onOk={handleOk}
                    onCancel={handleCancel}
                >
                    <div className='d-flex'>
                        <i className="glyphicon glyphicon-alert"></i>
                        <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Move work from <span>{currentProcess?.name_process}</span> column</span>
                    </div>
                    <p>Select a new home for any work with the <span>{currentProcess?.name_process}</span> status, including work in the backlog.</p>
                    <div className='d-flex justify-content-between align-items-center'>
                        <div className='d-flex flex-column'>
                            <label htmlFor='currentProcess'>This status will be deleted:</label>
                            <div style={{ textDecoration: 'line-through', backgroundColor: currentProcess?.tag_color, display: 'inline' }}>{currentProcess?.name_process}</div>
                        </div>
                        <i className="fa fa-long-arrow-alt-right"></i>
                        <div className='d-flex flex-column'>
                            <label htmlFor='newProcess?'>Move existing issues to:</label>
                            <Select
                                showSearch
                                optionFilterProp="label"
                                options={renderProcessListOptions(currentProcess?._id.toString())}
                                defaultValue={renderProcessListOptions(currentProcess?._id.toString())[0]?.value}
                            />
                        </div>
                    </div>
                </Modal>

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

                <Modal width={1024} destroyOnClose={true} title={<h4><i style={{ fontSize: 25, color: '#FF5630' }} className="fa fa-flag mr-3"></i> Add Flag</h4>} open={isOpenModalFlagged} onOk={handleOpenModalFlaggedOk} onCancel={handleOpenModalFlaggedCancel}>
                    <span className='mb-2 d-flex align-items-center'><span className='font-weight-bold mr-2'>Issue</span> {iTagForIssueTypes(editCurrentIssue?.issue_status, 'mr-1', null)} <span style={{ color: '#626F86' }}>WD-{editCurrentIssue?.ordinal_number} {editCurrentIssue?.summary}</span></span>
                    <Editor name='description'
                        apiKey='golyll15gk3kpiy6p2fkqowoismjya59a44ly52bt1pf82oe'
                        init={{
                            plugins: 'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount linkchecker',
                            toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat',
                            tinycomments_mode: 'embedded',
                            tinycomments_author: 'Author name',
                            mergetags_list: [
                                { value: 'First.Name', title: 'First Name' },
                                { value: 'Email', title: 'Email' },
                            ],
                            placeholder: 'Optional: Let your team know why this issue has been flagged',
                            height: 350,
                        }}
                        onEditorChange={(value) => {
                            setEditDescriptionFlagged(value)
                        }}
                    />
                </Modal>
            </DragDropContext>
        </div>
    )
}
