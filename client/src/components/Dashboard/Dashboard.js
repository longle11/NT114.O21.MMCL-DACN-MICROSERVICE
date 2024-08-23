import React, { useEffect, useRef, useState } from 'react'
import DrawerHOC from '../../HOC/DrawerHOC'
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AutoComplete, Avatar, Breadcrumb, Button, Input, Modal, Popover, Select, Table } from 'antd';
import { getInfoIssue, updateInfoIssue } from '../../redux/actions/IssueAction';
import { getUserKeyword, insertUserIntoProject } from '../../redux/actions/UserAction';
import { CreateProcessACtion, GetProcessListAction, GetProjectAction, GetSprintAction, GetSprintListAction } from '../../redux/actions/ListProjectAction';
import { deleteUserInProject } from '../../redux/actions/CreateProjectAction';
import { DeleteOutlined } from '@ant-design/icons';
import Search from 'antd/es/input/Search';
import { iTagForIssueTypes, iTagForPriorities } from '../../util/CommonFeatures';
import { showNotificationWithIcon } from '../../util/NotificationUtil';
import dayjs from 'dayjs';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { delay } from '../../util/Delay';
import { DISPLAY_LOADING, HIDE_LOADING } from '../../redux/constants/constant';
export default function Dashboard() {
    const dispatch = useDispatch()

    //sử dụng hiển thị tất cả issue hoặc chỉ các issue liên quan tới user
    const [type, setType] = useState(0)
    const { id, sprintId } = useParams()

    const projectInfo = useSelector(state => state.listProject.projectInfo)
    const [valueDashboard, setValueDashboard] = useState('')
    const listUser = useSelector(state => state.user.list)
    const userInfo = useSelector(state => state.user.userInfo)
    const processList = useSelector(state => state.listProject.processList)
    const [currentProcess, setCurrentProcess] = useState(null)
    const sprintInfo = useSelector(state => state.listProject.sprintInfo)
    const [valueProcess, setValueProcess] = useState('')
    //su dung cho debounce search
    const search = useRef(null)
    const navigate = useNavigate()

    const [open, setOpen] = useState(false);
    const [openAddProcess, setOpenAddProcess] = useState(false)
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
        console.log("chay vo tan a");
    }, [])

    //su dung cho truong hien thi member
    const memberColumns = [
        {
            title: 'Avatar',
            dataIndex: 'avatar',
            key: 'avatar',
            render: (text, record, index) => {
                return <Avatar src={text} size={30} alt={index} />
            }
        },
        {
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
            render: (text, record, index) => {
                return <span>{text}</span>
            }
        },
        {
            title: 'Action',
            key: 'action',
            dataIndex: '_id',
            render: (text, record, index) => {
                if (projectInfo?.creator.toString() === userInfo.id) {
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
        return <Popover key={value._id} content={renderTableMembers(table)} title="Members">
            <Avatar src={value.avatar} key={value._id} />
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

            return `${days} days ${hours} hours remaining`
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
        if (dest === null) {
            return
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
                                            issue?.assignees?.map((user, index) => {
                                                if (index === 3) {
                                                    return <Avatar key={issue._id} size={40}>...</Avatar>
                                                } else if (index <= 2) {
                                                    return <Avatar size={30} key={issue._id} src={user.avatar} />
                                                }
                                                return null
                                            })
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

    const renderMembersAndFeatureAdd = () => {
        return <AutoComplete
            style={{ width: '100%' }}
            onSearch={(value) => {
                //kiem tra gia tri co khac null khong, khac thi xoa
                if (search.current) {
                    clearTimeout(search.current)
                }
                search.current = setTimeout(() => {
                    dispatch(getUserKeyword(value))
                }, 500)
            }}
            value={valueDashboard}
            onChange={(value) => {
                setValueDashboard(value)
            }}
            defaultValue=''
            options={listUser?.reduce((newListUser, user) => {
                if (user._id !== userInfo.id) {
                    return [...newListUser, { label: user.username, value: user._id }]
                }
                return newListUser
            }, [])}
            onSelect={(value, option) => {
                setValueDashboard(option.label)
                dispatch(insertUserIntoProject({
                    project_id: projectInfo?._id,  //id cua project
                    user_id: value   //id cua username
                }))

                dispatch(GetProjectAction(projectInfo?._id, ""))
            }}
            placeholder="input here"
        />
    }

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
                            title: <a href="">Projects</a>,
                        },
                        {
                            title: <a href="/workflow" onClick={() => {
                                //proceed store backlog in localstorage
                                const processListCopy = [...processList]
                                localStorage.setItem('nodes', JSON.stringify(processListCopy))
                                localStorage.setItem('edges', JSON.stringify([{ id: `e0-${processListCopy[0]._id}`, source: '0', target: processListCopy[0]._id, label: 'Created' }]))
                            }}>Hidden</a>,
                        }
                    ]}
                />
            </div>
            <div className='title'>
                <h4>{Object?.keys(sprintInfo).length === 0 ? "Dashboard" : sprintInfo.sprint_name}</h4>
                <div className='d-flex'>
                    <button className='btn btn-transparent m-0 mr-2' style={{ fontSize: '12px' }}>{projectInfo.marked === true ? <i className="fa-solid fa-star" style={{ color: '#ff8b00' }}></i> : <i className="fa-regular fa-star"></i>}</button>
                    <Button className='m-0 mr-2' type='primary'><i className="fa fa-clock mr-2"></i>{sprintInfo !== null ? calculateTaskRemainingTime(dayjs(new Date()), dayjs(sprintInfo.end_date)) : "hehe"}</Button>
                    <Button className='m-0 mr-2' type='primary'>Complete Sprint</Button>
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
            <p>{Object?.keys(sprintInfo).length === 0 ? "" : sprintInfo.sprint_goal}</p>
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
                    {projectInfo?.members?.map((value, index) => {
                        const table = <Table columns={memberColumns} rowKey={value._id} dataSource={projectInfo?.members} />
                        return renderAvatarMembers(value, table)
                    })}

                    <Popover placement="right" title="Add User" content={renderMembersAndFeatureAdd()} trigger="click">
                        <Avatar style={{ backgroundColor: '#87d068' }}>
                            <i className="fa fa-plus"></i>
                        </Avatar>
                    </Popover>
                </div>
                
                
            </div>
            <div className="content" style={{ overflowX: 'scroll', width: '100%', display: '-webkit-box', padding: '15px 20px', scrollbarWidth: 'none', backgroundColor: 'white' }}>
                <DragDropContext onDragEnd={(result) => {
                    handleDragEnd(result)
                }}>
                    {processList?.map((process, index) => (<div className="card" style={{ width: '16rem', height: '28rem', fontWeight: 'bold', scrollbarWidth: 'none' }}>
                        <div className='d-flex justify-content-between align-items-center' style={{ backgroundColor: process.tag_color, color: 'white', padding: '3px 10px' }}>
                            <div className="card-header d-flex align-items-center" style={{ color: 'black' }}>
                                {process?.name_process} <Avatar className='ml-2' size={25}><span style={{fontSize: 12, display: 'flex'}}>{sprintInfo !== null ? sprintInfo?.issue_list?.filter(issue => issue.issue_type === process._id).length : 0}</span></Avatar>
                                {/* {countEleStatus(0, type)} */}
                            </div>
                            <div className='dropdown'>
                                <button style={{ height: '30px' }} className='btn btn-light p-0 pl-3 pr-3' type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
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
                    </div>))}
                </DragDropContext>
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
            </div>
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
        </div>
    )
}
