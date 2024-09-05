import { Avatar, Button, Input, InputNumber, Popconfirm, Progress, Select, Tag } from 'antd'
import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { issueTypeOptions, iTagForIssueTypes, iTagForPriorities, priorityTypeOptions, renderSubIssueOptions } from '../../../util/CommonFeatures'
import { useDispatch } from 'react-redux'
import { createIssue, deleteAssignee, updateInfoIssue } from '../../../redux/actions/IssueAction'
import { UserOutlined } from '@ant-design/icons'
import { convertMinuteToFormat, convertTime } from '../../../validations/TimeValidation'
import TrackingTimeModal from '../../../components/Modal/TrackingTimeModal/TrackingTimeModal'
import { displayComponentInModal } from '../../../redux/actions/ModalAction'
import Reporter from '../../Issue-Attributes/Reporter/Reporter'
import CurrentSprint from '../../Issue-Attributes/Current-Sprint/CurrentSprint'
import EpicLink from '../../Issue-Attributes/Epic-Link/EpicLink'
import FixVersion from '../../Issue-Attributes/Fix-Version/FixVersion'
import StoryPoint from '../../Issue-Attributes/Story-Point/StoryPoint'
import Component from '../../Issue-Attributes/Component/Component'
import IssuePriority from '../../Issue-Attributes/Issue-Priority/IssuePriority'
import TimeOriginalEstimate from '../../Issue-Attributes/Time-Original-Estimate/TimeOriginalEstimate'
import Assignees from '../../Issue-Attributes/Assignees/Assignees'

