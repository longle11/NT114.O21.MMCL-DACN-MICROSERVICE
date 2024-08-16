import { Button, Tag, Avatar, Col, Switch, Checkbox, Row, Input, Select, Tooltip } from 'antd'
import Search from 'antd/es/input/Search'
import React, { useEffect, useRef, useState } from 'react'

import { useDispatch, useSelector } from 'react-redux';
import { drawer_edit_form_action } from '../../../redux/actions/DrawerAction';
import { NavLink, useParams } from 'react-router-dom';
import './Backlog.css'
import { issueTypeWithoutOptions, iTagForIssueTypes, iTagForPriorities } from '../../../util/CommonFeatures';
import { createIssue, getInfoIssue, getIssuesBacklog } from '../../../redux/actions/IssueAction';
import CreateEpic from '../../Forms/CreateEpic/CreateEpic';
import { getEpicList } from '../../../redux/actions/CategoryAction';
import { GetProcessListAction, GetSprintListAction } from '../../../redux/actions/ListProjectAction';
import { createSprintAction, deleteSprintAction } from '../../../redux/actions/CreateProjectAction';
import CreateSprint from '../../Forms/CreateSprint/CreateSprint';
import dayjs from 'dayjs';
export default function Backlog() {
    const [onChangeVersion, setOnChangeVersion] = useState(false)
    const [onChangeEpic, setOnChangeEpic] = useState(false)
    const issuesBacklog = useSelector(state => state.issue.issuesBacklog)
    const processList = useSelector(state => state.listProject.processList)
    const sprintList = useSelector(state => state.listProject.sprintList)
    const dispatch = useDispatch()
    const onChange = (checkedValues) => {
        console.log('checked = ', checkedValues);
    };
    const epicList = useSelector(state => state.categories.epicList)
    useEffect(() => {
        dispatch(getIssuesBacklog(id))
        dispatch(getEpicList(id))
        dispatch(GetProcessListAction(id))
        dispatch(GetSprintListAction(id))
        console.log("lap vo tan");
        setIssueList(issuesBacklog)
    }, [dispatch])
    const userInfo = useSelector(state => state.user.userInfo)
    const { id } = useParams()
    const issueDrag = useRef({})
    const [issueStatus, setIssueStatus] = useState(0)
    var summary = ''
    const [openCreatingBacklog, setOpenCreatingBacklog] = useState(false)
    const [openCreatingSprint, setOpenCreatingSprint] = useState({
        id: null,
        open: false
    })
    const [issueList, setIssueList] = useState(issuesBacklog)
    const handleOnDragStart = (e, issue, index) => {
        issueDrag.current = issue
    }
    const handleOnDragEnter = (index) => {
        if (issueList.length !== 0) {
            const tempIssueList = [...issueList]
            const getCurrentIssueIndex = tempIssueList.findIndex(issue => issue._id.toString() === issueDrag.current._id)

            const getFinalIssueIndex = index

            var tempPos = tempIssueList[getCurrentIssueIndex]
            tempIssueList[getCurrentIssueIndex] = tempIssueList[getFinalIssueIndex]
            tempIssueList[getFinalIssueIndex] = tempPos

            setIssueList(tempIssueList)
        }
    }
    const handleDragEnd = (e) => {
        issueDrag.current = {}
        setIssueList([...issueList]) 
    }

    const renderIssuesBacklog = () => {
        const issuesInBacklog = issueList?.map((issue, index) => {
            const cssDragIssue = issue._id.toString() === issueDrag.current._id ? 'dragIssue' : ''
            return <li draggable="true"
                    onDragStart={(e) => {
                        handleOnDragStart(e, issue, index)
                    }}
                    onDragEnter={(e) => {
                        handleOnDragEnter(index)
                    }}
                    onDragEnd={(e) => {
                        handleDragEnd(e)
                    }}
                    data-toggle="modal"
                    data-target="#infoModal"
                    key={issue._id.toString()}
                    onClick={() => {
                        dispatch(getInfoIssue(issue._id.toString()))
                    }} 
                    className={`issues-backlog-detail ${cssDragIssue}`} 
                    style={{ cursor: 'pointer', borderBottom: '1px solid #ddd', padding: '5px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                    {iTagForPriorities(issue.issue_priority)}
                    {/* Story points for issue Backlog */}
                    {issue.story_point !== null ? <Avatar size={14}>{issue.story_point}</Avatar> : <Avatar size={14}>-</Avatar>}
                </div>
            </li>
        })
        if (issuesInBacklog.length !== 0) {
            return <ul style={{ listStyle: 'none', padding: 0, border: '1px solid #ddd', height: 'auto', maxHeight: '200px', overflowY: 'auto', scrollbarWidth: 'none' }}>
                {issuesInBacklog}
            </ul>
        }
        else {
            return <div style={{ padding: 0, border: '2px dashed #ddd', height: '60px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <p className='m-0'>Your backlog is empty</p>
            </div>
        }
    }

    const renderSprintList = () => {
        return sprintList?.map(sprint => {
            return <div className='issues-info-backlog' style={{ width: '100%', margin: '10px', backgroundColor: '#f7f8f9' }}>
                <div className="d-flex justify-content-between align-items-center mb-1" style={{ padding: '5px 10px' }}>
                    <div className='d-flex'>
                        <h6 className='m-0' style={{ lineHeight: '26px' }}>{sprint.sprint_name}</h6>
                        <button style={{ fontSize: '13px' }} className="btn btn-transparent p-0" onClick={() => {
                            dispatch(drawer_edit_form_action(<CreateSprint currentSprint={sprint} />, 'Save', '700px'))
                        }}><i className="fa fa-pen ml-2"></i> Edit sprint</button>
                        <span className='ml-2' style={{ lineHeight: '26px' }}>{sprint.issue_list.length} issues</span>
                    </div>
                    <div className='d-flex align-items-center'>
                        <div className='mr-2'>
                            {processList?.map((process) => {
                                return <Tooltip placement="bottom" title={`${process.name_process[0] + process.name_process.toLowerCase().substring(1)} 0 of 0 (issue count)`}>
                                    <Avatar size={'small'} style={{ backgroundColor: process.tag_color }}>0</Avatar>
                                </Tooltip>
                            })}
                        </div>
                        {sprint.issue_list.length !== 0 ? <button className='btn btn-primary' onClick={() => {

                        }}>Start sprint</button> : <button className='btn btn-primary' disabled>Start sprint</button>}
                        <div className='dropdown'>
                            <button className='btn btn-transparent' type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><i className="fa-sharp fa-solid fa-bars"></i></button>
                            <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                <button className="dropdown-item" onClick={() => {
                                    dispatch(drawer_edit_form_action(<CreateSprint currentSprint={sprint} />, 'Save', '700px'))
                                }}>Edit sprint</button>
                                <button className="dropdown-item" onClick={() => {
                                    dispatch(deleteSprintAction(sprint._id.toString(), sprint.project_id.toString()))
                                }}>Delete Sprint</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='sprint-info d-flex flex-column' style={{ padding: '5px 10px' }}>
                    {sprint.start_date !== null && sprint.end_date !== null ? <span><span style={{ fontWeight: 'bold' }}>Date: </span> {dayjs(sprint.start_date).format("DD:MM:YYYY")} - {dayjs(sprint.end_date).format("DD:MM:YYYY")}</span> : <></>}
                    {sprint.sprint_goal !== null ? <span><span style={{ fontWeight: 'bold' }}>Description: </span>{sprint.sprint_goal}</span> : <></>}
                </div>
                {sprint.issue_list.length === 0 ? <div style={{ padding: 0, border: '2px dashed #ddd', height: '150px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div className='description-sprint d-flex align-items-center'>
                        <img src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1BtLhkORsgCvCDFhKq9ZQ0ICDjaxJAntxfA&s)' style={{ width: '50px', height: '50px' }} alt="sprint img" />
                        <div className='description-text-sprint d-flex flex-column ml-2'>
                            <span style={{ fontWeight: '700' }}>Plan your sprint</span>
                            <span>Drag issues from the <b>Backlog</b> section, or create new issues, to plan the work for this sprint.<br /> Select <b>Start sprint</b> when you're ready</span>
                        </div>
                    </div>
                </div> : <></>}
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
                                options={issueTypeWithoutOptions}
                            />
                            <Input placeholder="What need to be done?" onChange={(e) => {
                                summary = e.target.value
                            }} style={{ border: 'none', borderRadius: 0 }} />
                            <Button type="primary" onClick={() => {
                                dispatch(createIssue({
                                    project_id: id,
                                    issue_status: issueStatus,
                                    summary: summary,
                                    creator: userInfo.id
                                }, issuesBacklog, null, null, userInfo.id))

                                //set default is 0 which means story
                                setIssueStatus(0)
                            }}>Save</Button>
                            <Button type="danger" onClick={() => {
                                setOpenCreatingSprint({
                                    id: null,
                                    open: false
                                })
                            }}>Cancel</Button>
                        </div>
                    }
                    return <></>
                })}
            </div>
        })
    }

    const renderEpicList = () => {
        const getEpics = epicList.map(epic => {
            const epicTag = "collapse" + epic._id.toString()
            const epicID = "#" + epicTag
            return <div key={epic._id.toString()} style={{ border: '2px solid #aaa', borderRadius: '10px' }}>
                <button style={{ width: '100%', textAlign: 'left' }} className="btn btn-transparent" type="button" data-toggle="collapse" data-target={epicID} aria-expanded="false" aria-controls={epicTag}>
                    <i className="fa-solid fa-caret-down mr-3"></i>{epic.epic_name}
                </button>
                <div className="collapse" id={epicTag}>
                    <div className='d-flex flex-column'>
                        <div>
                            <span>Issues (0)</span>
                            <span>Completed (0)</span>
                            <span>Unestimated (0)</span>
                            <span>Estimate (0)</span>
                        </div>
                    </div>
                </div>
            </div>
        })
        return <div>
            {getEpics}
        </div>
    }
    return (
        <div>
            <span>Projects / Website Developments / WD Board</span>
            <div className='d-flex justify-content-between'>
                <h4>Backlog</h4>
                <div>
                    <button className='btn btn-primary'>Share</button>
                    <button className='btn btn-danger'>Setting</button>
                </div>
            </div>
            <div className="search-info-backlogs d-flex">
                <div className="search-block">
                    <Search
                        placeholder="input search text"
                        style={{ width: 300 }}
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
                }} className=' ml-2 mr-3'>All issues</Button>
                <Button onClick={() => {
                    // setType(1)
                }}>Only my issues</Button>
            </div>
            <div style={{ margin: '0 40px' }}>
                <div style={{ display: 'flex' }}>
                    <div>
                        <button className='btn btn-primary' id="dropdownVersionButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">VERSIONS<i className="fa-sharp fa-solid fa-caret-down ml-4"></i></button>
                        <div className="dropdown-menu" aria-labelledby="dropdownVersionButton">
                            <p>Unreleased versions in this project</p>
                            <hr />
                            <div className='d-flex align-items-center'>
                                <Switch onChange={() => {
                                    setOnChangeVersion(!onChangeVersion)
                                }} value={onChangeVersion} />
                                <span className='ml-3'>Show version panel</span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <button className='btn btn-primary' id="dropdownEpicButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">EPICS<i className="fa-sharp fa-solid fa-caret-down ml-4"></i></button>
                        <div className="dropdown-menu" aria-labelledby="dropdownEpicButton">
                            <Checkbox.Group style={{ width: '100%', margin: '10px' }} onChange={onChange}>
                                <Row>
                                    <Col span="16">
                                        <Checkbox value="A">A</Checkbox>
                                    </Col>
                                    <Col span="16">
                                        <Checkbox value="B">B</Checkbox>
                                    </Col>
                                    <Col span="16">
                                        <Checkbox value="C">C</Checkbox>
                                    </Col>
                                    <Col span="16">
                                        <Checkbox value="D">D</Checkbox>
                                    </Col>
                                    <Col span="16">
                                        <Checkbox value="E">E</Checkbox>
                                    </Col>
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
                <div className='main-info-backlog' style={{ minHeight: '200px', display: onChangeEpic || onChangeVersion ? 'flex' : 'block' }}>
                    <div className="card version-info-backlog" style={{ width: '25rem', display: onChangeVersion ? 'block' : 'none', margin: '10px 5px', height: '30rem' }}>
                        <div className='d-flex justify-content-between'>
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
                    </div>

                    <div className="card epic-info-backlog" style={{ width: '25rem', display: onChangeEpic ? 'block' : 'none', margin: '10px 5px', height: '30rem' }}>
                        <div className='d-flex justify-content-between'>
                            <h6>Epci</h6>
                            <i className="fa-solid fa-xmark" onClick={() => {
                                setOnChangeEpic(!onChangeEpic)
                            }}></i>
                        </div>
                        <div className="card-body d-flex flex-column justify-content-center p-2">
                            <button style={{ width: '100%', textAlign: 'left', border: '2px solid #aaa', borderRadius: '10px' }} className='btn btn-transparent'>Issue without epic</button>
                            {renderEpicList()}
                        </div>
                        <div>
                            <NavLink to='#' onClick={() => {
                                dispatch(drawer_edit_form_action(<CreateEpic />, 'Save', '760px'))
                            }}>Create issue in epic</NavLink>
                            <NavLink to='#'>Viewed linked pages</NavLink>
                        </div>
                    </div>

                    <div className='d-flex flex-column' style={{ width: '100%' }}>
                        {renderSprintList()}

                        <div className='issues-info-backlog' style={{ width: '100%', margin: '10px' }}>
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h6 className='m-0'>Backlog <span>7 issues</span></h6>
                                <div className='d-flex align-items-center'>
                                    <div className='mr-2'>
                                        {processList?.map((process) => {
                                            return <Avatar size={'small'} style={{ backgroundColor: process.tag_color }}>0</Avatar>
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
                                    summary = e.target.value
                                }} style={{ border: 'none', borderRadius: 0 }} />
                                <Button type="primary" onClick={() => {
                                    dispatch(createIssue({
                                        project_id: id,
                                        issue_status: issueStatus,
                                        summary: summary,
                                        creator: userInfo.id
                                    }, issuesBacklog, null, null, userInfo.id))

                                    //set default is 0 which means story
                                    setIssueStatus(0)
                                }}>Save</Button>
                                <Button type="danger" onClick={() => {
                                    setOpenCreatingBacklog(false)
                                }}>Cancel</Button>
                            </div>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
