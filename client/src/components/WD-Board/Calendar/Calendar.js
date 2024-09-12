import React, { useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom';
import './Calendar.css'
import { Inject, ScheduleComponent, Month, ViewsDirective, ViewDirective, Day, DragAndDrop, Resize } from '@syncfusion/ej2-react-schedule'
import { TreeViewComponent } from '@syncfusion/ej2-react-navigations'
import { useDispatch, useSelector } from 'react-redux';
import { getIssuesBacklog, updateInfoIssue } from '../../../redux/actions/IssueAction';
import { iTagForIssueTypes, iTagForPriorities, priorityTypeWithouOptions } from '../../../util/CommonFeatures';
import { Avatar, Breadcrumb, Button, Input, Tag } from 'antd';
import { registerLicense } from '@syncfusion/ej2-base';
import { displayComponentInModal, displayComponentInModalInfo } from '../../../redux/actions/ModalAction';
import InfoModal from '../../Modal/InfoModal/InfoModal'
import { GetProcessListAction, GetProjectAction, GetWorkflowListAction } from '../../../redux/actions/ListProjectAction';
import dayjs from 'dayjs';
import IssueCreatingModal from '../../Modal/IssueCreatingModal/IssueCreatingModal';
export default function Calendar() {
    const issuesBacklog = useSelector(state => state.issue.issuesBacklog)
    const projectInfo = useSelector(state => state.listProject.projectInfo)
    const processList = useSelector(state => state.listProject.processList)
    const userInfo = useSelector(state => state.user.userInfo)
    const workflowList = useSelector(state => state.listProject.workflowList)
    const { id } = useParams()
    const dispatch = useDispatch()
    const scheduleObj = useRef(null)
    useEffect(() => {
        if (id) {
            dispatch(getIssuesBacklog(id))
            dispatch(GetProjectAction(id, null, null))
            dispatch(GetProcessListAction(id))
            dispatch(GetWorkflowListAction(id))
        }
    }, [])
    registerLicense('Ngo9BigBOggjHTQxAR8/V1NCaF1cWWhIfkx3R3xbf1x0ZFBMY15bRH9PMyBoS35RckVqWH1edXdXR2BUWE11');

    const fieldsData = {
        id: 'Id',
        subject: { name: 'Subject' },
        isAllDay: { name: 'IsAllDay' },
        startTime: { name: 'StartTime' },
        endTime: { name: 'EndTime' }
    }
    const getIssueByIndex = (issue_id) => {
        const index = issuesBacklog?.findIndex(issue => issue._id === issue_id)
        if (index !== -1) {
            return issuesBacklog[index]
        }
        return null
    }
    const eventTemplate = (props) => {
        const issue = getIssueByIndex(props.Id)
        if (issue) {
            const checkExpired = dayjs(issue?.end_date).isBefore(dayjs(new Date()))
            const originalSummary = issue.summary
            const summary = originalSummary.length > 10 ? originalSummary.substring(0, 5) + "..." + originalSummary.substring(originalSummary.length - 3) : originalSummary
            return (
                <div className={`template-wrap d-flex ${checkExpired ? "expired" : "not-expried"}`} style={{ width: '100vh' }}>
                    <span className='mr-1'>{iTagForIssueTypes(issue.issue_status)}</span>
                    <span className='mr-2' style={{ color: '#333' }}>WD-{issue.ordinal_number}</span>
                    <span className='mr-2' style={{ color: '#333', fontWeight: 'bold' }}>{summary}</span>
                    {checkExpired ? <i style={{color: '#C9372C'}} className="fa fa-clock mr-2"></i> : <></>}
                </div>
            )
        }
    }

    const renderData = () => {
        const data = issuesBacklog?.filter(issue => issue?.start_date && issue?.end_date).map(issue => {
            return {
                Id: issue._id,
                Subject: issue.summary,
                StartTime: new Date(issue?.start_date),
                EndTime: new Date(issue?.end_date),
            }
        })
        return data?.length > 0 ? data : []
    }

    const eventSettings = { dataSource: renderData(), fields: fieldsData, template: eventTemplate }

    const treeViewFields = {
        dataSource: issuesBacklog?.filter(issue => issue?.start_date === null && issue?.end_date === null)?.map(issue => {
            return {
                Id: issue._id,
                Summary: issue.summary
            }
        }),
        id: 'Id',
        text: "Summary"
    }

    const nodeTreeViewDrop = (args) => {
        const targetClassEle = args.target?.className
        if (!targetClassEle?.includes("e-work-cells")) return
        if (scheduleObj.current === null) return
        const cellDate = scheduleObj.current.getCellDetails(args.target)
        const issueIndex = issuesBacklog?.findIndex(issue => issue._id === args.draggedNodeData.id)
        if (issueIndex !== -1) {
            const issue = issuesBacklog[issueIndex]
            const oldValue = (issue.start_date ? dayjs(issue.start_date).format("DD/MM/YYYY hh:mm") : "None") + " - " + (issue.end_date ? dayjs(issue.end_date).format("DD/MM/YYYY hh:mm") : "None")
            const newValue = dayjs(cellDate.startTime).format("DD/MM/YYYY hh:mm") + " - " + dayjs(cellDate.endTime).format("DD/MM/YYYY hh:mm")

            dispatch(updateInfoIssue(issue._id, issue.project_id._id, { start_date: cellDate.startTime, end_date: cellDate.endTime }, oldValue, newValue, userInfo.id, "updated", "Start Date - End Date"))
            const eventData = {
                Id: args.draggedNodeData.id,
                Subject: args.draggedNodeData.text,
                StartTime: cellDate.startTime,
                EndTime: cellDate.endTime
            }
            scheduleObj.current.addEvent(eventData)
        }
    }

    const nodeTemplate = (args) => {
        const issueIndex = issuesBacklog?.findIndex(issue => issue._id.toString() === args.Id)
        if (issueIndex !== -1) {
            return (
                <div className='template-wrap' style={{ boxShadow: '0px 1px 1px #091e423f, 0px 0px 1px #091e4221', backgroundColor: '#fff', borderRadius: 2, padding: '5px 10px' }}>
                    <span className='mb-1'>{issuesBacklog[issueIndex].summary}</span>
                    <div className='d-flex justify-content-between'>
                        <div className='d-flex align-items-center'>
                            <span className='mr-2'>{iTagForIssueTypes(issuesBacklog[issueIndex].issue_status)}</span>
                            <span>WD-{issuesBacklog[issueIndex].ordinal_number}</span>
                        </div>
                        <div className='d-flex align-items-center'>
                            <Tag className='mr-2' color={issuesBacklog[issueIndex].issue_type.tag_color}>{issuesBacklog[issueIndex].issue_type.name_process}</Tag>
                            <span>{iTagForPriorities(issuesBacklog[issueIndex].issue_priority)}</span>
                        </div>
                    </div>
                </div>
            )
        }
    }

    const updateDataAfterDragOrResize = (e) => {
        const issue = getIssueByIndex(e.data.Id)
        if (issue) {
            const oldValue = (issue.start_date ? dayjs(issue.start_date).format("DD/MM/YYYY hh:mm") : "None") + " - " + (issue.end_date ? dayjs(issue.end_date).format("DD/MM/YYYY hh:mm") : "None")
            const newValue = dayjs(e.data.StartTime).format("DD/MM/YYYY hh:mm") + " - " + dayjs(e.data.EndTime).format("DD/MM/YYYY hh:mm")
            dispatch(updateInfoIssue(issue._id, issue.project_id._id, { start_date: e.data.StartTime, end_date: e.data.EndTime }, oldValue, newValue, userInfo.id, "updated", "Start Date - End Date"))
        }
    }

    return (
        <div>
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
                <h4>Calendar</h4>
            </div>
            <div className="d-flex">
                <ScheduleComponent
                    popupOpen={(e) => {
                        if ((e.type === "QuickInfo") || e.type === "Editor") {
                            e.cancel = true
                        }
                        const getIssueIndex = issuesBacklog?.findIndex(issue => issue._id === e.data.Id)
                        if (getIssueIndex !== -1) {
                            dispatch(displayComponentInModalInfo(<InfoModal issueIdForIssueDetail={null} issueInfo={issuesBacklog[getIssueIndex]} displayNumberCharacterInSummarySubIssue={10} />))
                        }
                    }}
                    ref={schedule => scheduleObj.current = schedule}
                    height='90vh'
                    selectedDate={new Date()}
                    cellClick={(e) => {
                        dispatch(displayComponentInModal(<IssueCreatingModal userInfo={userInfo} startDate={e.startTime} endDate={e.endTime} workflowList={workflowList} processList={processList} projectId={id} />))
                    }}
                    dragStop={(e) => {
                        updateDataAfterDragOrResize(e)
                    }}
                    resizeStop={(e) => {
                        updateDataAfterDragOrResize(e)
                    }}
                    eventSettings={eventSettings}
                    currentView="Month">
                    <ViewsDirective>
                        <ViewDirective option='Month'></ViewDirective>
                        <ViewDirective option='Day'></ViewDirective>
                    </ViewsDirective>
                    <Inject services={[Month, Day, DragAndDrop, Resize]} />
                </ScheduleComponent>
                <div className='card-calendar ml-2' style={{ padding: '10px 10px' }}>
                    <div className='mb-2'>
                        <div className='d-flex align-items-center justify-content-between'>
                            <h5 className='treeview-title-component'>Schedule your work</h5>
                            <Button className='border-0 edit-btn-close-calendar'><i className="fa fa-times"></i></Button>
                        </div>
                        <div className='mt-2'>
                            <p>Drag each item onto the calendar to set a start and a due date for your work.</p>
                            <Input placeholder='Search unscheduled items' />
                        </div>
                    </div>
                    <div className='treeview-component' style={{ backgroundColor: '#ddd' }}>
                        <div style={{ padding: 5 }} className='d-flex align-items-center justify-content-between'>
                            <Button>Most recent <i className="fa fa-angle-down ml-2"></i></Button>
                            <div className="dropdown">
                                <Button id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><i className="fa fa-filter mr-2"></i> Filters</Button>
                                <div style={{ padding: 5, width: '18rem' }} className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                    <div className='filter-assignees d-flex flex-column'>
                                        <label style={{ fontSize: 14 }} className='font-weight-bold' htmlFor='assignees'>Assignees</label>
                                        <div className='d-flex'>
                                            {projectInfo?.members?.map(user => {
                                                return <Avatar className='mr-1' src={user.user_info.avatar} />
                                            })}
                                        </div>
                                    </div>
                                    <div className='filter-issue-priority d-flex flex-column mt-2'>
                                        <label style={{ fontSize: 14 }} className='font-weight-bold' htmlFor='issue-priority'>Priority</label>
                                        <div className='d-flex'>
                                            {priorityTypeWithouOptions.map(priority => {
                                                return <span className='mr-1'>{priority.label}</span>
                                            })}
                                        </div>
                                    </div>
                                    <div className='filter-issue-type d-flex flex-column mt-2'>
                                        <label style={{ fontSize: 14 }} className='font-weight-bold' htmlFor='issue-type'>Type</label>
                                        <div>
                                            {processList?.map(process => {
                                                return <Tag color={process.tag_color} className='mr-1'>{process.name_process}</Tag>
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                        {
                            treeViewFields.dataSource?.length > 0 ? <TreeViewComponent style={{ overflowY: 'auto', height: 450, scrollbarWidth: 'thin' }}
                                fields={treeViewFields}
                                allowDragAndDrop={true}
                                nodeDragStop={nodeTreeViewDrop}
                                nodeTemplate={nodeTemplate} /> : <div style={
                                    {
                                        height: 450,
                                        border: '2px dashed #000',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        flexDirection: 'column',
                                        textAlign: 'center',
                                        margin: 5,
                                        padding: 5
                                    }
                                }>
                                <h6>All work has been scheduled</h6>
                                <p>Remove an issue from the calendar by dragging it back into the unscheduled work panel</p>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </div>

    )
}
