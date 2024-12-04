import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { updateInfoIssue, updateIssueFromBacklog } from '../../redux/actions/IssueAction'
import { CopyLinkButton, issueTypeWithoutOptions, iTagForIssueTypes, iTagForPriorities, priorityTypeOptions } from '../../util/CommonFeatures'
import { Avatar, Button, Divider, Input, InputNumber, Select, Space, Tag, Tooltip } from 'antd'
import { UserOutlined } from '@ant-design/icons';
import { NavLink, useParams } from 'react-router-dom'
import './IssueTag.css'
import { displayComponentInModalInfo } from '../../redux/actions/ModalAction'
import InfoModal from '../../components/Modal/InfoModal/InfoModal'
import { updateSprintAction } from '../../redux/actions/CreateProjectAction'
import domainName from '../../util/Config'
import { getValueOfStringFieldInIssue, getValueOfNumberFieldInIssue, getValueOfArrayObjectFieldInIssue, getValueOfObjectFieldInIssue } from '../../util/IssueFilter';
import { delay } from '../../util/Delay'
import { DISPLAY_LOADING, HIDE_LOADING } from '../../redux/constants/constant'
import { updateUserInfo } from '../../redux/actions/UserAction'

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
    const [editIssueStatus, setEditIssueStatus] = useState({
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
    const issuesBacklog = props.issuesBacklog
    const index = props.index
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
            if (!(user.user_info._id === issue.creator._id || getValueOfArrayObjectFieldInIssue(issue, "assignees")?.map(assignee => assignee._id).includes(user.user_info._id))) {
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
            {editAssignees.open !== issue._id ? (getValueOfArrayObjectFieldInIssue(issue, "assignees")?.length === 0 ? <Avatar size="medium" onClick={(e) => {
                e.stopPropagation()
                setEditAssignees({
                    ...editAssignees,
                    open: issue._id
                })
            }} icon={<UserOutlined />} /> : <div>
                <Avatar.Group>
                    {getValueOfArrayObjectFieldInIssue(issue, "assignees")?.map((user) => {
                        return <Avatar size={"medium"} onClick={(e) => {
                            e.stopPropagation()
                            setEditAssignees({
                                ...editAssignees,
                                open: issue._id
                            })
                        }} src={user?.avatar} />
                    })}
                </Avatar.Group>
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
                editStoryPoint.open !== issue._id ? <Avatar onClick={(e) => {
                    e.stopPropagation()
                    setEditStoryPoint({
                        ...editStoryPoint,
                        open: issue._id
                    })
                }} size={20}>{typeof getValueOfNumberFieldInIssue(issue, "story_point") === "number" ? <span className='d-flex' style={{ fontSize: 10 }}>{getValueOfNumberFieldInIssue(issue, "story_point")}</span> : '-'}</Avatar> :
                    <div style={{ position: 'relative' }}>
                        <InputNumber
                            min={1}
                            max={1000}
                            defaultValue={getValueOfNumberFieldInIssue(issue, "story_point") ? parseInt(getValueOfNumberFieldInIssue(issue, "story_point")) : null}
                            onClick={(e) => {
                                e.stopPropagation()
                            }}
                            onBlur={(value) => {
                                if (editStoryPoint.value !== parseInt(getValueOfNumberFieldInIssue(issue, "story_point"))) {
                                    dispatch(updateInfoIssue(
                                        issue._id,
                                        issue.project_id._id,
                                        { story_point: editStoryPoint.value },
                                        getValueOfNumberFieldInIssue(issue, "story_point") ? getValueOfNumberFieldInIssue(issue, "story_point")?.toString() : "None",
                                        editStoryPoint.value.toString(),
                                        userInfo.id,
                                        "updated",
                                        "story point",
                                        projectInfo,
                                        userInfo
                                    ))
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
                                if (editStoryPoint.value !== parseInt(getValueOfNumberFieldInIssue(issue, "story_point"))) {
                                    dispatch(updateInfoIssue(
                                        issue._id,
                                        issue.project_id._id,
                                        { story_point: editStoryPoint.value },
                                        getValueOfNumberFieldInIssue(issue, "story_point") ? getValueOfNumberFieldInIssue(issue, "story_point").toString() : "None",
                                        editStoryPoint.value.toString(),
                                        userInfo.id,
                                        "updated",
                                        "story point",
                                        projectInfo,
                                        userInfo
                                    ))
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
        return processList.filter(process => process._id !== getValueOfObjectFieldInIssue(issue, "issue_type")?._id).map(process => {
            return {
                label: process.name_process,
                value: process._id
            }
        })
    }

    const renderIssueType = () => {
        return getValueOfObjectFieldInIssue(issue, "issue_type") !== null ? <div>
            {editIssueType.open !== issue._id ? <Tag onClick={(e) => {
                e.stopPropagation()
                setEditIssueType({
                    ...editIssueType,
                    open: issue._id
                })
            }} className='ml-2' color={getValueOfObjectFieldInIssue(issue, "issue_type")?.tag_colo}><span>{getValueOfObjectFieldInIssue(issue, "issue_type")?.name_process}</span></Tag> : <div style={{ position: 'relative' }}>
                <Select
                    style={{
                        width: 200,
                    }}
                    onClick={(e) => e.stopPropagation()}
                    defaultValue={getValueOfObjectFieldInIssue(issue, "issue_type")?.name_process}
                    onSelect={(value, option) => {
                        setEditIssueType({
                            ...editIssueType,
                            value: option
                        })
                    }}
                    onBlur={() => {
                        if (editIssueType.value.value !== getValueOfObjectFieldInIssue(issue, "issue_type")?._id) {
                            var issueCompleted = false
                            if (processList[processList.length - 1]._id?.toString() === editIssueType.value.value) {
                                issueCompleted = true
                            }
                            dispatch(updateInfoIssue(
                                issue._id,
                                issue.project_id._id,
                                {
                                    issue_type: editIssueType.value.value,
                                    isCompleted: issueCompleted
                                },
                                getValueOfObjectFieldInIssue(issue, "issue_type")?.name_process,
                                editIssueType.value.label,
                                userInfo.id,
                                "Updated",
                                "type",
                                projectInfo,
                                userInfo
                            ))
                        }
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
                        if (editIssueType.value.value !== getValueOfObjectFieldInIssue(issue, "issue_type")?._id) {
                            var issueCompleted = false
                            if (processList[processList.length - 1]._id?.toString() === editIssueType.value.value) {
                                issueCompleted = true
                            }
                            dispatch(updateInfoIssue(
                                issue._id,
                                issue.project_id._id,
                                {
                                    issue_type: editIssueType.value.value,
                                    isCompleted: issueCompleted
                                },
                                getValueOfObjectFieldInIssue(issue, "issue_type").name_process,
                                editIssueType.value.label,
                                userInfo.id,
                                "Updated",
                                "type",
                                projectInfo,
                                userInfo
                            ))
                        }
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
        return editSummary.open === issue?._id ? <div style={{ position: 'relative' }}>
            <Input
                defaultValue={getValueOfStringFieldInIssue(issue, "summary")}
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
                    if (editSummary.value.trim() !== getValueOfStringFieldInIssue(issue, "summary")?.trim()) {
                        dispatch(updateInfoIssue(
                            issue._id,
                            issue.project_id._id,
                            { summary: editSummary.value },
                            getValueOfStringFieldInIssue(issue, "summary"),
                            editSummary.value.trim(),
                            userInfo.id,
                            "updated",
                            "summary",
                            projectInfo,
                            userInfo
                        ))
                        setEditSummary({
                            open: '',
                            value: ''
                        })
                    }
                }} />
            <div style={{ position: 'absolute', zIndex: 10000000, right: 0 }}>
                <Button onClick={(e) => {
                    e.stopPropagation()
                    if (editSummary.value.trim() !== getValueOfStringFieldInIssue(issue, "summary")?.trim()) {
                        dispatch(updateInfoIssue(
                            issue._id,
                            issue.project_id._id,
                            { summary: editSummary.value },
                            getValueOfStringFieldInIssue(issue, "summary"),
                            editSummary.value.trim(),
                            userInfo.id,
                            "updated",
                            "summary",
                            projectInfo,
                            userInfo
                        ))
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
            <span style={{ textDecoration: getValueOfObjectFieldInIssue(issue, 'issue_type')?.type_process === 'done' ? 'line-through' : 'none' }}>{getValueOfStringFieldInIssue(issue, "summary")}</span>
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
        return epicList?.filter(epic => epic._id !== getValueOfObjectFieldInIssue(issue, "epic_link")._id).map(epic => {
            return {
                label: epic.epic_name,
                value: epic._id
            }
        })
    }

    const renderEpicLink = () => {
        return getValueOfObjectFieldInIssue(issue, "epic_link") !== null ? <div>
            {editEpicLink.open !== issue._id ? <Tag onClick={(e) => {
                e.stopPropagation()
                setEditEpicLink({
                    ...editEpicLink,
                    open: issue._id
                })
            }} color={getValueOfObjectFieldInIssue(issue, "epic_link").tag_color}><span style={{ color: 'black' }}>{getValueOfObjectFieldInIssue(issue, "epic_link").epic_name}</span></Tag> : <div style={{ position: 'relative' }}>
                <Select
                    style={{
                        minWidth: 150,
                        width: 'max-content'
                    }}
                    onClick={(e) => e.stopPropagation()}
                    onBlur={(e) => {
                        e.stopPropagation()
                        if (editEpicLink.value.value !== getValueOfObjectFieldInIssue(issue, "epic_link")?._id) {
                            dispatch(updateInfoIssue(
                                issue._id,
                                issue.project_id._id,
                                { epic_link: editEpicLink.value.value },
                                getValueOfObjectFieldInIssue(issue, "epic_link") ? getValueOfObjectFieldInIssue(issue, "epic_link").epic_name : "None",
                                editEpicLink.value.label,
                                userInfo.id,
                                "Updated",
                                "epic",
                                projectInfo,
                                userInfo
                            ))
                        }
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
                    defaultValue={getValueOfObjectFieldInIssue(issue, "epic_link")?.epic_name}
                    options={renderEpicListOption()}
                />
                <div style={{ position: 'absolute', zIndex: 99999999, top: 0, left: '-65%' }}>
                    <Button onClick={(e) => {
                        e.stopPropagation()
                        if (editEpicLink.value.value !== getValueOfObjectFieldInIssue(issue, "epic_link")?._id) {
                            dispatch(updateInfoIssue(
                                issue._id,
                                issue.project_id._id,
                                { epic_link: editEpicLink.value.value },
                                getValueOfObjectFieldInIssue(issue, "epic_link") ? getValueOfObjectFieldInIssue(issue, "epic_link").epic_name : "None",
                                editEpicLink.value.label,
                                userInfo.id,
                                "Updated",
                                "epic",
                                projectInfo,
                                userInfo
                            ))
                        }
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
        return versionList?.filter(version => version?._id !== getValueOfObjectFieldInIssue(issue, "fix_version")?._id).map(version => {
            return {
                label: version.version_name,
                value: version._id
            }
        })
    }

    const renderFixVersion = () => {
        return getValueOfObjectFieldInIssue(issue, "fix_version") !== null ? <div>
            {editFixVersion.open !== issue?._id ? <Tag onClick={(e) => {
                e.stopPropagation()
                setEditFixVersion({
                    ...editFixVersion,
                    open: issue?._id
                })
            }} color={getValueOfObjectFieldInIssue(issue, "fix_version")?.tag_color}><span style={{ color: 'black' }}>{getValueOfObjectFieldInIssue(issue, "fix_version")?.version_name}</span></Tag> : <div style={{ position: 'relative' }}>
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
                        if (editFixVersion.value.value !== getValueOfObjectFieldInIssue(issue, "fix_version")?._id) {
                            dispatch(updateInfoIssue(
                                issue._id,
                                issue.project_id._id,
                                { fix_version: editFixVersion },
                                getValueOfObjectFieldInIssue(issue, "fix_version") ? getValueOfObjectFieldInIssue(issue, "fix_version")?.version_name : "None",
                                editFixVersion.value.label,
                                userInfo.id,
                                "Updated",
                                "version",
                                projectInfo,
                                userInfo
                            ))
                        }
                        setEditFixVersion({
                            value: {},
                            open: ''
                        })
                    }}

                    defaultValue={getValueOfObjectFieldInIssue(issue, "fix_version")?.version_name}
                    options={renderVersionListOption()}
                />
                <div style={{ position: 'absolute', zIndex: 99999999, top: 0, left: '-65%' }}>
                    <Button onClick={(e) => {
                        e.stopPropagation()
                        if (editFixVersion.value.value !== getValueOfObjectFieldInIssue(issue, "fix_version")?._id) {
                            dispatch(updateInfoIssue(
                                issue._id,
                                issue.project_id._id,
                                { fix_version: editFixVersion.value.value },
                                getValueOfObjectFieldInIssue(issue, "fix_version") ? getValueOfObjectFieldInIssue(issue, "fix_version").version_name : "None",
                                editFixVersion.value.label,
                                userInfo.id,
                                "Updated",
                                "version",
                                projectInfo,
                                userInfo
                            ))
                        }
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
            }}>{iTagForPriorities(getValueOfNumberFieldInIssue(issue, "issue_priority"))}</span> : <div style={{ position: 'relative' }}>
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
                        if (editIssuePriority.value !== getValueOfNumberFieldInIssue(issue, "issue_priority")) {
                            dispatch(updateInfoIssue(
                                issue._id,
                                issue.project_id._id,
                                { issue_priority: editIssuePriority.value },
                                getValueOfNumberFieldInIssue(issue, "issue_priority"),
                                editIssuePriority.value,
                                userInfo.id,
                                "Updated",
                                "priority",
                                projectInfo,
                                userInfo
                            ))
                        }
                        setEditIssuePriority({
                            value: 0,
                            open: ''
                        })
                    }}
                    options={priorityTypeOptions.filter(priority => priority.value != getValueOfNumberFieldInIssue(issue, "issue_priority"))}
                />
                <div style={{ position: 'absolute', zIndex: 99999999, top: 0, left: '-65%' }}>

                    <Button onClick={(e) => {
                        e.stopPropagation()
                        if (editIssuePriority.value !== getValueOfNumberFieldInIssue(issue, "issue_priority")) {
                            dispatch(updateInfoIssue(
                                issue._id,
                                issue.project_id._id,
                                { issue_priority: editIssuePriority.value },
                                getValueOfNumberFieldInIssue(issue, "issue_priority"),
                                editIssuePriority.value,
                                userInfo.id,
                                "Updated",
                                "priority",
                                projectInfo,
                                userInfo
                            ))
                        }
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

    const renderIssueStatus = () => {
        return <div>
            {editIssueStatus.open !== issue?._id ? <span className='ml-2' onClick={(e) => {
                e.stopPropagation()
                setEditIssueStatus({
                    ...editIssueStatus,
                    open: issue._id
                })
            }}>{iTagForIssueTypes(getValueOfNumberFieldInIssue(issue, "issue_status"), null, null, projectInfo?.issue_types_default)}</span> : <div style={{ position: 'relative' }}>
                {console.log("projectInfo?.issue_types_default ", issueTypeWithoutOptions(projectInfo?.issue_types_default))}
                <Select
                    style={{
                        minWidth: 100,
                        width: 'max-content'
                    }}
                    defaultValue={issueTypeWithoutOptions(projectInfo?.issue_types_default)[getValueOfNumberFieldInIssue(issue, "issue_status")]}
                    onClick={(e) => e.stopPropagation()}
                    onSelect={(value, option) => {
                        setEditIssueStatus({
                            ...editIssueStatus,
                            value: value
                        })
                    }}
                    onBlur={(e) => {
                        e.stopPropagation()
                        if (editIssueStatus.value !== getValueOfNumberFieldInIssue(issue, "issue_status")) {
                            dispatch(updateInfoIssue(
                                issue?._id,
                                issue?.project_id?._id,
                                { issue_status: editIssueStatus.value },
                                getValueOfNumberFieldInIssue(issue, "issue_status"),
                                editIssueStatus.value,
                                userInfo.id,
                                "Updated",
                                "status",
                                projectInfo,
                                userInfo
                            ))
                        }
                        setEditIssueStatus({
                            value: 0,
                            open: ''
                        })
                    }}
                    options={issueTypeWithoutOptions(projectInfo?.issue_types_default)}
                />
                <div style={{ position: 'absolute', zIndex: 99999999, right: 0 }}>

                    <Button onClick={(e) => {
                        e.stopPropagation()
                        if (editIssueStatus.value !== getValueOfNumberFieldInIssue(issue, "issue_status")) {
                            dispatch(updateInfoIssue(
                                issue._id,
                                issue.project_id._id,
                                { issue_status: editIssueStatus.value },
                                getValueOfNumberFieldInIssue(issue, "issue_status"),
                                editIssueStatus.value,
                                userInfo.id,
                                "Updated",
                                "status",
                                projectInfo,
                                userInfo
                            ))
                        }
                        setEditIssueStatus({
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

    const displayMoveUpBtn = () => {
        var checkValid = false
        if (getValueOfStringFieldInIssue(issue, "current_sprint") === null && index === issuesBacklog?.length - 1) {
            checkValid = true
        }
        if (getValueOfStringFieldInIssue(issue, "current_sprint") !== null) {
            const getSprintIndex = sprintList?.findIndex(sprint => sprint._id === getValueOfStringFieldInIssue(issue, "current_sprint"))
            if (getSprintIndex !== -1 && sprintList[getSprintIndex]?.issue_list?.length - 1 === index) {
                checkValid = true
            }
        }
        if (checkValid) return <></>
        return <li onClick={(e) => {
            e.stopPropagation()
            //if this is an issue in the sprint
            if (getValueOfStringFieldInIssue(issue, "current_sprint") !== null) {
                dispatch(updateSprintAction(id, { issue_id: issue._id, issue_source_index: index, dest_source_index: index + 1 }))   //add issue to backlog
            }
            else { //inbacklog
                dispatch(updateIssueFromBacklog(id, { issue_source_index: index, issue_dest_index: index + 1 }))   //change the position of backlog's issue
            }
        }} className='dropdown-items-setting' style={{ padding: '5px 15px' }}>Move up</li>
    }

    const displayMoveDownBtn = () => {
        var checkValid = false
        if (getValueOfStringFieldInIssue(issue, "current_sprint") === null && index === 0) {
            checkValid = true
        }
        if (getValueOfStringFieldInIssue(issue, "current_sprint") !== null && index === 0) {
            checkValid = true
        }
        if (checkValid) return <></>
        return <li onClick={(e) => {
            e.stopPropagation()
            //if this is an issue in the sprint
            if (getValueOfStringFieldInIssue(issue, "current_sprint") !== null) {
                dispatch(updateSprintAction(id, { issue_id: issue._id, issue_source_index: index, dest_source_index: index - 1 }))
            }
            else { //inbacklog
                dispatch(updateIssueFromBacklog(id, { issue_source_index: index, issue_dest_index: index - 1 }))    //change the position of backlog's issue
            }
        }} className='dropdown-items-setting' style={{ padding: '5px 15px' }}>Move down</li>
    }


    return (
        issue ? <div
            ref={provided.innerRef}
            {...provided.dragHandleProps}
            {...provided.draggableProps}
            key={`${issue?._id?.toString()}`}
            onClick={async (e) => {
                if (!((e.target.tagName === "I" && e.target.className.includes("fa-bars")) || ((e.target.tagName === "BUTTON" && e.target.className.includes("setting-issue"))))) {
                    dispatch({
                        type: DISPLAY_LOADING
                    })
                    dispatch(displayComponentInModalInfo(<InfoModal
                        userInfo={userInfo}
                        colLeft={8}
                        colRight={4}
                        height={630}
                        issueIdForIssueDetail={issue._id}
                        displayNumberCharacterInSummarySubIssue={10}
                    />, 1100))

                    //dispatch event to update viewed issue in auth service
                    dispatch(updateUserInfo(userInfo?.id, { viewed_issue: issue._id }))
                    await delay(500)

                    dispatch({
                        type: HIDE_LOADING
                    })
                }
            }}
            className="issues-detail issue-info p-0 issue-info-items">
            <div className={`${issue?.isFlagged ? "isFlagged" : ""}`} style={{ cursor: 'pointer', backgroundColor: issue?.isFlagged ? "#F1CA45" : "#ffff", padding: '5px 5px 5px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className='content-issue d-flex align-items-center'>
                    {onChangeIssueStatus ? renderIssueStatus() : <></>}
                    {onChangeKey ? <span className='mr-3' style={{ color: '#5e6c84', fontWeight: 'bold' }}>{projectInfo?.key_name}-{issue?.ordinal_number?.toString()}</span> : <></>}
                    {renderSummary()}
                </div>
                <div className='attach-issue d-flex align-items-center'>
                    {issue?.isFlagged ? <i style={{ fontSize: 15, color: '#FF5630' }} className="fa fa-flag mr-2"></i> : <></>}
                    {getValueOfObjectFieldInIssue(issue, "issue_type")?.type_process === 'done' ? <i style={{ fontSize: 15, color: 'green' }} className="fa fa-check mr-2"></i> : <></>}
                    {onChangeParent ? (issue?.sub_issue_list?.length > 0 ? <Tooltip title={`${issue?.sub_issue_list?.filter(issue => getValueOfObjectFieldInIssue(issue, "issue_type")?._id === processList[processList?.length - 1]?._id).length} of ${issue?.sub_issue_list?.length} child issues completed`}><i style={{ padding: 5 }} className='fa-solid fa-sitemap icon-options mr-3'></i></Tooltip> : <></>) : <></>}
                    {/* specify which components does issue belong to? */}
                    {onChangeVersions ? renderFixVersion() : <></>}
                    {/* specify which epics does issue belong to? */}
                    {onChangeEpics ? renderEpicLink() : <></>}
                    {/* issue type */}
                    {onChangeIssueType ? renderIssueType() : <></>}
                    {/* Assigness */}
                    {onChangeAssignees ? <div className='ml-2'> {renderAssignees()} </div> : <></>}
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
                        onClick={(e) => {
                            console.log("e.target.tagName ", e.target.tagName);
                            if (!["BUTTON", "I"].includes(e.target.tagName)) {
                                e.stopPropagation()
                            }
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
                                    return <li onClick={(e) => {
                                        e.stopPropagation()
                                        var getSprintName = ""
                                        const getSprintNameIndex = sprintList?.findIndex(currentSprint => currentSprint._id.toString() === getValueOfStringFieldInIssue(issue, "current_sprint"))
                                        if (getSprintNameIndex !== -1) {
                                            getSprintName = sprintList[getSprintNameIndex].sprint_name
                                        }
                                        dispatch(updateInfoIssue(
                                            issue._id, id,
                                            { current_sprint: sprint._id },
                                            getValueOfStringFieldInIssue(issue, "current_sprint") !== null ? getSprintName : "Backlog",
                                            sprint.sprint_name,
                                            userInfo.id,
                                            "updated",
                                            "sprint",
                                            projectInfo,
                                            userInfo
                                        ))
                                        if (getValueOfStringFieldInIssue(issue, "current_sprint") !== null) {
                                            dispatch(updateSprintAction(getValueOfStringFieldInIssue(issue, "current_sprint"), { issue_id: issue._id, inserted_index: 0 }))  //delete issue in old sprint
                                        } else {
                                            dispatch(updateIssueFromBacklog(id, { issue_id: issue._id, inserted_index: -1 }))   //delete issue from backlog
                                        }
                                        dispatch(updateSprintAction(sprint._id, { issue_id: issue._id, inserted_index: 0 }))  //add issue in new sprint
                                    }} className='dropdown-items-setting' style={{ padding: '5px 15px' }}>{sprint.sprint_name}</li>
                                })}
                                {type !== "0" ? <li onClick={(e) => {
                                    e.stopPropagation()
                                    var getSprintName = ""
                                    const getSprintNameIndex = sprintList?.findIndex(currentSprint => currentSprint._id.toString() === getValueOfStringFieldInIssue(issue, "current_sprint"))
                                    if (getSprintNameIndex !== -1) {
                                        getSprintName = sprintList[getSprintNameIndex].sprint_name
                                        dispatch(updateInfoIssue(
                                            issue._id, id,
                                            { current_sprint: null },
                                            getSprintName,
                                            "Backlog",
                                            userInfo.id,
                                            "updated",
                                            "sprint",
                                            projectInfo,
                                            userInfo
                                        ))
                                        dispatch(updateSprintAction(getValueOfStringFieldInIssue(issue, "current_sprint"), { issue_id: issue._id, inserted_index: 0 }))  //delete issue in old sprint
                                        dispatch(updateIssueFromBacklog(id, { issue_id: issue._id }))   //add issue to backlog
                                    }
                                }} className='dropdown-items-setting' style={{ padding: '5px 15px' }}>Backlog</li> : <></>}
                                {
                                    (getValueOfStringFieldInIssue(issue, "current_sprint") === null && sprintList?.length > 0) || (getValueOfStringFieldInIssue(issue, "current_sprint") !== null) ? <hr style={{ margin: '2px 0' }} /> : <></>
                                }
                                <li onClick={(e) => {
                                    e.stopPropagation()
                                    //if this is an issue in the sprint
                                    if (getValueOfStringFieldInIssue(issue, "current_sprint") !== null) {
                                        const getSprintNameIndex = sprintList?.findIndex(currentSprint => currentSprint._id.toString() === getValueOfStringFieldInIssue(issue, "current_sprint"))
                                        if (getSprintNameIndex !== -1) {
                                            dispatch(updateSprintAction(getValueOfStringFieldInIssue(issue, "current_sprint"), { issue_id: issue._id, inserted_index: 0 }))  //delete issue in old sprint
                                            dispatch(updateInfoIssue(
                                                issue._id, id,
                                                { current_sprint: null },
                                                sprintList[getSprintNameIndex].sprint_name,
                                                "Backlog",
                                                userInfo.id,
                                                "updated",
                                                "sprint",
                                                projectInfo,
                                                userInfo
                                            ))
                                            dispatch(updateIssueFromBacklog(id, { issue_id: issue._id, inserted_index: 0 }))   //add issue to backlog
                                        }
                                    } else { //inbacklog
                                        dispatch(updateIssueFromBacklog(id, { issue_id: issue._id, inserted_index: 0 }))   //add issue to backlog
                                    }
                                }} className='dropdown-items-setting' style={{ padding: '5px 15px' }}>Top of Backlog</li>

                                {displayMoveUpBtn()}

                                {displayMoveDownBtn()}

                                <li onClick={(e) => {
                                    e.stopPropagation()
                                    //if this is an issue in the sprint
                                    if (getValueOfStringFieldInIssue(issue, "current_sprint") !== null) {
                                        const getSprintNameIndex = sprintList?.findIndex(currentSprint => currentSprint._id.toString() === getValueOfStringFieldInIssue(issue, "current_sprint"))
                                        if (getSprintNameIndex !== -1) {
                                            dispatch(updateSprintAction(getValueOfStringFieldInIssue(issue, "current_sprint"), { issue_id: issue._id, inserted_index: 0 }))  //delete issue in old sprint
                                            dispatch(updateInfoIssue(
                                                issue._id, id,
                                                { current_sprint: null },
                                                sprintList[getSprintNameIndex].sprint_name,
                                                "Backlog",
                                                userInfo.id,
                                                "updated",
                                                "sprint",
                                                projectInfo,
                                                userInfo
                                            ))
                                            dispatch(updateIssueFromBacklog(id, { issue_id: issue._id, inserted_index: issuesBacklog?.length }))   //add issue to backlog
                                        }
                                    } else { //inbacklog
                                        dispatch(updateIssueFromBacklog(id, { issue_id: issue._id, inserted_index: issuesBacklog?.length }))   //change the position of issue to the last list
                                    }
                                }} className='dropdown-items-setting' style={{ padding: '5px 15px' }}>Bottom of Backlog</li>
                            </ul>
                        </li>

                        <li onClick={(e) => {
                            e.stopPropagation()
                            CopyLinkButton(`${domainName}/projectDetail/${id}/issues/issue-detail/${issue._id}`)
                        }} className='dropdown-items-setting' style={{ padding: '5px 15px' }}>Copy issue link</li>
                        <li className='dropdown-items-setting' style={{ padding: '5px 15px' }}>Delete</li>
                    </ul>
                </div>
            </div>
        </div> : <></>
    )
}
