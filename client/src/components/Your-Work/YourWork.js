import { Avatar, Button, Card } from 'antd'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { NavLink, useNavigate } from 'react-router-dom'
import { GetProcessListAction, ListProjectAction } from '../../redux/actions/ListProjectAction'
import './YourWork.css'
import dayjs from 'dayjs'
import { iTagForIssueTypes } from '../../util/CommonFeatures'
import { getAllIssue } from '../../redux/actions/IssueAction'
import { updateUserInfo } from '../../redux/actions/UserAction'

export default function YourWork() {
    const listProject = useSelector(state => state.listProject.listProject)
    const userInfo = useSelector(state => state.user.userInfo)
    const issueList = useSelector(state => state.issue.issueList)
    const processList = useSelector(state => state.listProject.processList)
    const dispatch = useDispatch()
    useEffect(() => {
        dispatch(ListProjectAction())
        dispatch(getAllIssue())
        dispatch(GetProcessListAction())
    }, [])
    const navigate = useNavigate()
    const renderIssueItemForWorkedOn = (issues) => {
        return issues.map((issue, index) => {
            return <a key={index} href={`/projectDetail/${issue?.project_id}/issues/issue-detail/${issue?.issue_id}`} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center" style={{ padding: '5px 20px' }}>
                <div className='d-flex align-items-center'>
                    <span>{iTagForIssueTypes(issue?.issue_status, null, null)}</span>
                    <div className='d-flex flex-column' style={{ width: '100%' }}>
                        <span>{issue?.summary}</span>
                        <div className='d-flex align-items-center'>
                            <span className='mr-2'>WD-{issue?.ordinal_number}</span>
                            <i className="fa-solid fa-circle mr-2" style={{ fontSize: 5 }} />
                            <span>{issue?.name_project}</span>
                        </div>
                    </div>
                </div>
                <div>
                    <span className='mr-3'>Last visited: <span style={{ fontWeight: 'bold' }}>{dayjs(issue?.time).format('DD/MM/YYYY - hh:mm')}</span></span>
                    <span className='mr-2 ml-2' style={{ fontSize: 15 }}>{issue?.action}</span>
                    <span style={{ fontWeight: 'bold', fontSize: 15 }}><Avatar src={issue?.avatar} /> {issue?.username}</span>
                </div>
            </a>
        })
    }

    const renderIssueItemForViewed = (issues) => {
        return issues.map((issue, index) => {
            return <a key={index} href={`/projectDetail/${issue?.project_id}/issues/issue-detail/${issue?.issue_id}`} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center" style={{ padding: '5px 20px' }}>
                <div className='d-flex align-items-center'>
                    <span>{iTagForIssueTypes(issue?.issue_status, null, null)}</span>
                    <div className='d-flex flex-column' style={{ width: '100%' }}>
                        <span>{issue?.summary}</span>
                        <div className='d-flex align-items-center'>
                            <span className='mr-2'>WD-{issue?.ordinal_number}</span>
                            <i className="fa-solid fa-circle mr-2" style={{ fontSize: 5 }} />
                            <span>{issue?.name_project}</span>
                        </div>
                    </div>
                </div>
                <div>
                    <span className='mr-3'>Last visited: <span style={{ fontWeight: 'bold' }}>{dayjs(issue?.time).format('DD/MM/YYYY - hh:mm')}</span></span>
                </div>
            </a>
        })
    }
    const renderIssuesWorkedOn = () => {
        const working_issues = userInfo.working_issues
        if (working_issues !== null && working_issues?.length > 0) {
            const getAllIssuesInThisDay = []
            const getAllIssuesInYesterday = []
            const getAllIssuesInTheLastWeek = []
            const getAllIssuesInTheLastMonth = []

            working_issues.forEach(issue => {
                if (dayjs(issue?.time).isSame(dayjs(), 'day')) {
                    getAllIssuesInThisDay.push(issue)
                }
                else if (dayjs(issue?.time).isSame(dayjs(new Date()).subtract(1, 'day'), 'day')) {
                    getAllIssuesInYesterday.push(issue)
                }
                else if (dayjs(issue?.time).isSame(dayjs(), 'week')) {
                    getAllIssuesInTheLastWeek.push(issue)
                }
                else if (dayjs(issue?.time).isSame(dayjs(), 'month')) {
                    getAllIssuesInTheLastMonth.push(issue)
                }
            })

            return <div className='mt-3'>
                {
                    getAllIssuesInThisDay.length !== 0 ? <div className='mt-2'>
                        <span style={{ fontWeight: 'bold' }}>TODAY</span>
                        <div className="list-group" style={{ borderRadius: 0 }}>
                            {renderIssueItemForWorkedOn(getAllIssuesInThisDay)}
                        </div>
                    </div> : <></>
                }
                {
                    getAllIssuesInYesterday.length !== 0 ? <div className='mt-2'>
                        <span style={{ fontWeight: 'bold' }}>YESTERDAY</span>
                        <div className="list-group" style={{ borderRadius: 0 }}>
                            {renderIssueItemForWorkedOn(getAllIssuesInYesterday)}
                        </div>
                    </div> : <></>
                }
                {
                    getAllIssuesInTheLastWeek.length !== 0 ? <div className='mt-2'>
                        <span style={{ fontWeight: 'bold', marginTop: 10 }}>IN THE LAST WEEK</span>
                        <div className="list-group" style={{ borderRadius: 0 }}>
                            {renderIssueItemForWorkedOn(getAllIssuesInTheLastWeek)}
                        </div>
                    </div> : <></>
                }
                {
                    getAllIssuesInTheLastMonth.length !== 0 ? <div className='mt-2'>
                        <span style={{ fontWeight: 'bold', marginTop: 10 }}>IN THE LAST MONTH</span>
                        <div className="list-group" style={{ borderRadius: 0 }}>
                            {renderIssueItemForWorkedOn(getAllIssuesInTheLastMonth)}
                        </div>
                    </div> : <></>
                }
            </div>
        } else {
            return null
        }
    }
    const renderIssuesViewed = () => {
        const viewed_issues = userInfo.viewed_issues
        if (viewed_issues !== null && viewed_issues?.length > 0) {
            const getAllIssuesInThisDay = []
            const getAllIssuesInYesterday = []
            const getAllIssuesInTheLastWeek = []
            const getAllIssuesInTheLastMonth = []

            viewed_issues.forEach(issue => {
                if (dayjs(issue?.time).isSame(dayjs(), 'day')) {
                    getAllIssuesInThisDay.push(issue)
                }
                else if (dayjs(issue?.time).isSame(dayjs(new Date()).subtract(1, 'day'), 'day')) {
                    getAllIssuesInYesterday.push(issue)
                }
                else if (dayjs(issue?.time).isSame(dayjs(), 'week')) {
                    getAllIssuesInTheLastWeek.push(issue)
                }
                else if (dayjs(issue?.time).isSame(dayjs(), 'month')) {
                    getAllIssuesInTheLastMonth.push(issue)
                }
            })

            return <div className='mt-3'>
                {
                    getAllIssuesInThisDay.length !== 0 ? <div className='mt-2'>
                        <span style={{ fontWeight: 'bold' }}>TODAY</span>
                        <div className="list-group mt-2" style={{ borderRadius: 0 }}>
                            {renderIssueItemForViewed(getAllIssuesInThisDay)}
                        </div>
                    </div> : <></>
                }
                {
                    getAllIssuesInYesterday.length !== 0 ? <div className='mt-2'>
                        <span style={{ fontWeight: 'bold', marginTop: 10 }}>YESTERDAY</span>
                        <div className="list-group mt-2" style={{ borderRadius: 0 }}>
                            {renderIssueItemForViewed(getAllIssuesInYesterday)}
                        </div>
                    </div> : <></>
                }
                {
                    getAllIssuesInTheLastWeek.length !== 0 ? <div className='mt-2'>
                        <span style={{ fontWeight: 'bold', marginTop: 10 }}>IN THE LAST WEEK</span>
                        <div className="list-group" style={{ borderRadius: 0 }}>
                            {renderIssueItemForViewed(getAllIssuesInTheLastWeek)}
                        </div>
                    </div> : <></>
                }
                {
                    getAllIssuesInTheLastMonth.length !== 0 ? <div className='mt-2'>
                        <span style={{ fontWeight: 'bold', marginTop: 10 }}>IN THE LAST MONTH</span>
                        <div className="list-group" style={{ borderRadius: 0 }}>
                            {renderIssueItemForViewed(getAllIssuesInTheLastMonth)}
                        </div>
                    </div> : <></>
                }
            </div>
        } else {
            return null
        }
    }
    const renderIssuesAssigned = () => {
        const assigned_issues = userInfo.assigned_issues
        return assigned_issues.map((issue, index) => {
            return <a key={index} href={`/projectDetail/${issue?.project_id}/issues/issue-detail/${issue?.issue_id}`} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center" style={{ padding: '5px 20px' }}>
                <div className='d-flex justify-content-between align-items-center'>
                    <span>{iTagForIssueTypes(issue?.issue_status, null, null)}</span>
                    <div className='d-flex flex-column' style={{ width: '100%' }}>
                        <span>{issue?.summary}</span>
                        <div className='d-flex align-items-center'>
                            <span className='mr-2'>WD-{issue?.ordinal_number}</span>
                            <i className="fa-solid fa-circle mr-2" style={{ fontSize: 5 }} />
                            <span>{issue?.name_project}</span>
                        </div>
                    </div>
                </div>
                <div>
                    <span>{issue?.issue_type?.name_process}</span>
                </div>
            </a>
        })
    }
    return (
        <div style={{ overflowY: 'auto', height: '90vh', overflowX: 'visible', width: '100%' }}>
            <h4>Your Work</h4>
            <hr />
            <div>
                <div className='d-flex justify-content-between'>
                    <h5>Recent projects</h5>
                    <NavLink className="mr-2" to={"/manager"}>View all projects</NavLink>
                </div>
                <div className='d-flex mb-3' style={{ overflowX: 'auto', scrollbarWidth: 'thin' }}>
                    {listProject?.filter(project => project.creator._id === userInfo.id || project.members.map(user => user.user_info._id).includes(userInfo.id)).map(project => {
                        return <Card
                            key={project?._id}
                            hoverable
                            style={{
                                minWidth: '250px',
                                width: '250px',
                                padding: 0,
                                margin: '20px 10px 20px 0'
                            }}
                        >
                            <div className='d-flex'>
                                <div style={{ backgroundColor: '#90EE90', width: '10%', borderRadius: '7px 0 0 7px' }}>&nbsp;&nbsp;</div>
                                <div style={{ width: '90%', padding: '10px 0 10px 0' }}>
                                    <div className='d-flex align-items-center'>
                                        <Avatar shape='square' style={{ transform: 'translateX(-50%)' }} src="https://z45letranphilong.atlassian.net/rest/api/2/universal_avatar/view/type/project/avatar/10406?size=medium" />
                                        <div className='d-flex flex-column' style={{ width: 'max-content', marginLeft: '-10px' }}>
                                            <span style={{ fontWeight: 'bold', width: 'max-content' }}>{project.name_project}</span>
                                            <span style={{ fontSize: 13 }}>Software project</span>
                                        </div>
                                    </div>
                                    <div style={{ padding: '0 10px' }}>
                                        <p style={{ marginTop: 5, fontSize: 13, fontWeight: '600', color: '#6B778C', marginBottom: 10 }}>More Information</p>
                                        <div>
                                            <div className='d-flex justify-content-between mb-2'>
                                                <span style={{ fontSize: 11 }}>My Issues</span>
                                                <Avatar size={20}><span style={{ fontSize: 13, display: 'flex' }}>{issueList?.filter(issue => issue.project_id._id === project._id).length}</span></Avatar>
                                            </div>
                                            <div className='d-flex justify-content-between'>
                                                <span style={{ fontSize: 11 }}>Done Issues</span>
                                                <Avatar size={20}><span style={{ fontSize: 13, display: 'flex' }}>{issueList?.filter(issue => {
                                                    const lastProcess = processList.filter(process => process.project_id === project._id)
                                                    return issue.project_id?._id === project?._id && issue.issue_type?._id === lastProcess[lastProcess.length - 1]
                                                }).length}</span></Avatar>
                                            </div>
                                        </div>

                                        <hr className='mb-2 mt-2' />

                                        <Button onClick={() => {
                                            //update userInfo
                                            dispatch(updateUserInfo(userInfo.id, { project_working: project._id }))
                                            navigate(`/projectDetail/${project._id}/board`)
                                        }}>Go to Main Page</Button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    })}
                </div>
                <div>
                    <div>
                        <nav>
                            <div className="nav nav-tabs" id="nav-tab" role="tablist">
                                <a style={{ fontWeight: 'bold' }}
                                    className="nav-item nav-link active"
                                    id="nav-workedon-tab"
                                    data-toggle="tab"
                                    href="#nav-workedon"
                                    role="tab"
                                    aria-controls="nav-workedon"
                                    aria-selected="true">
                                    Worked on
                                </a>
                                <a
                                    style={{ fontWeight: 'bold' }}
                                    className="nav-item nav-link"
                                    d="nav-viewed-tab"
                                    data-toggle="tab"
                                    href="#nav-viewed"
                                    role="tab"
                                    aria-controls="nav-viewed"
                                    aria-selected="false">
                                    Viewed
                                </a>
                                <a
                                    style={{ fontWeight: 'bold' }}
                                    className="nav-item nav-link"
                                    id="nav-assigned-tab"
                                    data-toggle="tab"
                                    href="#nav-assigned"
                                    role="tab"
                                    aria-controls="nav-assigned"
                                    aria-selected="false">
                                    Assigned to me
                                    <Avatar size="small" className='ml-2'><span className='d-flex'>{renderIssuesAssigned()?.length}</span></Avatar>
                                </a>
                            </div>
                        </nav>
                        <div className="tab-content" id="nav-tabContent">
                            <div className="tab-pane fade show active" id="nav-workedon" role="tabpanel" aria-labelledby="nav-workedon-tab">
                                {renderIssuesWorkedOn()}
                            </div>
                            <div className="tab-pane fade" id="nav-viewed" role="tabpanel" aria-labelledby="nav-viewed-tab">
                                {renderIssuesViewed()}
                            </div>
                            <div className="tab-pane fade" id="nav-assigned" role="tabpanel" aria-labelledby="nav-assigned-tab">
                                {renderIssuesAssigned()}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
