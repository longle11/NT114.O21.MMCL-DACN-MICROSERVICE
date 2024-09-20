import { Avatar, Button, Input, InputNumber, Progress, Select, Tag } from 'antd'
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { NavLink, useNavigate } from 'react-router-dom'
import { createIssue, updateInfoIssue } from '../../redux/actions/IssueAction'
import { issueTypeOptions, iTagForIssueTypes, iTagForPriorities, priorityTypeOptions, renderIssueType, renderSubIssueOptions } from '../../util/CommonFeatures'
import { UserOutlined } from '@ant-design/icons'

export default function SubIssueComponent(props) {
    const issueInfo = props.issueInfo
    const processList = props.processList
    const userInfo = props.userInfo
    const issuesBacklog = props.issuesBacklog
    const projectInfo = props.projectInfo
    const id = props.id
    const showAddSubIssue = props.showAddSubIssue
    const subIssueSummary = props.subIssueSummary
    
    const displayNumberCharacterInSummarySubIssue = props.displayNumberCharacterInSummarySubIssue
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [editSubIssueSummary, setEditSubIssueSummary] = useState('')
    const [openEditSubIssueSummary, setOpenSetEditSubIssueSummary] = useState('')
    const [editSubIssueIssuePriority, setEditSubIssueIssuePriority] = useState(2)
    const [openEditSubIssuePriority, setOpenSetEditSubIssuePriority] = useState('')
    const [editSubIssueIssueStoryPoint, setEditSubIssueIssueStoryPoint] = useState(0)
    const [openEditSubIssueStoryPoint, setOpenSetEditSubIssueStoryPoint] = useState('')
    const [editSubIssueIssueAssignees, setEditSubIssueIssueAssignees] = useState([])
    const [openEditSubIssueAssignees, setOpenSetEditSubIssueAssignees] = useState('')
    const [editSubIssueIssueIssueType, setEditSubIssueIssueIssueType] = useState('')
    const [openEditSubIssueIssueType, setOpenSetEditSubIssueIssueType] = useState('')

    const [chooseExistingSubIssue, setChooseExistingSubIssue] = useState(false)
    return (
        <div>
            {issueInfo?.sub_issue_list?.length !== 0 ? <div>
                <div className='d-flex justify-content-between align-items-center'>
                    <h5 className='p-0 m-0' style={{ color: '#42526e', fontSize: 18 }}>Child issues</h5>
                    <div>
                        <Select
                            className='mr-2'
                            options={[
                                {
                                    label: 'Created',
                                    value: 0
                                },
                                {
                                    label: 'Key',
                                    value: 1
                                },
                                {
                                    label: 'Status',
                                    value: 2
                                },
                                {
                                    label: 'Assignees',
                                    value: 3
                                },
                            ]} defaultValue={"Order by"} />
                        <i className="fa fa-ellipsis-h mr-2"></i>
                        <i onClick={() => {
                            props.hanleClickDisplayAddSubIssue(true)
                            props.hanleClickEditSummaryInSubIssue('')
                        }} className="fa-solid fa-plus"></i>
                    </div>
                </div>
                <div className='d-flex'>
                    <Progress
                        percent={Math.round(((issueInfo?.sub_issue_list?.filter(subIssue => subIssue?.issue_type?._id === processList[processList?.length - 1]?._id)?.length) / (issueInfo?.sub_issue_list?.length)) * 100)}
                        percentPosition={{
                            align: 'center',
                            type: 'inner',
                        }}
                        size={['95%', 5]}
                    />
                </div>
            </div> : <></>}
            <div>
                <div style={{ marginTop: 10, overflowY: 'auto', maxHeight: '13rem', scrollbarWidth: 'none' }}>
                    {issueInfo?.sub_issue_list.map(subIssue => {
                        return <div key={subIssue?._id} className='d-flex justify-content-between align-items-center subIssue' style={{ padding: '5px 3px', border: '1px solid #dddd' }}>
                            <div className='d-flex align-items-center'>
                                <span className='mr-1'>{iTagForIssueTypes(subIssue.issue_status, 'mr-0', 13)}</span>
                                <NavLink onClick={() => {
                                    navigate(`/projectDetail/${id}/issues/issue-detail/${subIssue._id}`)
                                    window.location.reload()
                                }} style={{ fontSize: 12 }} className='mr-1'>WD-{subIssue.ordinal_number}</NavLink>
                                {openEditSubIssueSummary === subIssue._id ? <div style={{ position: 'relative' }}>
                                    <Input style={{ borderRadius: 0 }} defaultValue={subIssue?.summary} onChange={(e) => {
                                        setEditSubIssueSummary(e.target.value)
                                    }} />
                                    <div className='d-flex' style={{ position: 'absolute', right: 0 }}>
                                        <Button onClick={() => {
                                            dispatch(updateInfoIssue(subIssue._id, subIssue?.project_id, { summary: editSubIssueSummary }, null, null, userInfo.id, "updated", "summary", projectInfo, userInfo))
                                            setEditSubIssueSummary('')
                                            setOpenSetEditSubIssueSummary('')
                                        }} className='mr-1 d-flex justify-content-center align-items-center' type="primary" style={{ width: 20, height: 30, zIndex: 9999999 }}><i style={{ fontSize: 13 }} className="fa fa-check"></i></Button>
                                        <Button onClick={() => {
                                            setEditSubIssueSummary('')
                                            setOpenSetEditSubIssueSummary('')
                                        }} className='mr-1 d-flex justify-content-center align-items-center' style={{ width: 20, height: 30, zIndex: 9999999 }}><i className="fa-solid fa-xmark"></i></Button>
                                    </div>
                                </div> : <span className='d-flex justify-content-between align-items-center sub-issue-summary'>
                                    {subIssue?.summary?.length > displayNumberCharacterInSummarySubIssue ? <span style={{ fontSize: 12 }} className='mr-1'>{subIssue.summary.substring(0, displayNumberCharacterInSummarySubIssue)}...</span> : <span style={{ fontSize: 12 }} className='mr-1'>{subIssue.summary}</span>}
                                    <NavLink onClick={() => {
                                        setOpenSetEditSubIssueSummary(subIssue._id)
                                    }} className="sub-issue-edit-summary" style={{ padding: 5, color: 'black', marginLeft: 5, display: 'none' }}><i className="fa fa-pen"></i></NavLink>
                                </span>}
                            </div>

                            <div className='d-flex align-items-center' style={{ position: 'relative' }}>
                                {/* For Sub Issue Priority */}
                                {openEditSubIssuePriority === subIssue._id ? <div style={{ position: 'absolute' }}>
                                    <div style={{ position: 'relative', right: '100%' }}>
                                        <Select options={priorityTypeOptions} defaultValue={editSubIssueIssuePriority} onSelect={(value) => {
                                            setEditSubIssueIssuePriority(value)
                                        }} />
                                        <div className='d-flex' style={{ position: 'absolute', right: 0 }}>
                                            <Button onClick={() => {
                                                dispatch(updateInfoIssue(subIssue._id, subIssue?.project_id, { issue_priority: editSubIssueIssuePriority }, subIssue.issue_status.toString(), editSubIssueIssuePriority.toString(), userInfo.id, "updated", "priority", projectInfo, userInfo))
                                                setEditSubIssueIssuePriority(2)
                                                setOpenSetEditSubIssuePriority('')
                                            }} className='mr-1 d-flex justify-content-center align-items-center' type="primary" style={{ width: 20, height: 30, zIndex: 9999999 }}><i style={{ fontSize: 13 }} className="fa fa-check"></i></Button>
                                            <Button onClick={() => {
                                                setEditSubIssueIssuePriority(2)
                                                setOpenSetEditSubIssuePriority('')
                                            }} className='mr-1 d-flex justify-content-center align-items-center' style={{ width: 20, height: 30, zIndex: 9999999 }}><i className="fa-solid fa-xmark"></i></Button>
                                        </div>
                                    </div>
                                </div> : <span onClick={() => {
                                    setOpenSetEditSubIssuePriority(subIssue._id)
                                }} className='mr-1'>{iTagForPriorities(subIssue.issue_priority, null, 13)}</span>}


                                {/* For sub issue story point */}
                                {openEditSubIssueStoryPoint === subIssue._id ? <div style={{ position: 'absolute' }}>
                                    <div style={{ position: 'relative', right: '100%' }}>
                                        <InputNumber min={1} max={1000} onChange={(value) => {
                                            setEditSubIssueIssueStoryPoint(value)
                                        }} />
                                        <div className='d-flex' style={{ position: 'absolute', right: 0 }}>
                                            <Button onClick={() => {
                                                dispatch(updateInfoIssue(subIssue._id, subIssue?.project_id, { story_point: editSubIssueIssueStoryPoint }, subIssue.story_point ? subIssue.story_poin.toString() : "None", editSubIssueIssueStoryPoint.toString(), userInfo.id, "updated", "story point"))
                                                setEditSubIssueIssueStoryPoint(0)
                                                setOpenSetEditSubIssueStoryPoint('')
                                            }} className='mr-1 d-flex justify-content-center align-items-center' type="primary" style={{ width: 20, height: 30, zIndex: 9999999 }}><i style={{ fontSize: 13 }} className="fa fa-check"></i></Button>
                                            <Button onClick={() => {
                                                setEditSubIssueIssueStoryPoint(0)
                                                setOpenSetEditSubIssueStoryPoint('')
                                            }} className='mr-1 d-flex justify-content-center align-items-center' style={{ width: 20, height: 30, zIndex: 9999999 }}><i className="fa-solid fa-xmark"></i></Button>
                                        </div>
                                    </div>
                                </div> : <Avatar style={{ cursor: 'pointer', width: 20, height: 20 }} onClick={() => {
                                    setOpenSetEditSubIssueStoryPoint(subIssue._id)
                                }} className='mr-1' size={'small'}><span className='d-flex'>{subIssue.story_point ? subIssue.story_point : "-"}</span></Avatar>}


                                {/* For sub issue assignees */}
                                {openEditSubIssueAssignees === subIssue._id ? <div style={{ position: 'absolute' }}>
                                    <div style={{ position: 'relative', right: '10px' }}>
                                        <Select />
                                        <div className='d-flex' style={{ position: 'absolute', right: 0 }}>
                                            <Button onClick={() => {
                                                setEditSubIssueIssueAssignees([])
                                                setOpenSetEditSubIssueAssignees('')
                                            }} className='mr-1 d-flex justify-content-center align-items-center' type="primary" style={{ width: 20, height: 30, zIndex: 9999999 }}><i style={{ fontSize: 13 }} className="fa fa-check"></i></Button>
                                            <Button onClick={() => {
                                                setEditSubIssueIssueAssignees([])
                                                setOpenSetEditSubIssueAssignees('')
                                            }} className='mr-1 d-flex justify-content-center align-items-center' style={{ width: 20, height: 30, zIndex: 9999999 }}><i className="fa-solid fa-xmark"></i></Button>
                                        </div>
                                    </div>
                                </div> : <Avatar style={{ cursor: 'pointer', width: 20, height: 20 }} onClick={() => {
                                    setOpenSetEditSubIssueAssignees(subIssue._id)
                                }} className='mr-1' size={'small'} icon={<UserOutlined />} />}

                                {/* For sub issue type */}
                                {openEditSubIssueIssueType === subIssue._id ? <div style={{ position: 'absolute' }}>
                                    <div style={{ position: 'relative', right: '10px' }}>
                                        <Select style={{ width: '100%' }} options={renderIssueType(processList, id)} defaultValue={subIssue.issue_type._id} onChange={(value) => {
                                            setEditSubIssueIssueIssueType(value)
                                        }} />
                                        <div className='d-flex' style={{ position: 'absolute', right: 0 }}>
                                            <Button onClick={() => {
                                                const index = renderIssueType(processList, id).findIndex(process => process.value === editSubIssueIssueIssueType)
                                                dispatch(updateInfoIssue(subIssue._id, subIssue?.project_id, { issue_type: editSubIssueIssueIssueType }, subIssue.issue_type.name_process, renderIssueType(processList, id)[index].label, userInfo.id, "updated", "type", projectInfo, userInfo))
                                                setEditSubIssueIssueAssignees([])
                                                setOpenSetEditSubIssueIssueType('')
                                            }} className='mr-1 d-flex justify-content-center align-items-center' type="primary" style={{ width: 20, height: 30, zIndex: 9999999 }}><i style={{ fontSize: 13 }} className="fa fa-check"></i></Button>
                                            <Button onClick={() => {
                                                setEditSubIssueIssueAssignees([])
                                                setOpenSetEditSubIssueIssueType('')
                                            }} className='mr-1 d-flex justify-content-center align-items-center' style={{ width: 20, height: 30, zIndex: 9999999 }}><i className="fa-solid fa-xmark"></i></Button>
                                        </div>
                                    </div>
                                </div> : <Tag style={{ fontSize: 11 }} onClick={() => {
                                    setOpenSetEditSubIssueIssueType(subIssue?._id)
                                }} className='mr-1' color={subIssue?.issue_type?.tag_color}>{subIssue?.issue_type?.name_process}</Tag>}
                            </div>
                        </div>
                    })}
                </div>
            </div>
            {showAddSubIssue === true ? <div className='mt-2'>
                <div className='d-flex align-items-center justify-content-between mt-1'>
                    {chooseExistingSubIssue === false ? <div className='d-flex flex-column' style={{ width: '100%' }}>
                        <div className='d-flex add-sub-isses'>
                            <Select style={{ border: 0, borderRadius: 0, backgroundColor: '#dddd' }} className='infomodal-edit-select-ant' defaultValue={issueTypeOptions[4]} disabled />
                            <Input onChange={(e) => {
                                props.hanleClickEditSummaryInSubIssue(e.target.value)
                            }} style={{ border: '1px solid #7A869A', borderRadius: 0, backgroundColor: 'transparent' }} className='infomodal-edit-input-ant' placeholder='What needs to be done?' />
                        </div>
                        <div className='d-flex mt-2 align-items-center justify-content-between'>
                            <NavLink onClick={() => {
                                setChooseExistingSubIssue(true)
                                props.hanleClickEditSummaryInSubIssue('')
                            }} style={{ fontSize: 12 }}><i className="fa-solid fa-magnifying-glass mr-2" style={{ fontSize: 16 }}></i> Choose an existing issue</NavLink>
                            <div className='d-flex'>
                                <Button onClick={() => {
                                    //proceed to create an sub-issue 
                                    dispatch(createIssue({ summary: subIssueSummary, creator: userInfo.id, issue_status: 4, issue_priority: 2, issue_type: processList[0]._id, parent: issueInfo?._id, project_id: id }, id, userInfo.id, issueInfo?.current_sprint?._id, issueInfo?._id))
                                    props.hanleClickDisplayAddSubIssue(false)
                                    props.hanleClickEditSummaryInSubIssue('')
                                }} className='mr-1' type='primary' style={{ borderRadius: 0 }}>Create</Button>
                                <Button onClick={() => {
                                    props.hanleClickDisplayAddSubIssue(false)
                                    props.hanleClickEditSummaryInSubIssue('')
                                }} style={{ borderRadius: 0 }}>Cancel</Button>
                            </div>
                        </div>


                    </div> : <div className='d-flex flex-column' style={{ width: '100%' }}>
                        <Select className='infomodal-edit-select-ant-add-issue' style={{ width: '100%', height: 35 }} options={renderSubIssueOptions(issuesBacklog)} />
                        <div className='d-flex justify-content-end mt-2'>
                            <Button className='mr-1' onClick={() => {
                                setChooseExistingSubIssue(false)
                                props.hanleClickDisplayAddSubIssue(false)
                            }} type='primary' style={{ borderRadius: 0 }}>Add</Button>
                            <Button onClick={() => {
                                setChooseExistingSubIssue(false)
                                props.hanleClickDisplayAddSubIssue(false)
                            }} style={{ borderRadius: 0 }}>Cancel</Button>
                        </div>
                    </div>}
                </div>
            </div> : <></>}
        </div>
    )
}
