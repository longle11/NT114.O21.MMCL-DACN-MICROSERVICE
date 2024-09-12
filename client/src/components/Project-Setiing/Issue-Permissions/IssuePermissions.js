import { Button, Checkbox, Col, Row, Select } from 'antd'
import React, { useEffect, useRef, useState } from 'react'
import { executePermissions } from '../../../util/Permissions'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { getInfoIssue, getIssuesBacklog, updateInfoIssue } from '../../../redux/actions/IssueAction'
import { iTagForIssueTypes } from '../../../util/CommonFeatures'
import "./IssuePermissions.css"
import { showNotificationWithIcon } from '../../../util/NotificationUtil'
export default function IssuePermissions() {
    const issuesBacklog = useSelector(state => state.issue.issuesBacklog)
    const issueInfo = useSelector(state => state.issue.issueInfo)
    const userInfo = useSelector(state => state.user.userInfo)
    const [editAssigneePermissions, setEditAssigneePermissions] = useState(false)
    const [editMembersPermissions, setEditMembersPermissions] = useState(false)
    const [editViewersPermissions, setEditViewersPermissions] = useState(false)
    const { id, issueId } = useParams()
    const dispatch = useDispatch()
    useEffect(() => {
        if (id) {
            dispatch(getIssuesBacklog(id, null))
        }
        if (issueId !== "issue-permissions") {
            dispatch(getInfoIssue(issueId))
        }
    }, [issueId])

    console.log("issueInfo ", issueInfo);
    
    const chosePermissionsOnAssignees = useRef([])
    const chosePermissionsOnMembers = useRef([])
    const chosePermissionsOnViewers = useRef([])
    const navigate = useNavigate()
    const defaultValueOption = () => {
        const index = permissionOptions()?.findIndex(issue => issue.value === issueId)
        if (index !== -1) {
            return permissionOptions()[index].value
        }
        return null
    }
    const renderDefaultAssigneePermissions = (assigneePermissions) => {
        const permissions = assigneePermissions 
        if (permissions && chosePermissionsOnAssignees !== permissions) {
            chosePermissionsOnAssignees.current = [...permissions]
        }
        return permissions
    }
    const renderDefaultViewerPermissions = (viewerPermissions) => {
        const permissions = viewerPermissions 
        if (permissions && chosePermissionsOnViewers !== permissions) {
            chosePermissionsOnViewers.current = [...permissions]
        }
        return permissions
    }
    const renderDefaultMemberPermissions = (memberPermissions) => {
        const permissions = memberPermissions
        if (permissions && chosePermissionsOnMembers !== permissions) {
            chosePermissionsOnMembers.current = [...permissions]
        }
        return permissions
    }
    const permissionOptions = () => {
        return issuesBacklog?.filter(issue => issue.issue_status !== 4).map(issue => {
            return {
                label: <div className='d-flex align-items-center'>
                    <span className='mr-1 font-weight-bold'>WD-{issue.ordinal_number}</span>
                    <span className='mr-1'>{iTagForIssueTypes(issue.issue_status, null, null)}</span>
                    <span className='mr-1'>{issue.summary}</span>
                </div>,
                value: issue._id
            }
        })
    }
    const renderMemberAndViewerPermissions = (type) => {
        return <div className='mt-2'>
            <div>
                <h6>{type[0].toUpperCase() + type.substring(1)}</h6>
                <div className='d-flex flex-column'>
                    <label className='m-0 font-weight-bold'>Permissions</label>
                    <Checkbox.Group
                        disabled={type === "members" ? !editMembersPermissions : !editViewersPermissions}
                        defaultValue={type === "members" ? renderDefaultMemberPermissions(issueInfo?.permissions?.users_not_belongto_issue?.members?.actions) : renderDefaultViewerPermissions(issueInfo?.permissions?.users_not_belongto_issue?.viewers?.actions)}
                        onChange={(value) => {
                            //on default they had 4 last permissions. we only choose and proceed edit and concat with last permissions
                            if (type === "members") {
                                chosePermissionsOnMembers.current = [...value]
                            } else {
                                chosePermissionsOnViewers.current = [...value]
                            }

                        }}
                    >
                        <Row>
                            {executePermissions.map((permission, index) => {
                                return <Col key={index} className='mt-2' span={10}>
                                    <Checkbox value={permission.value}>{permission.type}</Checkbox>
                                </Col>
                            })}
                        </Row>
                    </Checkbox.Group>
                </div>
            </div>
            <div className='mt-2'>
                {renderButtonsOnViewersOrMembers(type === "members" ? editMembersPermissions : editViewersPermissions, type)}
            </div>
        </div>
    }
    const renderButtonsOnViewersOrMembers = (status, type) => {
        return status ? <div className='d-flex'>
            <Button className='mr-2' onClick={() => {
                if (type === "members") {
                    if (JSON.stringify(chosePermissionsOnMembers.current.sort()) !== JSON.stringify(issueInfo?.permissions?.users_not_belongto_issue?.members?.actions?.sort())) {
                        dispatch(updateInfoIssue(issueInfo._id, issueInfo.project_id._id, {
                            permissions: {
                                users_not_belongto_issue: {
                                    members: {
                                        user_role: 1,
                                        actions: chosePermissionsOnMembers.current
                                    }
                                }
                            }
                        }, null, null, userInfo.id, "changed", "permissions on members"))
                    } else {
                        showNotificationWithIcon("error", "khong co su thay doi trong members")
                    }
                    setEditMembersPermissions(false)
                    chosePermissionsOnMembers.current = []
                } else {
                    if (JSON.stringify(chosePermissionsOnViewers.current.sort()) !== JSON.stringify(issueInfo?.permissions?.users_not_belongto_issue?.viewers?.actions?.sort())) {
                        dispatch(updateInfoIssue(issueInfo._id, issueInfo.project_id._id, {
                            permissions: {
                                users_not_belongto_issue: {
                                    viewers: {
                                        user_role: 2,
                                        actions: chosePermissionsOnViewers.current
                                    }
                                }
                            }
                        }, null, null, userInfo.id, "changed", "permissions on viewers"))
                    } else {
                        showNotificationWithIcon("error", "khong co su thay doi trong viewers")
                    }
                    chosePermissionsOnViewers.current = []
                    setEditViewersPermissions(false)
                }
            }} type="primary">Save</Button>
            <Button onClick={() => {
                if (type === "members") {
                    chosePermissionsOnMembers.current = []
                    setEditMembersPermissions(false)
                } else {
                    chosePermissionsOnViewers.current = []
                    setEditViewersPermissions(false)
                }
            }}>Cancel</Button>
        </div> : <Button onClick={() => {
            if (type === "members") {
                chosePermissionsOnMembers.current = []
                setEditMembersPermissions(true)
            } else {
                chosePermissionsOnViewers.current = []
                setEditViewersPermissions(true)
            }
        }} type="primary">Edit</Button>
    }
    return (
        <div>
            {
                issuesBacklog?.filter(issue => issue.issue_status !== 4)?.length > 0 ? <div>
                    <div className='d-flex flex-column mb-4 mt-2'>
                        <label>Select issue which you want to apply permissions</label>
                        <Select
                            options={permissionOptions()}
                            style={{ width: '50%' }}
                            defaultValue={defaultValueOption()}
                            onChange={(value) => {
                                navigate(`/projectDetail/${id}/settings/issue-permissions/${value}`)
                            }} />
                    </div>
                    {
                        (issueInfo !== null || issueInfo !== undefined) && issueInfo?._id === issueId ? <div>
                            <ul className="nav nav-tabs" id="myTab" role="tablist">
                                <li className="nav-item">
                                    <a className="nav-link active" id="user_belongto_issue-tab" data-toggle="tab" href="#user_belongto_issue" role="tab" aria-controls="user_belongto_issue" aria-selected="true">Users belong to this issue</a>
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link" id="user_notbelongto_issue-tab" data-toggle="tab" href="#user_notbelongto_issue" role="tab" aria-controls="user_notbelongto_issue" aria-selected="false">Users don't belong to this issue</a>
                                </li>
                            </ul>
                            <div className="tab-content" id="myTabContent">
                                <div className="tab-pane fade show active" id="user_belongto_issue" role="tabpanel" aria-labelledby="user_belongto_issue-tab">
                                    <div>
                                        <h6>Reporter</h6>
                                        <div className='d-flex align-items-center ml-2'>
                                            <input type="checkbox" checked disabled name="reporter_permission" value="All permissions" />
                                            <label className='m-0 ml-2 font-weight-bold' htmlFor="reporter_permission"> Full permissions</label>
                                        </div>
                                    </div>
                                    <div>
                                        <h6>Assignees</h6>
                                        <div className='d-flex ml-2 d-flex flex-column '>
                                            <label className='m-0 font-weight-bold'> Execute Permissions</label>
                                            <Checkbox.Group
                                                style={{
                                                    width: '50%',
                                                }}
                                                disabled={!editAssigneePermissions}
                                                defaultValue={renderDefaultAssigneePermissions(issueInfo?.permissions?.users_belongto_issue?.assignees)}
                                                onChange={(value) => {
                                                    //on default they had 4 last permissions. we only choose and proceed edit and concat with last permissions
                                                    chosePermissionsOnAssignees.current = [...value]
                                                }}
                                            >
                                                <Row>
                                                    {executePermissions.map((permission, index) => {
                                                        return <Col key={index} className='mt-2' span={10}>
                                                            <Checkbox value={permission.value}>{permission.type}</Checkbox>
                                                        </Col>
                                                    })}
                                                </Row>
                                            </Checkbox.Group>
                                        </div>
                                    </div>
                                    <div className='mt-2'>
                                        {editAssigneePermissions ? <div className='d-flex'>
                                            <Button className='mr-2' onClick={() => {
                                                if (JSON.stringify(chosePermissionsOnAssignees.current.sort()) !== JSON.stringify(issueInfo?.permissions?.users_belongto_issue?.assignees?.sort())) {
                                                    dispatch(updateInfoIssue(issueInfo._id, issueInfo.project_id._id, {
                                                        permissions: {
                                                            users_belongto_issue: {
                                                                assignees: chosePermissionsOnAssignees.current
                                                            }
                                                        }
                                                    }, null, null, userInfo.id, "changed", "permissions"))
                                                }
                                                chosePermissionsOnAssignees.current = []
                                                setEditAssigneePermissions(false)
                                            }} type="primary">Save</Button>
                                            <Button onClick={() => {
                                                setEditAssigneePermissions(false)
                                                chosePermissionsOnAssignees.current = []
                                            }}>Cancel</Button>
                                        </div> : <Button onClick={() => {
                                            setEditAssigneePermissions(true)
                                            chosePermissionsOnAssignees.current = []
                                        }} type="primary">Edit</Button>}
                                    </div>
                                </div>
                                <div className="tab-pane fade" id="user_notbelongto_issue" role="tabpanel" aria-labelledby="user_notbelongto_issue-tab" style={{ overflowY: 'auto', height: 600, scrollbarWidth: 'thin', overflowX: 'none' }}>
                                    <div>
                                        <h6>Administrators</h6>
                                        <div className='d-flex align-items-center ml-2'>
                                            <input type="checkbox" checked disabled name="admin_permission" />
                                            <label className='m-0 ml-2 font-weight-bold' htmlFor="admin_permission"> Full permissions</label>
                                        </div>
                                    </div>
                                    <div className='d-flex'>
                                        {renderMemberAndViewerPermissions("members")}
                                        {renderMemberAndViewerPermissions("viewers")}
                                    </div>
                                </div>
                            </div>
                        </div> : <></>
                    }

                </div> : <span>No issues</span>
            }
        </div>
    )
}
