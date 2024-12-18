import React, { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Avatar, Button, Input, Modal } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import Search from 'antd/es/input/Search'
import { SHOW_MODAL_INPUT_TOKEN } from '../../redux/constants/constant'
import './MenuBarHeader.css'
import { drawer_edit_form_action } from '../../redux/actions/DrawerAction'
import { iTagForIssueTypes } from '../../util/CommonFeatures'
import { updateProjectAction } from '../../redux/actions/CreateProjectAction'
import TaskForm from '../Forms/TaskForm'
import { getNotificationByUserIdAction, updateNotificationByUserIdAction } from '../../redux/actions/NotificationAction'
import { convertTime } from '../../validations/TimeValidation'
import htmlParser from 'html-react-parser'
import { userLoggedoutAction } from '../../redux/actions/UserAction'

export default function MenuBarHeader() {
    const userInfo = useSelector(state => state.user.userInfo)
    const showModalInputToken = useSelector(state => state.user.showModalInputToken)
    const listProject = useSelector(state => state.listProject.listProject)
    const projectInfo = useSelector(state => state.listProject.projectInfo)

    const notificationList = useSelector(state => state.notification.notificationList)
    const [currentPassowrd, setCurrentPassowrd] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [isDisplayWorkingOn, setIsDisplayWorkingOn] = useState(false)
    const [isDisplayNotification, setIsDisplayNotification] = useState(false)

    useEffect(() => {
        if (userInfo?.id) {
            dispatch(getNotificationByUserIdAction(userInfo?.id))
        }
        if (isDisplayWorkingOn) setIsDisplayWorkingOn(false)
        if (isDisplayNotification) setIsDisplayNotification(false)
    }, [userInfo])
    const dispatch = useDispatch()
    const navigate = useNavigate()


    const renderSubContent = (notification) => {
        if (notification.action_type === "projectmanagement-user:added") {
            return <div className='d-flex align-items-center'>
                <Button style={{ padding: "0 10px" }} disabled={notification.isRead} onClick={(e) => {
                    e.stopPropagation()
                    dispatch(updateNotificationByUserIdAction(notification._id, { isRead: true, action_type: notification.action_type }, navigate, notification.link_url))
                }} type='primary'>
                    <i style={{ fontSize: 12 }} className="fa fa-check"></i>
                </Button>
                <Button style={{ padding: "0 10px" }} disabled={notification.isRead} onClick={(e) => {
                    e.stopPropagation()
                    //proceed update "read" status of this notification
                    dispatch(updateNotificationByUserIdAction(notification._id, { isRead: true }, null, null))
                }} className='ml-2'>
                    <i style={{ fontSize: 12 }} className="fa fa-times"></i>
                </Button>
            </div>
        }
    }

    const renderNotificationList = (isRead) => {
        return notificationList?.filter(notification => isRead === notification.isRead)?.length > 0 ? notificationList?.filter(notification => isRead === notification.isRead).map(notification => {
            return <NavLink onClick={(e) => {
                dispatch(updateNotificationByUserIdAction(notification._id, { isRead: true }, navigate, notification.link_url))
            }} style={{ textDecoration: 'none', color: '#414a4c', padding: '5px 10px' }} key={notification._id} className='d-flex align-items-center justify-content-between edit-notifications mt-1'>
                <div style={{ width: '100%' }} className='d-flex align-items-center'>
                    <div className='mr-2'>
                        <Avatar size="large" style={{ border: '2px solid #fff' }} src={notification.send_from.avatar} />
                    </div>
                    <div style={{ width: '100%' }}>
                        <div className='d-flex align-items-center justify-content-between'>
                            <div>
                                <div>
                                    <span style={{ fontSize: 15 }} className='font-weight-bold mr-2'>{notification.send_from.username}</span>
                                    <span style={{ fontSize: 14 }}>({convertTime(notification.createAt, false)})</span>
                                </div>
                                <div className='d-flex align-items-center'>
                                    <span style={{ fontSize: 13 }} className='mr-2'>{htmlParser(notification.content)}</span>
                                    {renderSubContent(notification)}
                                </div>
                            </div>
                            {
                                !isRead ? <div>
                                    <i style={{ color: "#89CFF0", fontSize: 12 }} className="fa fa-circle"></i>
                                </div> : <></>
                            }
                        </div>

                    </div>

                </div>
            </NavLink>
        }) : <div style={{ height: '100%' }} className='d-flex align-items-center justify-content-center h-100'>
            <span>You haven't received any recent notifications</span>
        </div>
    }

    const renderProjectInfo = () => {
        const getIndex = listProject?.map(project => project._id.toString()).findIndex(projectId => {
            return projectId === userInfo?.project_working
        })
        if (getIndex !== -1) {
            return <div onClick={() => {
                navigate(`/projectDetail/${listProject[getIndex]._id.toString()}/backlog`)
            }} className='d-flex justify-content-between align-items-center current-project' style={{ padding: '5px 0px 5px 15px' }}>
                <div className='d-flex align-items-center'>
                    <div className='project-img mr-2'>
                        <Avatar shape='square' src="https://z45letranphilong.atlassian.net/rest/api/2/universal_avatar/view/type/project/avatar/10406?size=medium" />
                    </div>
                    <div className='project-info' style={{ fontSize: '12px' }}>
                        <p className='mb-1'>{listProject[getIndex].name_project}</p>
                        <span>Software project</span>
                    </div>
                </div>
                <div className={`${listProject[getIndex].marked === false ? "project-marked d-none" : "d-block"}`}>
                    <button className='btn btn-transparent' style={{ fontSize: '12px' }} onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        dispatch(updateProjectAction(listProject[getIndex]._id?.toString(), { marked: !listProject[getIndex].marked }, null))
                    }}>{listProject[getIndex].marked === true ? <i className="fa-solid fa-star" style={{ color: '#ff8b00', fontSize: 15 }}></i> : <i className="fa-solid fa-star" style={{ fontSize: 15 }}></i>}</button>
                </div>
            </div>
        }

        return <p style={{ fontSize: '13px', textAlign: 'center' }}>No project recently</p>
    }
    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <NavLink className="navbar-brand" style={{ fontWeight: "bolder" }} to="#">TaskScheduler</NavLink>
            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon" />
            </button>
            <div className="collapse navbar-collapse" id="navbarSupportedContent">
                <ul className="navbar-nav mr-auto">
                    <li className="nav-item dropdown mr-2">
                        <NavLink className="nav-link dropdown-toggle" to="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            Projects
                        </NavLink>
                        <div className="dropdown-menu" aria-labelledby="navbarDropdown" style={{ minWidth: '150px', width: '250px' }}>
                            <div>
                                <p style={{ fontSize: '12px', fontWeight: 'bold', marginLeft: '15px' }}>WORKED ON</p>
                                {renderProjectInfo()}
                            </div>
                            <div className="dropdown-divider" />
                            <a className="dropdown-item" style={{ cursor: "pointer", padding: '5px 10px', fontSize: '13px' }} href="/manager">View all projects</a>
                            <a className="dropdown-item" href="/create-project/software-project/templates" style={{ cursor: "pointer", padding: '5px 10px', fontSize: '13px' }}>Create your project</a>
                        </div>
                    </li>
                    <li className={`nav-item mr-2`} style={{ position: 'relative' }}>
                        <NavLink onClick={() => {
                            setIsDisplayWorkingOn(!isDisplayWorkingOn)
                        }} onBlur={(e) => {
                            //means user click outside component which is not related to dropdonw component
                            if (e.relatedTarget === null) {
                                setIsDisplayWorkingOn(!isDisplayWorkingOn)
                            }
                        }} className="nav-link dropdown-toggle" to="#" id="navbarDropdown" role="button">
                            Your Work
                        </NavLink>
                        <div className={`nav-working-on ${isDisplayWorkingOn ? 'show' : ''}`} style={{ maxHeight: 450, minWidth: 350 }}>
                            <div>
                                <ul className="nav nav-tabs custom-yourwork-navs" id="myTab" role="tablist">
                                    <li className="nav-item">
                                        <a className="nav-link active" id="assignedToMe-tab" data-toggle="tab" href="#assignedToMe" role="tab" aria-controls="assignedToMe" aria-selected="true">Assigned to me</a>
                                    </li>
                                    <li className="nav-item">
                                        <a className="nav-link" id="recent-tab" data-toggle="tab" href="#recent" role="tab" aria-controls="recent" aria-selected="false">Recent</a>
                                    </li>
                                    <li className="nav-item">
                                        <a className="nav-link" id="contact-tab" data-toggle="tab" href="#contact" role="tab" aria-controls="contact" aria-selected="false">Contact</a>
                                    </li>
                                </ul>
                                <div className="tab-content" id="myTabContent">
                                    <div className="tab-pane fade show active mt-2" id="assignedToMe" role="tabpanel" aria-labelledby="assignedToMe-tab">
                                        {userInfo?.assigned_issues.length > 0 ? userInfo?.assigned_issues?.slice(0, userInfo?.assigned_issues.length > 10 ? 10 : userInfo?.assigned_issues.length).map(issue => {
                                            return <a href={`/projectDetail/${issue?.issue_id?.project_id}/issues/issue-detail/${issue?.issue_id?.issue_id}`} onClick={() => {
                                                setIsDisplayWorkingOn(false)
                                            }} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center pt-2 pb-2 pl-2 pr-4 ml-0" style={{ border: 'none' }}>
                                                <div className='d-flex align-items-center'>
                                                    <span>{iTagForIssueTypes(issue?.issue_id?.issue_status, null, null, projectInfo?.issue_types_default)}</span>
                                                    <div className='d-flex flex-column' style={{ width: '100%' }}>
                                                        <span>{issue?.issue_id?.summary}</span>
                                                        <div className='d-flex align-items-center'>
                                                            <span className='mr-2'>WD-{issue?.issue_id?.ordinal_number?.toString()}</span>
                                                            <i className="fa-solid fa-circle mr-2" style={{ fontSize: 5 }} />
                                                            <span>{issue?.issue_id?.project_id?.name_project}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div><span>{issue?.issue_type?.name_process}</span></div>
                                            </a>
                                        }) : <p style={{ padding: '20px 40px', margin: '0', marginTop: 10 }}>You have no open issues assigned to you</p>}

                                        <hr className='mb-0' />
                                        <div className='tab-content-move' style={{ padding: '10px 20px', margin: '10px 0' }}>
                                            <NavLink to={"/your-work"} onClick={() => {
                                                setIsDisplayWorkingOn(false)
                                            }} style={{ textDecoration: 'none' }}>Go to your Work Page</NavLink>
                                        </div>
                                    </div>
                                    <div className="tab-pane fade" id="recent" role="tabpanel" aria-labelledby="recent-tab">
                                        <div className='d-flex flex-column' style={{ margin: '0' }}>
                                            <div style={{ maxHeight: 300, height: 'max-content', overflowY: 'auto', scrollbarWidth: 'thin', marginTop: 10 }}>
                                                <span style={{ fontSize: 13, fontWeight: 'bold', margin: '10px 8px' }}>WORKED ON</span>
                                                <div className="list-group m-0" style={{ border: 'none' }}>
                                                    {
                                                        //  only display 10 issues newest
                                                        userInfo?.working_issues.length > 0 ? userInfo?.working_issues?.slice(0, userInfo?.working_issues?.length > 10 ? 10 : userInfo?.working_issues?.length).map(issue => {
                                                            return <a href={`/projectDetail/${issue?.issue_id?.project_id}/issues/issue-detail/${issue?.issue_id?.id}`} onClick={() => {
                                                                setIsDisplayWorkingOn(false)
                                                            }} className="list-group-item list-group-item-action d-flex align-items-center pt-2 pb-2 pl-2 pr-4 ml-0" style={{ border: 'none' }}>
                                                                <span>{iTagForIssueTypes(issue?.issue_id?.issue_status, null, null, projectInfo?.issue_types_default)}</span>
                                                                <div className='d-flex flex-column' style={{ width: '100%' }}>
                                                                    <span>{issue?.issue_id?.summary}</span>
                                                                    <div className='d-flex align-items-center'>
                                                                        <span className='mr-2'>WD-{issue?.issue_id?.ordinal_number?.toString()}</span>
                                                                        <i className="fa-solid fa-circle mr-2" style={{ fontSize: 5 }} />
                                                                        <span>{issue?.issue_id?.project_id?.name_project}</span>
                                                                    </div>
                                                                </div>
                                                            </a>
                                                        }) : <p style={{ padding: '20px 40px', margin: '0' }}>You have no open issues worked on</p>
                                                    }
                                                </div>
                                                <span style={{ fontSize: 13, fontWeight: 'bold', margin: '10px 8px' }}>VIEW</span>
                                                <div className="list-group m-0" style={{ border: 'none' }}>
                                                    {
                                                        //  only display 10 issues newest
                                                        userInfo?.viewed_issues.length > 0 ? userInfo?.viewed_issues?.slice(0, userInfo?.viewed_issues.length > 10 ? 10 : userInfo?.viewed_issues.length).map(issue => {
                                                            return <a href={`/projectDetail/${issue?.issue_id?.project_id}/issues/issue-detail/${issue?.issue_id?.issue_id}`} onClick={() => {
                                                                setIsDisplayWorkingOn(false)
                                                            }} className="list-group-item list-group-item-action d-flex align-items-center pt-2 pb-2 pl-2 pr-4 ml-0" style={{ border: 'none' }}>
                                                                <span>{iTagForIssueTypes(issue?.issue_id?.issue_status, null, null, projectInfo?.issue_types_default)}</span>
                                                                <div className='d-flex flex-column' style={{ width: '100%' }}>
                                                                    <span>{issue?.issue_id?.summary}</span>
                                                                    <div className='d-flex align-items-center'>
                                                                        <span className='mr-2'>WD-{issue?.issue_id?.ordinal_number?.toString()}</span>
                                                                        <i className="fa-solid fa-circle mr-2" style={{ fontSize: 5 }} />
                                                                        <span>{issue?.issue_id?.project_id?.name_project}</span>
                                                                    </div>
                                                                </div>
                                                            </a>
                                                        }) : <p style={{ padding: '20px 40px', margin: '0' }}>You have no open issues worked on</p>
                                                    }
                                                </div>
                                            </div>

                                        </div>
                                        <hr className='mb-0' />
                                        <div className='tab-content-move' style={{ padding: '10px 20px' }}>
                                            <NavLink to={"/your-work"} onClick={() => {
                                                setIsDisplayWorkingOn(false)
                                            }} style={{ textDecoration: 'none' }}>Go to your Work Page</NavLink>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>
                    <li className='nav-item mr-5'>
                        <button onClick={() => {
                            dispatch(drawer_edit_form_action(<TaskForm />, 'Create', 800))
                        }} className="btn btn-primary">Create</button>
                    </li>
                </ul>
                <div className='d-flex align-items-center'>
                    <Search
                        placeholder="input search text"
                        allowClear
                        enterButton="Search"
                        size="large"
                        className='mr-5'
                    />
                    <div className="dropdown-notification">
                        <NavLink onClick={() => {
                            setIsDisplayNotification(!isDisplayNotification)
                        }}
                            id="dropdownMenuLinkNotification"
                            data-toggle="dropdown-notification"
                            aria-haspopup="true"
                            aria-expanded="false"
                            className="d-flex align-items-center mr-3"
                            aria-hidden="true"
                            style={{ textDecoration: 'none', color: '#000' }}
                            onBlur={(e) => {
                                if (!e.relatedTarget) {
                                    setIsDisplayNotification(!isDisplayNotification)
                                }
                            }}>
                            {
                                renderNotificationList(false)?.length > 0 ? <div style={{ color: 'blue', display: 'flex' }}>
                                    <i className="fa fa-bell mr-1" style={{ fontSize: "20px" }} ></i>
                                    <span style={{fontSize: 12}}>({renderNotificationList(false)?.length})</span>
                                </div> : <i className="fa fa-bell" style={{ fontSize: "20px" }} ></i>
                            }
                        </NavLink>
                        <div className={`dropdown-menu ${isDisplayNotification ? "show" : ''}`} aria-labelledby="dropdownMenuLinkNotification" style={{ width: 500, left: 'unset', right: 0, padding: 10, minHeight: 500, marginRight: 20 }}>
                            <div className='d-flex align-items-center justify-content-between'>
                                <h4>Notifications</h4>
                                <i className="fa fa-external-link-alt ml-2"></i>
                            </div>
                            <div>
                                <ul className="nav nav-tabs custom-notification-navs" id="myTab" role="tablist">
                                    <li className="nav-item">
                                        <a style={{ fontSize: 14 }} className="nav-link active" id="unread-tab" data-toggle="tab" href="#unread" role="tab" aria-controls="unread" aria-selected="true">Unread Notification</a>
                                    </li>
                                    <li className="nav-item">
                                        <a style={{ fontSize: 14 }} className="nav-link" id="read-tab" data-toggle="tab" href="#read" role="tab" aria-controls="read" aria-selected="false">Read Notification</a>
                                    </li>
                                </ul>
                                <div style={{ height: 400, overflowY: 'auto', scrollbarWidth: 'thin' }} className="tab-content" id="myTabContent">
                                    <div style={{ height: '100%' }} className="tab-pane fade show active" id="unread" role="tabpanel" aria-labelledby="unread-tab">
                                        {renderNotificationList(false)}
                                    </div>
                                    <div style={{ height: '100%' }} className="tab-pane fade" id="read" role="tabpanel" aria-labelledby="read-tab">
                                        {renderNotificationList(true)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <i className="fa fa-cog" style={{ fontSize: "20px" }} aria-hidden="true"></i>
                </div>
                <li className="nav-item dropdown mr-2">
                    <Avatar className='ml-4' src={userInfo?.avatar} alt="avatar" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" />
                    <div className="dropdown-menu" style={{ right: '0', left: 'auto' }} aria-labelledby="navbarDropdown">
                        <div>
                            <p style={{ fontSize: '14px', marginBottom: '10px', fontWeight: '600', color: "#5E6C84", marginLeft: '15px' }}>ACCOUNT</p>
                            <div className='d-flex align-items-center' style={{ margin: '0 15px' }}>
                                <Avatar className='m-0 mr-2' src={userInfo?.avatar} size={40} alt="avatar" />
                                <div className='d-flex flex-column'>
                                    <span style={{ fontSize: '14px', fontWeight: '600' }}>{userInfo?.username}</span>
                                    <span style={{ fontSize: '12px' }} >{userInfo?.email}</span>
                                </div>
                            </div>
                            <div className="dropdown-item" style={{ marginTop: '10px', padding: '10px 15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <NavLink style={{ cursor: "pointer", fontSize: '13px', color: 'black', textDecoration: 'none' }} to={`/recent/${userInfo?.id}`} >Manage your account</NavLink>
                                <i className="fa fa-info-circle" aria-hidden="true"></i>
                            </div>
                            <div className="dropdown-item" style={{ marginTop: '10px', padding: '10px 15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} onClick={() => {
                                dispatch({
                                    type: SHOW_MODAL_INPUT_TOKEN,
                                    status: true
                                })
                            }}>
                                <NavLink style={{ cursor: "pointer", fontSize: '13px', color: 'black', textDecoration: 'none' }} to="#">Change your password</NavLink>
                                <i className="fa fa-key" aria-hidden="true"></i>
                            </div>
                            <div className="dropdown-item" style={{ marginTop: '10px', padding: '10px 15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <NavLink onClick={() => {
                                    dispatch(userLoggedoutAction(navigate))
                                }} style={{ cursor: "pointer", fontSize: '13px', color: 'black', textDecoration: 'none' }}>Logout</NavLink>
                                <i className="fa fa-info-circle" aria-hidden="true"></i>
                            </div>
                        </div>
                    </div>
                </li>
            </div>
            <Modal title="Change your password"
                open={showModalInputToken}
                onOk={() => {
                }} onCancel={() => {
                    dispatch({
                        type: SHOW_MODAL_INPUT_TOKEN,
                        status: false
                    })
                }}>
                <div className="form-group mt-4">
                    <label htmlFor="currentPassowrd">Current password <span className='text-danger'>*</span></label>
                    <Input.Password value={currentPassowrd} onChange={(e) => {
                        setCurrentPassowrd(e.target.value)
                    }} id="currentPassowrd" placeholder="Enter current password" />
                    <label htmlFor="newPassowrd" className='mt-2'>New password <span className='text-danger'>*</span></label>
                    <Input.Password value={newPassword} onChange={(e) => {
                        setNewPassword(e.target.value)
                    }} id="newPassowrd" placeholder="Enter new password" />
                    {
                        currentPassowrd.trim() === '' && newPassword.trim() === '' ?
                            <button className="btn btn-dark mt-3" disabled>Save changes</button> :
                            <button className='btn btn-primary mt-3' onClick={() => {
                                dispatch({
                                    type: SHOW_MODAL_INPUT_TOKEN,
                                    status: false
                                })
                            }}>Save changes</button>
                    }
                </div>
            </Modal>
        </nav>

    )
}
