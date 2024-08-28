import React, { useEffect, useRef, useState } from 'react'
import DrawerHOC from '../../HOC/DrawerHOC'
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Avatar, Breadcrumb, Button, Input, Modal, Popover, Select, Table, Tooltip } from 'antd';
import { getInfoIssue, updateInfoIssue } from '../../redux/actions/IssueAction';
import { CreateProcessACtion, GetProcessListAction, GetProjectAction, GetSprintAction, GetSprintListAction } from '../../redux/actions/ListProjectAction';
import { addUserToProject, deleteSprintAction, deleteUserInProject, updateProjectAction, updateSprintAction } from '../../redux/actions/CreateProjectAction';
import { DeleteOutlined } from '@ant-design/icons';
import Search from 'antd/es/input/Search';
import { iTagForIssueTypes, iTagForPriorities, userPermissions } from '../../util/CommonFeatures';
import { showNotificationWithIcon } from '../../util/NotificationUtil';
import dayjs from 'dayjs';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { delay } from '../../util/Delay';
import './Dashboard.css'
import { DISPLAY_LOADING, GET_SPRINT_PROJECT, HIDE_LOADING } from '../../redux/constants/constant';
import Axios from 'axios';
import domainName from '../../util/Config';
export default function Dashboard() {
    const dispatch = useDispatch()

    //sử dụng hiển thị tất cả issue hoặc chỉ các issue liên quan tới user
    const { id, sprintId } = useParams()

    const projectInfo = useSelector(state => state.listProject.projectInfo)
    const [valueDashboard, setValueDashboard] = useState('')
    const listUser = useSelector(state => state.user.list)
    const userInfo = useSelector(state => state.user.userInfo)
    const processList = useSelector(state => state.listProject.processList)
    const sprintList = useSelector(state => state.listProject.sprintList)
    const [currentProcess, setCurrentProcess] = useState(null)
    const sprintInfo = useSelector(state => state.listProject.sprintInfo)
    const [valueProcess, setValueProcess] = useState('')
    //su dung cho debounce search
    const search = useRef(null)
    const navigate = useNavigate()

    const [open, setOpen] = useState(false);
    const [openAddProcess, setOpenAddProcess] = useState(false)

    const [userEmail, setUserEmail] = useState('')
    const [userRole, setuserRole] = useState(0)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [lockDroppable, setLockDroppable] = useState(true)
    const [isModalCompletingSprintOpen, setIsModalCompletingSprintOpen] = useState(false);
    //handle when deleting a sprint to move issues to other places
    const [getIssueToOtherPlaces, setGetIssueToOtherPlaces] = useState({
        old_stored_place: null,
        new_stored_place: 0 //mac dinh se luu tru vao backlog
    })

    const handleCompletingSprintOk = async () => {
        setIsModalCompletingSprintOpen(false);
        if (getIssueToOtherPlaces.old_stored_place !== null) {
            if (getIssueToOtherPlaces.new_stored_place === 0) {
                const getIssueListInCurrentSprint = getIssueToOtherPlaces.old_stored_place.issue_list
                //proceed update current_sprint field to backlog in Issue service
                for (let index = 0; index < getIssueListInCurrentSprint.length; index++) {
                    dispatch(updateInfoIssue(getIssueListInCurrentSprint[index]._id.toString(), id, { current_sprint: null, old_sprint:  getIssueToOtherPlaces.old_stored_place._id }, getIssueToOtherPlaces.old_stored_place.sprint_name, "backlog", userInfo.id, "updated", "sprint"))
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
                            dispatch(updateInfoIssue(newSprint.issue_list[index]._id.toString(), id, { current_sprint: newSprint._id.toString(), old_sprint: getIssueToOtherPlaces.old_stored_place._id }, old_sprint_name, newSprint.sprint_name, userInfo.id, "updated", "sprint"))
                        }
                    }
                }

            } else {    //move to other sprints
                const getIssueListInCurrentSprint = getIssueToOtherPlaces.old_stored_place.issue_list
                //proceed update current_sprint field to other sprints in Issue service
                const getNewSprintInfo = sprintList.filter(sprint => sprint._id === getIssueToOtherPlaces.new_stored_place)
                for (let index = 0; index < getIssueListInCurrentSprint.length; index++) {
                    await delay(100)
                    dispatch(updateSprintAction(getIssueToOtherPlaces.new_stored_place, { issue_id: getIssueListInCurrentSprint[index]._id.toString()}))
                }
                for (let index = 0; index < getIssueListInCurrentSprint.length; index++) {
                    dispatch(updateInfoIssue(getIssueListInCurrentSprint[index]._id.toString(), id, { current_sprint: getIssueToOtherPlaces.new_stored_place, old_sprint: getIssueToOtherPlaces.old_stored_place._id }, getIssueToOtherPlaces.old_stored_place.sprint_name, getNewSprintInfo[0].sprint_name, userInfo.id, "updated", "sprint"))
                }

                // //proceed delete all issues in current sprint
                dispatch(deleteSprintAction(getIssueToOtherPlaces.old_stored_place._id.toString(), id))
            }
        }

        navigate(`/projectDetail/${id}/backlog`)

        dispatch(updateProjectAction(id, { sprint_id: null }, null))

        //proceed move to backlog page and delete this sprint out project and change it's status to "finished"

        setGetIssueToOtherPlaces({
            old_stored_place: null,
            new_stored_place: 0
        })
    };
    const handleCompletingSprintCancel = () => {
        setIsModalCompletingSprintOpen(false);
    };

    const handleAddUserToProjectOk = () => {
        setIsModalOpen(false);
        dispatch(addUserToProject(userEmail, userRole, id))
        setUserEmail('')
        setuserRole(0)
    };


    const handleAddUserToProjectCancel = () => {
        setIsModalOpen(false);
    };

    const showModal = () => {
        setOpen(true);
    };

    const handleOk = () => {

    };

    const handleCancel = () => {
        console.log('Clicked cancel button');
        setOpen(false);
    };

    useEffect(() => {
        dispatch(GetProcessListAction(id))
        dispatch(GetSprintAction(sprintId))
        dispatch(GetProjectAction(id, null, navigate))
        dispatch(GetSprintListAction(id))
    }, [])


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

    //su dung cho truong hien thi member
    const memberColumns = [
        {
            title: 'Avatar',
            dataIndex: 'avatar',
            key: 'avatar',
            render: (text, record, index) => {
                return <Avatar src={record.user_info.avatar} size={30} alt={index} />
            }
        },
        {
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
            render: (text, record, index) => {
                return <span>{record.user_info.username}</span>
            }
        },
        {
            title: 'Action',
            key: 'action',
            dataIndex: '_id',
            render: (text, record, index) => {
                if (projectInfo?.creator._id.toString().toString() === userInfo.id) {
                    return text !== userInfo.id ? (
                        <Button type="primary" onClick={() => {
                            dispatch(deleteUserInProject(text, projectInfo?._id))

                            dispatch(GetProjectAction(projectInfo?._id, ""))
                        }} icon={<DeleteOutlined />} size='large' />
                    ) : <></>
                }
                return <></>
            }
        }
    ];
    const renderTableMembers = (table) => {
        return <>{table}</>
    }
    const renderAvatarMembers = (value, table) => {
        return <Popover key={value.user_info._id} content={renderTableMembers(table)} title="Members">
            <Avatar src={value.user_info.avatar} key={value.user_info._id} />
        </Popover>
    }

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

    const calculateTaskRemainingTime = (currentDate, endDate) => {
        if (endDate !== null) {
            const diff = endDate.diff(currentDate, 'day', true);
            const days = Math.floor(diff);
            const hours = Math.floor((diff - days) * 24);

            return `${days} days ${hours} hours`
        }
        return null
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

    const countEleStatus = (position, type) => {
        if (type === 1) {
            return projectInfo?.issues?.filter(issue => {
                return (issue.assignees.findIndex(value => value._id === userInfo.id) !== -1) || (issue.creator._id === userInfo.id)
            }).filter(value => value.issueStatus === position).length
        }
        return projectInfo?.issues?.filter(value => value.issueStatus === position).length
    }
    const handleDragEnd = async (result) => {
        const source = result.source
        const dest = result.destination

        console.log("source ", source.droppableId);
        console.log("dest ", dest.droppableId);

        if (dest === null) {
            return
        }
        if ((source.droppableId.includes("process") && !dest.droppableId.includes("process")) || (dest.droppableId.includes("process") && !source.droppableId.includes("process"))) {
            return null
        }
        if (source.droppableId === dest.droppableId) {

        } else {
            const getSourceTypeIndex = processList.findIndex(process => process._id === source.droppableId)
            const getIssue = sprintInfo.issue_list.filter(issue => issue.issue_type === processList[getSourceTypeIndex]._id)[source.index]
            const getDestTypeIndex = processList.findIndex(process => process._id === dest.droppableId)
            dispatch({
                type: DISPLAY_LOADING
            })
            dispatch(updateInfoIssue(getIssue._id, id, { issue_type: dest.droppableId }, processList[getSourceTypeIndex].name_process, processList[getDestTypeIndex].name_process, userInfo.id, "updated", "type"))
            await delay(1000)

            dispatch(GetSprintAction(sprintId))
            dispatch({
                type: HIDE_LOADING
            })
        }
    }

    //type là loại được chọn để hiển thị (tất cả vấn đề / các vấn đề thuộc user)
    const renderIssue = (processId) => {
        // let listIssues = projectInfo?.issues
        // if (type === 1) {
        //     listIssues = listIssues?.filter(issue => {
        //         return (issue.assignees.findIndex(value => value._id === userInfo.id) !== -1) || (issue.creator._id === userInfo.id)
        //     })
        // }

        if (sprintInfo === null) return <></>
        const listIssues = sprintInfo?.issue_list
        return listIssues?.filter((issue, index) => processId === issue.issue_type).map((issue, index) => {
            return <Draggable draggableId={issue._id} index={index} key={issue._id}>
                {(provided) => {
                    return <li
                        key={issue._id}
                        className="list-group-item"
                        data-toggle="modal"
                        data-target="#infoModal"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        onClick={() => {
                            dispatch(getInfoIssue(issue._id))
                        }} onKeyDown={() => { }}>
                        <div style={{ cursor: 'pointer' }}>
                            <p>
                                {issue.summary}
                            </p>
                            <div className="block" style={{ display: 'flex' }}>
                                <div className="block-left">
                                    {iTagForIssueTypes(issue.issue_status)}
                                    {iTagForPriorities(issue.issue_priority)}
                                </div>
                                <div className="block-right" style={{ display: 'flex', alignItems: 'center' }}>
                                    <div className="avatar-group">
                                        {/* them avatar cua cac assignees */}
                                        {
                                            <Avatar.Group>
                                                {issue?.assignees?.map((user, index) => {
                                                    if (index === 3) {
                                                        return <Avatar key={issue._id} size={30}><span className='d-flex'>...</span></Avatar>
                                                    } else if (index <= 2) {
                                                        return <Avatar size={30} key={issue._id} src={user.avatar} />
                                                    }
                                                    return null
                                                })}
                                            </Avatar.Group>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>

                    </li>
                }}
            </Draggable>
        })
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
                    {sprintId && sprintInfo !== null && Object.keys(sprintInfo).length !== 0 ? <Tooltip placement='bottom' title={renderTooltipForRemainingDay(sprintInfo)}><span className='m-0 mr-2 align-items-center d-flex bg-light' style={{ padding: '10px 20px' }}><i className="fa fa-clock mr-2"></i>{calculateTaskRemainingTime(dayjs(new Date()), dayjs(sprintInfo.end_date))}</span></Tooltip> : <></>}
                    {sprintId && sprintInfo !== null && Object.keys(sprintInfo).length !== 0 ? <Button className='m-0 mr-2' type='primary' onClick={() => {
                        setIsModalCompletingSprintOpen(true)
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
            <div className="info" style={{ display: 'flex' }}>
                <div className="search-block">
                    <Search
                        placeholder="Search"
                        style={{ width: 200 }}
                        onSearch={value => {
                            dispatch(GetProjectAction(projectInfo?._id, value))
                        }}
                    />
                </div>
                <div className="avatar-group" style={{ display: 'flex' }}>
                    <Avatar.Group>
                        {projectInfo?.members?.map((value, index) => {
                            const table = <Table columns={memberColumns} rowKey={value._id} dataSource={projectInfo?.members} />
                            return renderAvatarMembers(value, table)
                        })}
                    </Avatar.Group>
                    {/* <Popover placement="right" title="Add User" content={renderMembersAndFeatureAdd()} trigger="click">
                        <Avatar style={{ backgroundColor: '#87d068' }}>
                            <i className="fa fa-plus"></i>
                        </Avatar>
                    </Popover> */}
                    <Avatar style={{ backgroundColor: '#87d068' }} onClick={() => {
                        setIsModalOpen(true)
                    }}>
                        <i className="fa fa-plus"></i>
                    </Avatar>
                </div>
                <div className="options-group" style={{ display: 'flex' }}>
                    <Button className="mr-2 ml-3" type="primary">All isssues</Button>
                    <Button>Only my issues</Button>
                </div>


            </div>
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
                            style={{ overflowX: 'scroll', overflowY: 'hidden', height: 'fit-content', width: '100%', display: '-webkit-box', padding: '15px 20px', scrollbarWidth: 'none', backgroundColor: 'white' }}
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
                                                    <div className="card-header d-flex align-items-center " style={{ color: 'black' }}>
                                                        {process?.name_process} <Avatar className='ml-2' size={25}><span style={{ fontSize: 12, display: 'flex' }}>{sprintInfo !== null && Object.keys(sprintInfo).length !== 0 ? sprintInfo?.issue_list?.filter(issue => issue.issue_type === process._id).length : '0'}</span></Avatar>
                                                    </div>
                                                    <div className='dropdown'>
                                                        <button style={{ height: '30px', display: 'none' }} className='btn btn-light p-0 pl-3 pr-3 btn-dashboard-setting' type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                                            <i className="fa-sharp fa-solid fa-bars"></i>
                                                        </button>
                                                        <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                                            <button className="dropdown-item">Set column limit</button>
                                                            <button className="dropdown-item" onClick={() => {
                                                                setCurrentProcess(process)
                                                                showModal()
                                                            }}>Delete</button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={{ height: '100%', overflowY: 'auto', scrollbarWidth: 'none' }}>
                                                    <Droppable droppableId={process._id}>
                                                        {(provided) => {
                                                            return <ul className="list-group list-group-flush" style={{ height: '100%' }} ref={provided.innerRef} {...provided.droppableProps}>
                                                                {index === 0 && sprintInfo !== null && sprintInfo?.issue_list?.length === 0 ? <div className='d-flex flex-column align-items-center ml-2 mr-2'>
                                                                    <img src="https://jira-frontend-bifrost.prod-east.frontend.public.atl-paas.net/assets/agile.52407441.svg" style={{ height: 150, width: 150 }} alt="img-backlog" />
                                                                    <p style={{ fontWeight: 'bold', marginBottom: 5 }}>Get started in the backlog</p>
                                                                    <span style={{ fontWeight: 'normal', textAlign: 'center' }}>Plan and start a sprint to see issues here.</span>
                                                                    <Button className='mt-2' danger onClick={() => {
                                                                        navigate(`/projectDetail/${id}/backlog`)
                                                                    }}>Go to Backlog</Button>
                                                                </div> : renderIssue(process._id)}
                                                                {provided.placeholder}
                                                            </ul>
                                                        }}
                                                    </Droppable>
                                                </div>
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
                                        }} type="primary"><i class="fa fa-check"></i></Button>
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
                <Modal destroyOnClose="true" title={`Add new user to project ${projectInfo?.name_project}`} open={isModalOpen} onOk={handleAddUserToProjectOk} onCancel={handleAddUserToProjectCancel}>
                    <div>
                        <label htmlFor='email'>Email</label>
                        <Input name='email' placeholder="e.g., longle@company.com" onChange={(e) => {
                            if (e.target.value.trim() === "") {
                                showNotificationWithIcon('error', '', 'Email can not be left blank')
                            } else {
                                setUserEmail(e.target.value)
                            }
                        }} />
                    </div>
                    <div className='d-flex flex-column mt-2'>
                        <label htmlFor='role'>Role</label>
                        <Select
                            name="role"
                            defaultValue={userPermissions[userRole].label}
                            style={{
                                width: 'max-content',
                            }}
                            onChange={(value) => {
                                setuserRole(value)
                            }}
                            options={userPermissions}
                        />
                    </div>
                </Modal>
                <Modal destroyOnClose="true" open={isModalCompletingSprintOpen} onOk={handleCompletingSprintOk} onCancel={handleCompletingSprintCancel}>
                    <h5>Complete sprint {sprintInfo?.sprint_name}</h5>
                    <label htmlFor='uncompleted_issues'>Uncompleted issues:</label>
                    <ul>
                        {
                            processList?.filter(process => process.name_process.toLowerCase() !== "done").map(process => {
                                const countIssues = sprintInfo?.issue_list?.filter(issue => issue.issue_type === process._id).length
                                return <li>{countIssues} issues for <span style={{ fontWeight: 'bold' }}>{process?.name_process?.toLowerCase()}</span></li>
                            })
                        }
                    </ul>
                    <label htmlFor='completed_issues'>Completed issues:</label>
                    <ul>
                        {
                            processList?.filter(process => process.name_process.toLowerCase() === "done").map(process => {
                                const countIssues = sprintInfo?.issue_list?.filter(issue => issue.issue_type === process._id).length
                                return <li>{countIssues} issues for <span style={{ fontWeight: 'bold' }}>{process?.name_process?.toLowerCase()}</span></li>
                            })
                        }
                    </ul>
                    <div className='d-flex flex-column'>
                        <label htmlFor='moveTaskTo'>Move uncompleted issues to</label>
                        <Select
                            options={optionsMoveUncompletedIssues()}
                            onSelect={(value) => {
                                setGetIssueToOtherPlaces({
                                    old_stored_place: sprintInfo,
                                    new_stored_place: value
                                })
                            }}
                            style={{ width: '100%' }}
                        />
                    </div>
                </Modal>
            </DragDropContext>
        </div>
    )
}