export default function RightIssueInfo(props) {
    const userInfo = props.userInfo
    const issueInfo = props.issueInfo
    const processList = props.processList
    const issuesBacklog = props.issuesBacklog
    const projectInfo = props.projectInfo
    const sprintList = props.sprintList
    const epicList = props.epicList
    const versionList = props.versionList
    const id = props.id
    const displayNumberCharacterInSummarySubIssue = props.displayNumberCharacterInSummarySubIssue

    const navigate = useNavigate()
    const dispatch = useDispatch()

    const showAddSubIssue = props.showAddSubIssue
    const subIssueSummary = props.subIssueSummary
    const [editAttributeTag, setEditAttributeTag] = useState('')

    const handleEditAttributeTag = (status) => {
        setEditAttributeTag(status)
    }

    const renderAssignees = () => {
        return issueInfo?.assignees?.map((value, index) => {
            return <div key={value._id} style={{ display: 'flex', alignItems: 'center', marginRight: '5px' }} className="item mt-2">
                <div className="avatar">
                    <Avatar key={value._id} src={value.avatar} />
                </div>
                <p className="name d-flex align-items-center ml-1" style={{ fontWeight: 'bold' }}>
                    {value.username}
                    {issueInfo?.creator._id === userInfo?.id ? (
                        <Popconfirm placement="topLeft"
                            title="Delete this user?"
                            description="Are you sure to delete this user from project?"
                            onConfirm={() => {
                                //dispatch su kien xoa nguoi dung khoi du an
                                dispatch(deleteAssignee(issueInfo?._id, issueInfo?.projectId, value._id))
                            }} okText="Yes" cancelText="No">
                            <i className="fa fa-times text-danger" style={{ marginLeft: 5 }} />
                        </Popconfirm>
                    ) : <></>}
                </p>
            </div>
        })
    }


    //tham số truyền vào sẽ là id của comment khi click vào chỉnh sửa
    const [addAssignee, setAddAssignee] = useState(true)
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

    const renderIssueType = () => {
        return processList?.map(process => {
            return {
                label: process.name_process,
                value: process._id.toString()
            }
        })
    }
    const calculateProgress = () => {
        if (issueInfo?.timeSpent !== 0 && issueInfo?.timeOriginalEstimate !== 0) {

            return issueInfo?.timeSpent / (issueInfo?.timeOriginalEstimate) * 100
        }
        return 0
    }

    return (
        <div className="col-4 p-0"
            style={{ height: '90%', overflowY: 'auto', scrollbarWidth: 'none' }}>
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
                            percent={Math.round(((issueInfo?.sub_issue_list?.filter(subIssue => subIssue.issue_type?._id === processList[processList?.length - 1]._id)?.length) / (issueInfo?.sub_issue_list?.length)) * 100)}
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
                                                dispatch(updateInfoIssue(subIssue._id, subIssue?.project_id, { summary: editSubIssueSummary }, null, null, userInfo.id, "updated", "summary"))
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
                                    {openEditSubIssuePriority === subIssue._id ? <div style={{ position: 'absolute' }}>
                                        <div style={{ position: 'relative', right: '100%' }}>
                                            <Select options={priorityTypeOptions} defaultValue={editSubIssueIssuePriority} onSelect={(value) => {
                                                setEditSubIssueIssuePriority(value)
                                            }} />
                                            <div className='d-flex' style={{ position: 'absolute', right: 0 }}>
                                                <Button onClick={() => {
                                                    dispatch(updateInfoIssue(subIssue._id, subIssue?.project_id, { issue_priority: editSubIssueIssuePriority }, subIssue.issue_status.toString(), editSubIssueIssuePriority.toString(), userInfo.id, "updated", "priority"))
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
                                    {openEditSubIssueIssueType === subIssue._id ? <div style={{ position: 'absolute' }}>
                                        <div style={{ position: 'relative', right: '10px' }}>
                                            <Select style={{ width: '100%' }} options={renderIssueType()} defaultValue={subIssue.issue_type._id} onChange={(value) => {
                                                setEditSubIssueIssueIssueType(value)
                                            }} />
                                            <div className='d-flex' style={{ position: 'absolute', right: 0 }}>
                                                <Button onClick={() => {
                                                    const index = renderIssueType().findIndex(process => process.value === editSubIssueIssueIssueType)
                                                    dispatch(updateInfoIssue(subIssue._id, subIssue?.project_id, { issue_type: editSubIssueIssueIssueType }, subIssue.issue_type.name_process, renderIssueType()[index].label, userInfo.id, "updated", "type"))
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
                                        setOpenSetEditSubIssueIssueType(subIssue._id)
                                    }} className='mr-1' color={subIssue.issue_type.tag_color}>{subIssue.issue_type.name_process}</Tag>}
                                </div>
                            </div>
                        })}
                    </div>
                </div>
                {showAddSubIssue === true ? <div className='mt-2'>
                    <div className='d-flex align-items-center justify-content-between mt-1'>
                        {chooseExistingSubIssue === false ? <div className='d-flex flex-column' style={{width: '100%'}}>
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
                                        dispatch(createIssue({ summary: subIssueSummary, creator: userInfo.id, issue_status: 4, issue_priority: 2, issue_type: issueInfo?.issue_type._id, parent: issueInfo?._id, project_id: id }, id, userInfo.id, issueInfo?.current_sprint?._id, issueInfo?._id))
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

           <Assignees projectInfo={projectInfo} userInfo={userInfo} issueInfo={issueInfo}/>


            <div style={{ width: '100%', marginTop: 10 }}>
                <Button style={{ textAlign: 'left', height: 'fit-content', width: '100%', padding: '10px 10px', backgroundColor: 'transparent', border: '1px solid #DFE1E6', borderRadius: '3px 3px 0 0' }} type="button" data-toggle="collapse" data-target="#collapseInfoModal" aria-expanded="false" aria-controls="collapseInfoModal">
                    Details <span className='ml-2' style={{ fontSize: 12 }}>Labels, Sprint, Epic Link, Fix Version,....</span>
                </Button>
                <div className="collapse pt-2" id="collapseInfoModal" style={{ border: '1px solid #DFE1E6', borderTop: 'none', borderRadius: '0 0 3px 3px', padding: '0 10px' }}>
                    <Reporter issueInfo={issueInfo} />
                    <CurrentSprint
                        handleEditAttributeTag={handleEditAttributeTag}
                        editAttributeTag={editAttributeTag}
                        issueInfo={issueInfo}
                        id={id}
                        userInfo={userInfo}
                        sprintList={sprintList} />
                    <EpicLink handleEditAttributeTag={handleEditAttributeTag}
                        editAttributeTag={editAttributeTag}
                        issueInfo={issueInfo}
                        id={id}
                        userInfo={userInfo}
                        epicList={epicList} />

                    <FixVersion handleEditAttributeTag={handleEditAttributeTag}
                        editAttributeTag={editAttributeTag}
                        issueInfo={issueInfo}
                        id={id}
                        userInfo={userInfo}
                        versionList={versionList} />

                    <StoryPoint handleEditAttributeTag={handleEditAttributeTag}
                        editAttributeTag={editAttributeTag}
                        issueInfo={issueInfo}
                        userInfo={userInfo} />

                    <Component handleEditAttributeTag={handleEditAttributeTag}
                        editAttributeTag={editAttributeTag} />

                    <IssuePriority handleEditAttributeTag={handleEditAttributeTag}
                        editAttributeTag={editAttributeTag}
                        issueInfo={issueInfo}
                        userInfo={userInfo} />

                    <TimeOriginalEstimate handleEditAttributeTag={handleEditAttributeTag}
                        editAttributeTag={editAttributeTag}
                        projectInfo={projectInfo}
                        issueInfo={issueInfo}
                        userInfo={userInfo}/>
                    
                </div>
            </div>
            <div className="time-tracking mt-2" style={{ cursor: 'pointer' }}>
                <span style={{ color: '#42526e', fontWeight: '500' }}>Time Tracking</span>
                <div>
                    <div>
                        <div className='d-flex align-items-center' style={{ width: '100%' }}>
                            <i className="fa fa-clock" />
                            <Progress style={{ width: '100%' }} onClick={() => {
                                dispatch(displayComponentInModal(<TrackingTimeModal userInfo={userInfo} issueInfo={issueInfo} />))
                            }} percent={Math.floor(calculateProgress())} size="small" status="active" />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span className="logged ml-4">{issueInfo?.timeSpent === 0 ? '0h' : convertMinuteToFormat(issueInfo?.timeSpent)} logged</span>
                            <span className="estimate-time mr-2">
                                {issueInfo?.timeOriginalEstimate !== 0 && issueInfo?.timeSpent !== 0 ? (issueInfo?.timeOriginalEstimate - issueInfo?.timeSpent === 0 ? '0h' : convertMinuteToFormat(issueInfo?.timeOriginalEstimate - issueInfo?.timeSpent)) : '0h'} remaining
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div style={{ color: '#929398' }}>Created at {convertTime(issueInfo?.createAt)}</div>
            <div style={{ color: '#929398' }}>{convertTime(issueInfo?.createAt) !== convertTime(issueInfo?.updateAt) ? `Updated at ${convertTime(issueInfo?.updateAt)}` : "No updated recently"}</div>
        </div>
    )
}
