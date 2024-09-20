import React, { useEffect, useRef, useState } from 'react'
import { NavLink, useParams } from 'react-router-dom';
import './Calendar.css'
import { Inject, ScheduleComponent, Month, ViewsDirective, ViewDirective, Day, DragAndDrop, Resize} from '@syncfusion/ej2-react-schedule'
import { TreeViewComponent } from '@syncfusion/ej2-react-navigations'
import { useDispatch, useSelector } from 'react-redux';
import { getIssuesBacklog, getIssuesInProject, updateInfoIssue } from '../../../redux/actions/IssueAction';
import { iTagForIssueTypes, iTagForPriorities, priorityTypeWithouOptions } from '../../../util/CommonFeatures';
import { Avatar, Breadcrumb, Button, Input, Select, Switch, Tag } from 'antd';
import { registerLicense } from '@syncfusion/ej2-base';
import { displayComponentInModal, displayComponentInModalInfo } from '../../../redux/actions/ModalAction';
import InfoModal from '../../Modal/InfoModal/InfoModal'
import { GetProcessListAction, GetProjectAction, GetSprintListAction, GetWorkflowListAction } from '../../../redux/actions/ListProjectAction';
import dayjs from 'dayjs';
import IssueCreatingModal from '../../Modal/IssueCreatingModal/IssueCreatingModal';
import Search from 'antd/es/input/Search';
import SprintModalInfo from '../../Modal/SprintInfoModal/SprintInfoModal';
export default function Calendar() {
    const issuesInProject = useSelector(state => state.issue.issuesInProject)
    const projectInfo = useSelector(state => state.listProject.projectInfo)
    const processList = useSelector(state => state.listProject.processList)
    const userInfo = useSelector(state => state.user.userInfo)
    const workflowList = useSelector(state => state.listProject.workflowList)
    const sprintList = useSelector(state => state.listProject.sprintList)
    const [selectOptions, setSelectOptions] = useState({
        assignees: [],
        priorities: [],
        types: []
    })
    registerLicense('Ngo9BigBOggjHTQxAR8/V1NCaF1cWWhIfkx3R3xbf1x0ZFBMY15bRH9PMyBoS35RckVqWH1edXdXR2BUWE11');

    //SWITCH VALUE
    const [keySwitch, setKeySwitch] = useState(true)
    const [sprintSwitch, setSprintSwitch] = useState(true)
    const [showWeekendSwitch, setShowWeekendSwitch] = useState(true)
    const [showStartDateCalendar, setShowStartDateCalendar] = useState(1)

    const [openScheduler, setOpenScheduler] = useState(false)
    const { id } = useParams()
    const dispatch = useDispatch()
    const scheduleObj = useRef(null)
    const currentDate = useRef(null)
    useEffect(() => {
        if (id) {
            dispatch(getIssuesInProject(id))
            dispatch(GetProjectAction(id, null, null))
            dispatch(GetProcessListAction(id))
            dispatch(GetWorkflowListAction(id))
            dispatch(GetSprintListAction(id))
        }
    }, [])


    const fieldsData = {
        id: 'Id',
        subject: { name: 'Subject' },
        isAllDay: { name: 'IsAllDay' },
        startTime: { name: 'StartTime' },
        endTime: { name: 'EndTime' }
    }
    const getIssueByIndex = (issue_id) => {
        const index = issuesInProject?.findIndex(issue => issue._id === issue_id)
        if (index !== -1) {
            return issuesInProject[index]
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
                <div className={`template-wrap d-flex align-items-center ${checkExpired ? "expired" : "not-expired"}`} style={{ width: '100%' }}>
                    <NavLink
                        onClick={(e) => {
                            e.stopPropagation()
                            const oldValue = (issue.start_date ? dayjs(issue.start_date).format("DD/MM/YYYY hh:mm") : "None") + " - " + (issue.end_date ? dayjs(issue.end_date).format("DD/MM/YYYY hh:mm") : "None")
                            dispatch(updateInfoIssue(issue._id, issue.project_id._id, { start_date: null, end_date: null }, oldValue, "None - None", userInfo.id, "updated", "Start Date - End Date"))
                        }}
                        className="text-light mr-2 d-none remove-items-calendar">
                        <i className="fa fa-times-circle"></i>
                    </NavLink>
                    <span className='mr-1 ml-1'>{iTagForIssueTypes(issue.issue_status)}</span>
                    {keySwitch ? <span className='mr-2' style={{ color: '#333' }}>WD-{issue.ordinal_number}</span> : <></>}
                    <span className='mr-2' style={{ color: '#333', fontWeight: 'bold' }}>{summary}</span>
                    {checkExpired ? <i style={{ color: '#C9372C' }} className="fa fa-clock mr-2"></i> : <></>}
                </div>
            )
        } else {
            const sprintInfoIndex = sprintList?.findIndex(sprint => sprint._id === props.Id)
            if (sprintInfoIndex !== -1) {
                const sprintInfo = sprintList[sprintInfoIndex]
                const checkExpired = dayjs(sprintInfo?.end_date).isBefore(dayjs(new Date()))
                return (
                    <div className={`template-wrap d-flex align-items-center custom-sprint ${checkExpired ? "expired" : "not-expired"}`} style={{ width: '100%' }}>
                        <span className='mr-1 ml-1'><i style={{ color: '#333' }} className="fab fa-viadeo"></i></span>
                        <span className='mr-2' style={{ color: '#333', fontWeight: 'bold', fontSize: 14, textDecoration: 'none' }}>{sprintInfo.sprint_name}</span>
                        {checkExpired ? <i style={{ color: '#C9372C' }} className="fa fa-clock mr-2"></i> : <></>}
                    </div>
                )
            }
        }
    }



    const renderData = () => {
        const issuesData = issuesInProject?.filter(issue => issue?.start_date && issue?.end_date).map(issue => {
            console.log({
                Id: issue._id,
                Subject: issue.summary,
                StartTime: (new Date(issue?.start_date)).toISOString(),
                EndTime: (new Date(issue?.end_date)).toISOString(),
            });

            return {
                Id: issue._id,
                Subject: issue.summary,
                StartTime: (new Date(issue?.start_date)).toISOString(),
                EndTime: (new Date(issue?.end_date)).toISOString(),
            }
        })
        const sprintDataIndex = sprintList?.findIndex(sprint => sprint.sprint_status === "processing")
        var sprintData = []
        if (sprintDataIndex !== -1 && sprintSwitch) {
            sprintData = [{
                Id: sprintList[sprintDataIndex]._id,
                Subject: sprintList[sprintDataIndex].sprint_goal,
                StartTime: new Date(sprintList[sprintDataIndex].start_date),
                EndTime: new Date(sprintList[sprintDataIndex].end_date),
            }]
        }
        return issuesData?.length > 0 ? issuesData?.concat(sprintData) : []
    }

    const renderDataSourceForTreeView = () => {
        return issuesInProject?.filter(issue => issue?.start_date === null && issue?.end_date === null)?.filter(issue => {
            if (selectOptions.assignees.length === 0 && selectOptions.priorities.length === 0 && selectOptions.types.length === 0) return true
            var isSearch = false
            if (selectOptions.assignees.length > 0) {
                if (issue.assignees?.length === 0) {
                    isSearch = false
                } else {
                    selectOptions.assignees.filter(user_id => {
                        if (issue.assignees?.map(user => user._id)?.includes(user_id)) {
                            isSearch = true
                        }
                    })
                }
            }

            if (selectOptions.priorities.length > 0) {
                if (selectOptions.priorities.includes(issue.issue_status)) {
                    isSearch = true
                }
            }

            if (selectOptions.types.length > 0) {
                if (selectOptions.types.includes(issue.issue_type._id)) {
                    isSearch = true
                }
            }
            return isSearch
        }).map(issue => {
            return {
                Id: issue._id,
                Summary: issue.summary
            }
        })
    }

    const eventSettings = { dataSource: renderData(), fields: fieldsData, template: eventTemplate }

    const treeViewFields = {
        dataSource: renderDataSourceForTreeView(),
        id: 'Id',
        text: "Summary"
    }

    const nodeTreeViewDrop = (args) => {
        const targetClassEle = args.target?.className
        if (!targetClassEle?.includes("e-work-cells")) return
        if (scheduleObj.current === null) return
        const cellDate = scheduleObj.current.getCellDetails(args.target)
        const issueIndex = issuesInProject?.findIndex(issue => issue._id === args.draggedNodeData.id)
        if (issueIndex !== -1) {
            const issue = issuesInProject[issueIndex]
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
        const issueIndex = issuesInProject?.findIndex(issue => issue._id.toString() === args.Id)
        if (issueIndex !== -1) {
            return (
                <div id={issuesInProject[issueIndex]._id} key={issuesInProject[issueIndex]._id} className='template-wrap' style={{ boxShadow: '0px 1px 1px #091e423f, 0px 0px 1px #091e4221', backgroundColor: '#fff', borderRadius: 2, padding: '5px 10px' }}>
                    <span className='mb-1'>{issuesInProject[issueIndex].summary}</span>
                    <div className='d-flex justify-content-between'>
                        <div className='d-flex align-items-center'>
                            <span className='mr-2'>{iTagForIssueTypes(issuesInProject[issueIndex].issue_status)}</span>
                            {keySwitch ? <span>WD-{issuesInProject[issueIndex].ordinal_number}</span> : <></>}
                        </div>
                        <div className='d-flex align-items-center'>
                            <Tag className='mr-2' color={issuesInProject[issueIndex].issue_type.tag_color}>{issuesInProject[issueIndex].issue_type.name_process}</Tag>
                            <span>{iTagForPriorities(issuesInProject[issueIndex].issue_priority)}</span>
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
            <div className="header mb-3">
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
                <div className='d-flex align-items-center justify-content-between'>
                    <div>
                        <Search placeholder='Search Issues' width="200px" />
                    </div>
                    <div className='d-flex'>
                        <Button onClick={(e) => {
                            setOpenScheduler(!openScheduler)
                        }} style={{ borderRadius: 5 }}><i className="fa fa-calendar-alt mr-2"></i>Unscheduled (<span>{issuesInProject?.filter(issue => issue.start_date === null && issue.end_date === null)?.length}</span>)</Button>
                        <div className="dropdown">
                            <Button className="ml-2" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style={{ borderRadius: 5 }}><i className="fa fa-sliders-h"></i></Button>
                            <div style={{ width: 'max-content', padding: '10px 15px' }} className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                <div className='d-flex flex-column mt-3'>
                                    <label style={{ fontSize: 12, color: "#44546F" }} htmlFor='key' className='font-weight-bold mb-1'>VIEW OPTIONS</label>
                                    <div className='d-flex align-items-center justify-content-between'>
                                        <span style={{ color: '#172B4D', fontSize: 14 }}>Issue key</span>
                                        <NavLink onClick={(e) => {
                                            e.stopPropagation()
                                        }}>
                                            <Switch value={keySwitch} onChange={(value) => {
                                                setKeySwitch(value)
                                            }}
                                                className='ml-3' />
                                        </NavLink>
                                    </div>
                                </div>
                                <div className='d-flex flex-column mt-3'>
                                    <label style={{ fontSize: 12, color: "#44546F" }} htmlFor='items-calendar' className='font-weight-bold mb-1'>SHOW CALENDAR ITEMS</label>
                                    <div className='d-flex align-items-center justify-content-between'>
                                        <span style={{ color: '#172B4D', fontSize: 14 }}>Sprints</span>
                                        <NavLink onClick={(e) => {
                                            e.stopPropagation()
                                        }}>
                                            <Switch value={sprintSwitch} onChange={(value) => {
                                                setSprintSwitch(value)
                                            }}
                                                className='ml-3' />
                                        </NavLink>
                                    </div>
                                </div>
                                <div className='d-flex flex-column mt-3'>
                                    <label style={{ fontSize: 12, color: "#44546F" }} htmlFor='week-setting' className='font-weight-bold mb-1'>WEEK SETTINGS</label>
                                    <div className='d-flex align-items-center justify-content-between'>
                                        <span style={{ color: '#172B4D', fontSize: 14 }}>Show weekends</span>
                                        <NavLink onClick={(e) => {
                                            e.stopPropagation()
                                        }}>
                                            <Switch value={showWeekendSwitch} onChange={(value) => {
                                                setShowWeekendSwitch(value)
                                            }}
                                                className='ml-3' />
                                        </NavLink>
                                    </div>
                                </div>
                                <div className='d-flex align-items-center justify-content-between mt-3'>
                                    <span style={{ color: '#172B4D', fontSize: 14 }}>Week starts on</span>
                                    <Select
                                        className='ml-3'
                                        defaultValue="MONDAY"
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={(value => {
                                            setShowStartDateCalendar(value)
                                        })}
                                        options={[
                                            {
                                                label: "MONDAY",
                                                value: 1
                                            },
                                            {
                                                label: "SUNDAY",
                                                value: 0
                                            },
                                            {
                                                label: "SATURDAY",
                                                value: 6
                                            }
                                        ]} />
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
            <div className="d-flex">
                <ScheduleComponent
                    firstDayOfWeek={showStartDateCalendar}
                    showWeekend={showWeekendSwitch}
                    popupOpen={(e) => {
                        if ((e.type === "QuickInfo") || e.type === "Editor") {
                            e.cancel = true
                        }
                        const getIssueIndex = issuesInProject?.findIndex(issue => issue?._id === e.data.Id)
                        if (getIssueIndex !== -1) {
                            dispatch(displayComponentInModalInfo(<InfoModal issueIdForIssueDetail={null} issueInfo={issuesInProject[getIssueIndex]} displayNumberCharacterInSummarySubIssue={10} />, 1024))
                        }

                        const getSprintIndex = sprintList?.findIndex(sprint => sprint?._id === e.data.Id)
                        if (getSprintIndex !== -1) {
                            dispatch(displayComponentInModalInfo(<SprintModalInfo sprintInfo={sprintList[getSprintIndex]} />, 400))
                        }
                    }}
                    ref={schedule => scheduleObj.current = schedule}
                    height='75vh'
                    style={{ overflow: 'auto', scrollbarWidth: 'none' }}
                    selectedDate={currentDate.current ? currentDate.current : new Date()}
                    navigating={(e) => {
                        currentDate.current = e.currentDate
                    }}
                    cellClick={(e) => {
                        const preventClickedToMoreOrItems = e.event.target
                        if (preventClickedToMoreOrItems?.className?.includes("e-work-cells")) {
                            dispatch(displayComponentInModal(<IssueCreatingModal userInfo={userInfo} startDate={e.startTime} endDate={e.endTime} workflowList={workflowList} processList={processList} projectId={id} />))
                        }
                    }}
                    dragStop={(e) => {
                        updateDataAfterDragOrResize(e)
                    }}
                    resizeStop={(e) => {
                        updateDataAfterDragOrResize(e)
                    }}
                    eventSettings={eventSettings}
                    currentView='Month'>
                    <ViewsDirective>
                        <ViewDirective option="Month" />
                        <ViewDirective option="Day" />
                    </ViewsDirective>
                    <Inject services={[Month, Day, DragAndDrop, Resize]} />
                </ScheduleComponent>
                <div className='card-calendar ml-2' style={{ padding: '10px 10px', display: openScheduler ? "block" : "none" }}>
                    <div className='mb-2'>
                        <div className='d-flex align-items-center justify-content-between'>
                            <h5 className='treeview-title-component'>Schedule your work</h5>
                            <Button onClick={() => {
                                setOpenScheduler(false)
                            }} className='border-0 edit-btn-close-calendar'><i className="fa fa-times"></i></Button>
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
                                        <label style={{ fontSize: 14 }} className='font-weight-bold d-flex' htmlFor='assignees'>Assignees
                                            {selectOptions.assignees.length > 0 ? <div style={{ width: '100%' }} className='d-flex align-items-center'>
                                                <span className='ml-1'>{`(${selectOptions.assignees.length})`}</span>
                                                <NavLink onClick={(e) => {
                                                    e.stopPropagation()
                                                    setSelectOptions({
                                                        ...selectOptions,
                                                        assignees: []
                                                    })
                                                }}><i className="fa fa-times ml-1"></i></NavLink>
                                            </div> : <></>}
                                        </label>
                                        <div className='d-flex'>
                                            {projectInfo?.members?.map(user => {
                                                return <NavLink onClick={(e) => {
                                                    e.stopPropagation()
                                                    const index = selectOptions.assignees.findIndex(id => id === user.user_info._id)
                                                    if (index !== -1) {
                                                        selectOptions.assignees.splice(index, 1)
                                                    } else {
                                                        selectOptions.assignees.push(user.user_info._id)
                                                    }
                                                    setSelectOptions({
                                                        ...selectOptions,
                                                        assignees: [...selectOptions.assignees]
                                                    })
                                                }} style={{ textDecoration: 'none' }}><Avatar key={user._id} className={`mr-1 ${selectOptions.assignees.includes(user._id) ? "selected" : "unselected"}`} src={user.user_info.avatar} /></NavLink>
                                            })}
                                        </div>
                                    </div>
                                    <div className='filter-issue-priority d-flex flex-column mt-2'>
                                        <label style={{ fontSize: 14 }} className='font-weight-bold d-flex' htmlFor='issue-priority'>Priority
                                            {selectOptions.priorities.length > 0 ? <div style={{ width: '100%' }} className='d-flex align-items-center'>
                                                <span className='ml-1'>{`(${selectOptions.priorities.length})`}</span>
                                                <NavLink onClick={(e) => {
                                                    e.stopPropagation()
                                                    setSelectOptions({
                                                        ...selectOptions,
                                                        priorities: []
                                                    })
                                                }}><i className="fa fa-times ml-1"></i></NavLink>
                                            </div> : <></>}
                                        </label>
                                        <div className='d-flex'>
                                            {priorityTypeWithouOptions.map(priority => {
                                                return <NavLink onClick={(e) => {
                                                    e.stopPropagation()
                                                    const index = selectOptions.priorities.findIndex(id => id === priority.value)
                                                    if (index !== -1) {
                                                        selectOptions.priorities.splice(index, 1)
                                                    } else {
                                                        selectOptions.priorities.push(priority.value)
                                                    }
                                                    setSelectOptions({
                                                        ...selectOptions,
                                                        priorities: [...selectOptions.priorities]
                                                    })
                                                }} style={{ textDecoration: 'none', color: '#000' }}>
                                                    <span style={{ padding: 5, display: 'block' }} key={priority.value} className={`mr-1 ${selectOptions.priorities.includes(priority.value) ? "selected" : "unselected"}`}>{priority.label}</span>
                                                </NavLink>
                                            })}
                                        </div>
                                    </div>
                                    <div className='filter-issue-type d-flex flex-column mt-2'>
                                        <label style={{ fontSize: 14 }} className='font-weight-bold d-flex' htmlFor='issue-type'>Type
                                            {selectOptions.types.length > 0 ? <div style={{ width: '100%' }} className='d-flex align-items-center'>
                                                <span className='ml-1'>{`(${selectOptions.types.length})`}</span>
                                                <NavLink onClick={(e) => {
                                                    e.stopPropagation()
                                                    setSelectOptions({
                                                        ...selectOptions,
                                                        types: []
                                                    })
                                                }}><i className="fa fa-times ml-1"></i></NavLink>
                                            </div> : <></>}

                                        </label>
                                        <div>
                                            {processList?.map(process => {
                                                return <NavLink onClick={(e) => {
                                                    e.stopPropagation()
                                                    const index = selectOptions.types.findIndex(id => id === process._id)
                                                    if (index !== -1) {
                                                        selectOptions.types.splice(index, 1)
                                                    } else {
                                                        selectOptions.types.push(process._id)
                                                    }
                                                    setSelectOptions({
                                                        ...selectOptions,
                                                        types: [...selectOptions.types]
                                                    })
                                                }}>
                                                    <Tag key={process._id} className={`mr-1 ${selectOptions.types.includes(process._id) ? "selected" : "unselected"}`} color={process.tag_color}>{process.name_process}</Tag>
                                                </NavLink>
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
                                nodeClicked={(e) => {
                                    const getIdElement = e.node.querySelector(".template-wrap").getAttribute('id')
                                    if (getIdElement) {
                                        const issueIndex = getIssueByIndex(getIdElement)
                                        if (issueIndex) {
                                            dispatch(displayComponentInModalInfo(<InfoModal issueIdForIssueDetail={null} issueInfo={issueIndex} displayNumberCharacterInSummarySubIssue={10} />, 1024))
                                        }
                                    }
                                }}
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
                                <p>Remove an issue from the calendar by clicking remove button to back into the unscheduled work panel</p>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </div>

    )
}
