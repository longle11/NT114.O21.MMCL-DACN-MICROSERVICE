import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { getInfoIssue, updateInfoIssue } from '../../redux/actions/IssueAction'
import { updateUserInfo } from '../../redux/actions/UserAction'
import { iTagForIssueTypes, iTagForPriorities, priorityTypeOptions } from '../../util/CommonFeatures'
import { Avatar, Button, Divider, Input, InputNumber, Select, Space, Tag, Tooltip } from 'antd'
import { UserOutlined } from '@ant-design/icons';
import { NavLink, useParams } from 'react-router-dom'
import './IssueTag.css'
import { LightenDarkenColor } from '../../util/HandleColor'
import { displayComponentInModalInfo } from '../../redux/actions/ModalAction'
import InfoModal from '../../components/Modal/InfoModal/InfoModal'
import { delay } from '../../util/Delay'
import { DISPLAY_LOADING, HIDE_LOADING } from '../../redux/constants/constant'
export default function IssueTag(props) {
    const dispatch = useDispatch()
    const [editSummary, setEditSummary] = useState({
        open: '',
        value: ''
    })
    const [editStoryPoint, setEditStoryPoint] = useState({
        open: '',
        value: 0
    })
    const [editAssignees, setEditAssignees] = useState({
        open: '',
        value: []
    })
    const [editIssueType, setEditIssueType] = useState({
        open: '',
        value: {}
    })
    const [editEpicLink, setEditEpicLink] = useState({
        open: '',
        value: {}
    })
    const [editFixVersion, setEditFixVersion] = useState({
        open: '',
        value: {}
    })
    const [editIssuePriority, setEditIssuePriority] = useState({
        open: '',
        value: 0
    })
    const onChangeAssignees = props.onChangeAssignees
    const onChangeIssuePriority = props.onChangeIssuePriority
    const onChangeStoryPoint = props.onChangeStoryPoint
    const onChangeParent = props.onChangeParent
    const onChangeIssueType = props.onChangeIssueType
    const onChangeKey = props.onChangeKey
    const onChangeIssueStatus = props.onChangeIssueStatus
    const onChangeVersions = props.onChangeVersions
    const onChangeEpics = props.onChangeEpics
    const [dropDownLeft, setDropDownLeft] = useState(false)
    const { id } = useParams()
    const issue = props.issue

    const userInfo = props.userInfo
    const projectInfo = props.projectInfo
    const sprintList = props.sprintList
    const provided = props.provided
    const processList = props.processList
    const epicList = props.epicList
    const versionList = props.versionList
    const type = props.type
    const renderAssigneeOptions = () => {
        return projectInfo?.members.filter(user => {
            if (!(user.user_info._id === issue.creator._id || issue.assignees.map(assignee => assignee._id).includes(user.user_info._id))) {
                return user
            }
        }).map(user => {
            return {
                desc: <div className='d-flex align-items-center' style={{ width: 'fit-content' }}>
                    <Avatar src={"https://ui-avatars.com/api/?name=longle2003"} />
                    <div className='d-flex flex-column'>
                        <span style={{ fontSize: 13, fontWeight: 'bold' }}>{user.user_info.username}</span>
                        <span style={{ fontSize: 11 }}>{user.user_info.email}</span>
                    </div>
                </div>,
                label: user.user_info.username,
                value: user.user_info._id
            }
        })
    }

    const renderAssignees = () => {
        return <div>
            {editAssignees.open !== issue._id ? (issue.assignees?.length === 0 ? <Avatar size="small" onClick={(e) => {
                e.stopPropagation()
                setEditAssignees({
                    ...editAssignees,
                    open: issue._id
                })
            }} icon={<UserOutlined />} /> : <div>
                {issue.assignees.map((user) => {
                    return <Avatar size={"small"} onClick={(e) => {
                        e.stopPropagation()
                        setEditAssignees({
                            ...editAssignees,
                            open: issue._id
                        })
                    }} src={user?.creator?.avatar} />
                })}
            </div>) : <div style={{ position: 'relative' }}>
                <Select
                    style={{
                        minWidth: 300,
                        width: 'max-content'
                    }}
                    onClick={(e) => {
                        e.stopPropagation()
                    }}
                    optionRender={(option) => {
                        return <Space>
                            <div>
                                {option.data.desc}
                            </div>
                        </Space>
                    }}
                    onBlur={(e) => {
                        e.stopPropagation()
                        setEditAssignees({
                            ...editAssignees,
                            open: ''
                        })
                    }}
                    options={renderAssigneeOptions()}
                />
                <div style={{ position: 'absolute', top: 0, left: '-32%', zIndex: 999999 }}>
                    <Button onClick={(e) => {
                        e.stopPropagation()

                        setEditAssignees({
                            ...editAssignees,
                            open: ''
                        })
                    }} type='primary' className='mr-1'><i className="fa fa-check"></i></Button>
                    <Button onClick={(e) => {
                        e.stopPropagation()
                        setEditAssignees({
                            ...editAssignees,
                            open: ''
                        })
                    }}><i className="fa fa-times"></i></Button>
                </div>
            </div>}
        </div>
    }

    const renderStoryPoint = () => {
        return <span className='ml-2'>
            {
                editStoryPoint.open !== issue._id ? (issue.story_point !== null ? <Avatar size={20}><span className='d-flex' style={{ fontSize: 10 }}>{issue?.story_point}</span></Avatar> : <Avatar onClick={(e) => {
                    e.stopPropagation()
                    setEditStoryPoint({
                        ...editStoryPoint,
                        open: issue._id
                    })
                }} size={20}>-</Avatar>) :
                    <div style={{ position: 'relative' }}>
                        <InputNumber
                            min={1}
                            max={1000}
                            defaultValue={issue.story_point ? parseInt(issue.story_point) : null}
                            onClick={(e) => {
                                e.stopPropagation()
                            }}
                            onBlur={(value) => {
                                if (editStoryPoint.value !== parseInt(issue.story_point)) {
                                    dispatch(updateInfoIssue(issue._id, issue.project_id, { story_point: editStoryPoint.value }, issue.story_point ? issue.story_point.toString() : "None", editStoryPoint.value.toString(), userInfo.id, "updated", "story point"))
                                }
                                setEditStoryPoint({
                                    open: '',
                                    value: 0
                                })
                            }}
                            onChange={(value) => {
                                setEditStoryPoint({
                                    ...editStoryPoint,
                                    value: value
                                })
                            }} />
                        <div style={{ position: 'absolute', zIndex: 10000000, right: 0, display: 'flex' }}>
                            <Button onClick={(e) => {
                                e.stopPropagation()
                                if (editSummary.value.trim() !== issue.summary.trim()) {
                                    if (editStoryPoint.value !== parseInt(issue.story_point)) {
                                        dispatch(updateInfoIssue(issue._id, issue.project_id, { story_point: editStoryPoint.value }, issue.story_point ? issue.story_point.toString() : "None", editStoryPoint.value.toString(), userInfo.id, "updated", "story point"))
                                    }
                                }
                                setEditStoryPoint({
                                    open: '',
                                    value: 0
                                })
                            }} type='primary' className='mr-1'><i className="fa fa-check"></i></Button>
                            <Button onClick={(e) => {
                                e.stopPropagation()
                                setEditStoryPoint({
                                    open: '',
                                    value: 0
                                })
                            }}><i className="fa fa-times"></i></Button>
                        </div>
                    </div>
            }
        </span>
    }

    const renderIssueTypeOptions = () => {
        return processList.filter(process => process._id !== issue.issue_type._id).map(process => {
            return {
                label: process.name_process,
                value: process._id
            }
        })
    }

    const renderIssueType = () => {
        return issue.issue_type !== null ? <div>
            {editIssueType.open !== issue._id ? <Tag onClick={(e) => {
                e.stopPropagation()
                setEditIssueType({
                    ...editIssueType,
                    open: issue._id
                })
            }} className='ml-2' color={LightenDarkenColor(issue?.issue_type?.tag_color, 100)}><span style={{ color: LightenDarkenColor(issue?.issue_type?.tag_color, -100) }}>{issue?.issue_type?.name_process}</span></Tag> : <div style={{ position: 'relative' }}>
                <Select
                    style={{
                        width: 200,
                    }}
                    onClick={(e) => e.stopPropagation()}
                    defaultValue={issue.issue_type?.name_process}
                    onSelect={(value, option) => {
                        setEditIssueType({
                            ...editIssueType,
                            value: option
                        })
                    }}
                    onBlur={() => {
                        dispatch(updateInfoIssue(issue._id, issue.project_id, { issue_type: editIssueType.value.value }, issue.issue_type.name_process, editIssueType.value.label, userInfo.id, "Updated", "type"))
                        setEditIssueType({
                            value: {},
                            open: ''
                        })
                    }}
                    dropdownRender={(menu) => (
                        <>
                            {menu}
                            <Divider
                                style={{
                                    margin: '8px 0',
                                }}
                            />
                            <div className='view-workflow' style={{ padding: '10px 20px', marginTop: 5, width: '190px' }}>
                                <NavLink style={{ textDecoration: 'none', color: 'black' }} to={`/projectDetail/${id}/workflows`}>View your workflow</NavLink>
                            </div>
                        </>
                    )}
                    options={renderIssueTypeOptions()}
                />
                <div style={{ position: 'absolute', zIndex: 99999999, top: 0, left: '-50%' }}>
                    <Button onClick={(e) => {
                        e.stopPropagation()
                        dispatch(updateInfoIssue(issue._id, issue.project_id, { issue_type: editIssueType.value.value }, issue.issue_type.name_process, editIssueType.value.label, userInfo.id, "Updated", "type"))
                        setEditIssueType({
                            value: {},
                            open: ''
                        })
                    }} type='primary' className='mr-1'><i className="fa fa-check"></i></Button>
                    <Button onClick={(e) => {
                        e.stopPropagation()
                        setEditIssueType({
                            value: {},
                            open: ''
                        })
                    }}><i className="fa fa-times"></i></Button>
                </div>
            </div>}
        </div> : <></>
    }

    const renderSummary = () => {
        return editSummary.open === issue._id ? <div style={{ position: 'relative' }}>
            <Input
                defaultValue={issue.summary}
                onKeyDown={(e) => {
                    e.stopPropagation()
                }}
                onKeyUp={(e) => {
                    e.stopPropagation()
                }}
                style={{ width: 400 }}
                onClick={(e) => { e.stopPropagation() }}
                onChange={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    setEditSummary({
                        ...editSummary,
                        value: e.target.value
                    })
                }}
                onBlur={(e) => {
                    if (editSummary.value.trim() !== issue.summary.trim()) {
                        dispatch(updateInfoIssue(issue._id, issue.project_id, { summary: editSummary.value }, issue.summary, editSummary.value.trim(), userInfo.id, "updated", "summary"))
                        setEditSummary({
                            open: '',
                            value: ''
                        })
                    }
                }} />
            <div style={{ position: 'absolute', zIndex: 10000000, right: 0 }}>
                <Button onClick={(e) => {
                    e.stopPropagation()
                    if (editSummary.value.trim() !== issue.summary.trim()) {
                        dispatch(updateInfoIssue(issue._id, issue.project_id, { summary: editSummary.value }, issue.summary, editSummary.value.trim(), userInfo.id, "updated", "summary"))
                        setEditSummary({
                            open: '',
                            value: ''
                        })
                    }
                    setEditSummary({
                        open: '',
                        value: ''
                    })
                }} type='primary' className='mr-1'><i className="fa fa-check"></i></Button>
                <Button onClick={(e) => {
                    e.stopPropagation()
                    setEditSummary({
                        open: '',
                        value: ''
                    })
                }}><i className="fa fa-times"></i></Button>
            </div>
        </div> : <div>
            <span>{issue.summary}</span>
            <button onClick={(e) => {
                e.stopPropagation()
                setEditSummary({
                    ...editSummary,
                    open: issue._id
                })

            }} className='btn btn-light ml-2 btn-edit-summary d-none'><i className="fa fa-pencil-alt" style={{ fontSize: 13 }}></i></button>
        </div>
    }

    const renderEpicListOption = () => {
        return epicList?.filter(epic => epic._id !== issue.epic_link._id).map(epic => {
            return {
                label: epic.epic_name,
                value: epic._id
            }
        })
    }

    const renderEpicLink = () => {
        return issue.epic_link !== null ? <div>
            {editEpicLink.open !== issue._id ? <Tag onClick={(e) => {
                e.stopPropagation()
                setEditEpicLink({
                    ...editEpicLink,
                    open: issue._id
                })
            }} color={LightenDarkenColor(issue.epic_link.tag_color, 50)}><span style={{ color: LightenDarkenColor(issue.epic_link.tag_color, -100) }}>{issue.epic_link.epic_name}</span></Tag> : <div style={{ position: 'relative' }}>
                <Select
                    style={{
                        minWidth: 150,
                        width: 'max-content'
                    }}
                    onClick={(e) => e.stopPropagation()}
                    onBlur={(e) => {
                        e.stopPropagation()

                        dispatch(updateInfoIssue(issue._id, issue.project_id, { epic_link: editEpicLink.value.value }, issue.epic_link ? issue.epic_link.epic_name : "None", editEpicLink.value.label, userInfo.id, "Updated", "epic"))
                        setEditEpicLink({
                            value: {},
                            open: ''
                        })
                    }}
                    onSelect={(value, option) => {
                        setEditEpicLink({
                            ...editEpicLink,
                            value: option
                        })
                    }}
                    defaultValue={issue.epic_link?.epic_name}
                    options={renderEpicListOption()}
                />
                <div style={{ position: 'absolute', zIndex: 99999999, top: 0, left: '-65%' }}>
                    <Button onClick={(e) => {
                        e.stopPropagation()

                        dispatch(updateInfoIssue(issue._id, issue.project_id, { epic_link: editEpicLink.value.value }, issue.epic_link ? issue.epic_link.epic_name : "None", editEpicLink.value.label, userInfo.id, "Updated", "epic"))
                        setEditEpicLink({
                            value: {},
                            open: ''
                        })
                    }} type='primary' className='mr-1'><i className="fa fa-check"></i></Button>
                    <Button onClick={(e) => {
                        e.stopPropagation()

                        setEditEpicLink({
                            value: {},
                            open: ''
                        })
                    }}><i className="fa fa-times"></i></Button>
                </div>
            </div>}
        </div> : <></>
    }

    const renderVersionListOption = () => {
        return versionList?.filter(version => version?._id !== issue.fix_version?._id).map(version => {
            return {
                label: version.version_name,
                value: version._id
            }
        })
    }

    const renderFixVersion = () => {
        return issue.fix_version !== null ? <div>
            {editFixVersion.open !== issue._id ? <Tag onClick={(e) => {
                e.stopPropagation()
                setEditFixVersion({
                    ...editFixVersion,
                    open: issue._id
                })
            }} color={LightenDarkenColor(issue.fix_version.tag_color, 50)}><span style={{ color: LightenDarkenColor(issue.fix_version.tag_color, -100) }}>{issue.fix_version.version_name}</span></Tag> : <div style={{ position: 'relative' }}>
                <Select
                    style={{
                        minWidth: 150,
                        width: 'max-content'
                    }}
                    onClick={(e) => e.stopPropagation()}
                    onSelect={(value, option) => {
                        setEditFixVersion({
                            ...editFixVersion,
                            value: option
                        })
                    }}
                    onBlur={(e) => {
                        e.stopPropagation()
                        dispatch(updateInfoIssue(issue._id, issue.project_id, { fix_version: editFixVersion.value.value }, issue.fix_version ? issue.fix_version.version_name : "None", editFixVersion.value.label, userInfo.id, "Updated", "version"))
                        setEditFixVersion({
                            value: {},
                            open: ''
                        })
                    }}

                    defaultValue={issue.fix_version?.version_name}
                    options={renderVersionListOption()}
                />
                <div style={{ position: 'absolute', zIndex: 99999999, top: 0, left: '-65%' }}>
                    <Button onClick={(e) => {
                        e.stopPropagation()
                        dispatch(updateInfoIssue(issue._id, issue.project_id, { fix_version: editFixVersion.value.value }, issue.fix_version ? issue.fix_version.version_name : "None", editFixVersion.value.label, userInfo.id, "Updated", "version"))
                        setEditFixVersion({
                            value: {},
                            open: ''
                        })
                    }} type='primary' className='mr-1'><i className="fa fa-check"></i></Button>
                    <Button onClick={(e) => {
                        e.stopPropagation()
                        setEditFixVersion({
                            value: {},
                            open: ''
                        })
                    }}><i className="fa fa-times"></i></Button>
                </div>
            </div>}
        </div> : <></>
    }

    const renderIssuePriority = () => {
        return <div>
            {editIssuePriority.open !== issue._id ? <span className='ml-2' onClick={(e) => {
                e.stopPropagation()
                setEditIssuePriority({
                    ...editIssuePriority,
                    open: issue._id
                })
            }}>{iTagForPriorities(issue.issue_priority)}</span> : <div style={{ position: 'relative' }}>
                <Select
                    style={{
                        minWidth: 150,
                        width: 'max-content'
                    }}
                    onClick={(e) => e.stopPropagation()}
                    onSelect={(value, option) => {
                        setEditIssuePriority({
                            ...editIssuePriority,
                            value: value
                        })
                    }}
                    onBlur={(e) => {
                        e.stopPropagation()

                        dispatch(updateInfoIssue(issue._id, issue.project_id, { issue_priority: editIssuePriority.value }, issue.issue_priority, editIssuePriority.value, userInfo.id, "Updated", "priority"))
                        setEditIssuePriority({
                            value: 0,
                            open: ''
                        })
                    }}
                    options={priorityTypeOptions.filter(priority => priority.value != issue.issue_priority)}
                />
                <div style={{ position: 'absolute', zIndex: 99999999, top: 0, left: '-65%' }}>

                    <Button onClick={(e) => {
                        e.stopPropagation()
                        dispatch(updateInfoIssue(issue._id, issue.project_id, { issue_priority: editIssuePriority.value }, issue.issue_priority, editIssuePriority.value, userInfo.id, "Updated", "priority"))
                        setEditIssuePriority({
                            value: 0,
                            open: ''
                        })
                    }} type='primary' className='mr-1'><i className="fa fa-check"></i></Button>
                    <Button onClick={(e) => {
                        e.stopPropagation()

                        setEditIssuePriority({
                            value: 0,
                            open: ''
                        })
                    }}><i className="fa fa-times"></i></Button>
                </div>
            </div>}
        </div>
    }
    return (
        <div
            ref={provided.innerRef}
            {...provided.dragHandleProps}
            {...provided.draggableProps}
            key={`${issue._id.toString()}`}
            onClick={async () => {
                // dispatch({
                //     type: DISPLAY_LOADING
                // })
                // dispatch(getInfoIssue(issue._id.toString()))
                // await delay(200)
                // dispatch({
                //     type: HIDE_LOADING
                // })
                dispatch(displayComponentInModalInfo(<InfoModal issueIdForIssueDetail={null} issueInfo={issue} displayNumberCharacterInSummarySubIssue={10} />))
                //dispatch event to update viewed issue in auth service
                dispatch(updateUserInfo(userInfo?.id, { viewed_issue: issue._id }))
            }}
            className="issues-detail issue-info p-0 issue-info-items">
            <div className={`${issue?.isFlagged ? "isFlagged" : ""}`} style={{ cursor: 'pointer', backgroundColor: issue?.isFlagged ? "#F1CA45" : "#ffff", padding: '5px 5px 5px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className='content-issue d-flex align-items-center'>
                    {onChangeIssueStatus ? <span>{iTagForIssueTypes(issue.issue_status, null, null)}</span> : <></>}
                    {onChangeKey ? <span className='mr-3' style={{ color: '#5e6c84', fontWeight: 'bold' }}>WD-{issue.ordinal_number?.toString()}</span> : <></>}
                    {renderSummary()}
                </div>
                <div className='attach-issue d-flex align-items-center'>
                    {issue?.isFlagged ? <i style={{ fontSize: 15, color: '#FF5630' }} className="fa fa-flag mr-2"></i> : <></>}
                    {issue?.issue_type._id === processList[processList?.length - 1]?._id ? <i style={{ fontSize: 15, color: 'green' }} className="fa fa-check mr-2"></i> : <></>}
                    {onChangeParent ? (issue?.sub_issue_list?.length > 0 ? <Tooltip title={`${issue?.sub_issue_list?.filter(issue => issue?.issue_type?._id === processList[processList.length - 1]?._id).length} of ${issue?.sub_issue_list?.length} child issues completed`}><i style={{ padding: 5 }} className='fa-solid fa-sitemap icon-options mr-3'></i></Tooltip> : <></>) : <></>}
                    {/* specify which components does issue belong to? */}
                    {onChangeVersions ? renderFixVersion() : <></>}
                    {/* specify which epics does issue belong to? */}
                    {onChangeEpics ? renderEpicLink() : <></>}
                    {/* issue type */}
                    {onChangeIssueType ? renderIssueType() : <></>}
                    {/* Assigness */}
                    {onChangeAssignees ? <div className='ml-2'>
                        {renderAssignees()}
                    </div> : <></>}
                    {/* priority */}
                    {onChangeIssuePriority ? <span>{renderIssuePriority()}</span> : <></>}
                    {/* Story points for issue */}
                    {onChangeStoryPoint ? renderStoryPoint() : <></>}
                    <button
                        className='ml-1 setting-issue btn btn-light'
                        style={{ visibility: 'hidden' }}
                        id="dropdownMenuButton"
                        data-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false"
                        onClick={() => {
                            setDropDownLeft(!dropDownLeft)
                        }}>
                        <i className="fa fa-bars"></i>
                    </button >
                    <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                        <li className='dropdown-items-setting' style={{ padding: '5px 15px' }}>
                            <div className='d-flex justify-content-between align-items-center'>
                                <span style={{ marginRight: 20 }}>Move to</span>
                                <i className="fa fa-angle-right" style={{ fontSize: 13 }}></i>
                            </div>
                            <ul className="dropdown-menu dropdown-submenu" style={{ left: 'unset', right: '100%', width: 'max-content' }}>
                                {sprintList?.filter(sprint => sprint._id !== type).map(sprint => {
                                    return <li style={{ padding: '5px 15px' }}>{sprint.sprint_name}</li>
                                })}
                                {type !== "0" ? <li style={{ padding: '5px 15px' }}>Backlog</li> : <></>}
                                <hr style={{ margin: '2px 0' }} />
                                <li style={{ padding: '5px 15px' }}>Top of Backlog</li>
                                <li style={{ padding: '5px 15px' }}>Move up</li>
                                <li style={{ padding: '5px 15px' }}>Move down</li>
                                <li style={{ padding: '5px 15px' }}>Bottom of Backlog</li>
                            </ul>
                        </li>
                        <li className='dropdown-items-setting' style={{ padding: '5px 15px' }}>Copy issue link</li>
                        <li className='dropdown-items-setting' style={{ padding: '5px 15px' }}>Delete</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
