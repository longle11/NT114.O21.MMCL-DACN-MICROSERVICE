import { Avatar, Breadcrumb, Button, Checkbox, Col, DatePicker, Input, InputNumber, Modal, Popconfirm, Progress, Row, Select, Tag } from 'antd';
import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { Editor } from '@tinymce/tinymce-react';
import Parser from 'html-react-parser';
import { Option } from 'antd/es/mentions';
import { createWorklogHistory, deleteAssignee, getIssueHistoriesList, getIssuesBacklog, getWorklogHistoriesList, updateInfoIssue } from '../../../redux/actions/IssueAction';
import { createCommentAction } from '../../../redux/actions/CommentAction';
import { showNotificationWithIcon } from '../../../util/NotificationUtil';
import { GetProcessListAction } from '../../../redux/actions/ListProjectAction';
import { priorityTypeOptions, issueTypeOptions, iTagForPriorities, iTagForIssueTypes } from '../../../util/CommonFeatures';
import { getEpicList, updateEpic } from '../../../redux/actions/CategoryAction';
import { useParams } from 'react-router-dom';
import { UserOutlined } from '@ant-design/icons';
import Search from 'antd/es/input/Search';
import './Issue-Detail.css'
const { DateTime } = require('luxon');
export default function IssueDetail() {
    const projectInfo = useSelector(state => state.listProject.projectInfo)
    const processList = useSelector(state => state.listProject.processList)
    const userInfo = useSelector(state => state.user.userInfo)
    const historyList = useSelector(state => state.issue.historyList)
    const worklogList = useSelector(state => state.issue.worklogList)
    const [issueInfo, setIssueInfo] = useState({})
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [openDatePicker, setOpenDatePicker] = useState(false)
    const epicList = useSelector(state => state.categories.epicList)
    const issuesBacklog = useSelector(state => state.issue.issuesBacklog)
    const { id } = useParams()
    const regexs = [
        /^(\d+)w([1-6])d([1-9]|1\d|2[0-4])h([1-9]|[1-5]\d|)m$/, //_w_d_h_m
        /^(\d+)d([1-9]|1\d|2[0-4])h([1-9]|[1-5]\d|)m$/,  //_d_h_m
        /^(\d+)h([1-9]|[1-5]\d|)m$/,   //h_m
        /^(\d+)w([1-7])d([1-9]|1\d|2[0-4])h$/, //_w_d_h
        /^(\d+)w([1-7])d([1-9]|[1-5]\d|)m$/, //_w_d_m
        /^(\d+)w([1-9]|1\d|2[0-4])h([1-9]|[1-5]\d|)m$/, //_w_h_m
        /^(\d+)w[1-7]d$/,   //_w_d
        /^(\d+)w([1-9]|1\d|2[0-4])h$/, //_w_h
        /^(\d+)w([1-9]|[1-5]\d|)m$/,    //_w_m
        /^(\d+)d([1-9]|1\d|2[0-4])h$/,   //_d_h
        /^(\d+)d([1-9]|[1-5]\d|)m$/, //_d_m
        /^(\d+)w$/, //w
        /^(\d+)d$/, //d
        /^(\d+)h$/, //h 
        /^(\d+)m$/, //m
    ]
    const handleOk = () => {
        setIsModalOpen(false);
        dispatch(updateInfoIssue(issueInfo?._id, issueInfo?.project_id.toString(), { timeSpent: formData.timeSpent }, issueInfo.timeSpent, formData.timeSpent, issueInfo.id, "updated", "time spent"))
        dispatch(createWorklogHistory({
            issue_id: issueInfo._id.toString(),
            creator: userInfo.id,
            working_date: formData.dateWorking,
            description: formData.description,
            timeSpent: convertMinuteToFormat(formData.timeSpent)
        }))
    };
    const handleCancel = () => {
        setIsModalOpen(false);
    };


    useEffect(() => {
        dispatch(getIssuesBacklog(id))
        dispatch(GetProcessListAction(id))
        dispatch(getEpicList(id))
    }, [])

    const [buttonActive, setButtonActive] = useState(1)
    const [editDescription, setEditDescription] = useState(true)
    //tham số truyền vào sẽ là id của comment khi click vào chỉnh sửa
    const [editComment, setEditComment] = useState('')
    const [editContentComment, setEditContentComment] = useState('')

    const [addAssignee, setAddAssignee] = useState(true)
    const [description, setDescription] = useState('')
    //sử dụng cho phần bình luận
    //tham số isSubmit thì để khi bấm send thì mới thực hiện duyệt mảng comments
    const [comment, setComment] = useState({
        content: '',
        isSubmit: true,
    })
    const dispatch = useDispatch()

    //su dung cho debounce time original
    const inputTimeOriginal = useRef(null)

    const [formData, setFormData] = useState({
        timeSpent: 0,
        dateWorking: '',
        description: '',
        timeRemaining: 0
    })
    const renderIssueType = () => {
        return processList?.map(process => {
            return {
                label: process.name_process,
                value: process._id.toString()
            }
        })
    }


    const renderEpics = () => {
        return epicList?.map(epic => {
            return {
                value: epic._id.toString(),
                label: epic.epic_name
            }
        })
    }
    const getCurrentEpic = () => {
        if (issueInfo?.epic_link === null) {
            return null
        }
        return epicList?.findIndex(epic => epic._id.toString() === issueInfo?.epic_link?._id.toString())
    }

    const renderOptionAssignee = () => {
        return projectInfo?.members?.filter((value, index) => {
            const isExisted = issueInfo?.assignees?.findIndex((user) => {
                return user._id === value._id
            })
            return !(issueInfo?.creator._id === value._id || isExisted !== -1)
        }).map((value, index) => {
            return <Option key={value._id} value={value._id}>{value.username}</Option>
        })
    }

    const handlEditorChange = (content, editor) => {
        setDescription(content)
    }


    const convertTime = (commentTime) => {
        const diff = DateTime.now().diff(DateTime.fromISO(commentTime), ['minutes', 'hours', 'days', 'months']).toObject();

        if (diff.hours >= 1) {
            return `${Math.round(diff.hours)} hour ago`
        }
        if (diff.minutes >= 1) {
            return `${Math.round(diff.minutes)} minutes ago`
        }
        if (diff.days >= 1) {
            return `${Math.round(diff.days)} days ago`
        }
        if (diff.months >= 1) {
            return `${Math.round(diff.months)} months ago`
        } else {
            return 'a few second ago'
        }
    }

    const renderContentModal = () => {
        if (issueInfo?.description !== null && issueInfo?.description?.trim() !== '') {
            return Parser(`${issueInfo?.description}`)
        }

        if (issueInfo?.creator._id === userInfo?.id) {
            return <p style={{ color: 'blue' }}>Add Your Description</p>
        }
        return <p>There is no description yet</p>
    }

    const validateOriginalTime = (input) => {
        for (const regex of regexs) {
            if (input.match(regex)) {
                return true
            }
        }
        return false
    }

    const splitTimeToObject = (time) => {
        var indexForW = -1, startForW = 0, indexForD = -1, startForD = 0, indexForH = -1, startForH = 0, indexForM = -1, startForM = 0
        var startIndex = 0
        var timeObject = []
        if (time !== null || time !== undefined) {
            for (var index = 0; index < time?.length; index++) {
                if (time[index] === 'w') {
                    startForW = startIndex
                    indexForW = index
                    startIndex = index
                }
                if (time[index] === 'd') {
                    startForD = startIndex
                    indexForD = index
                    startIndex = index
                }
                if (time[index] === 'h') {
                    startForH = startIndex
                    indexForH = index
                    startIndex = index
                }
                if (time[index] === 'm') {
                    startForM = startIndex
                    indexForM = index
                    startIndex = index
                }
            }
        }

        if (indexForW !== -1) {
            timeObject.push({
                key: 'w',
                value: time.substring(startForW !== 0 ? startForW + 1 : 0, indexForW)
            })
        }
        if (indexForD !== -1) {
            timeObject.push({
                key: 'd',
                value: time.substring(startForD !== 0 ? startForD + 1 : 0, indexForD)
            })
        }
        if (indexForH !== -1) {
            timeObject.push({
                key: 'h',
                value: time.substring(startForH !== 0 ? startForH + 1 : 0, indexForH)
            })
        }
        if (indexForM !== -1) {
            timeObject.push({
                key: 'm',
                value: time.substring(startForM !== 0 ? startForM + 1 : 0, indexForM)
            })
        }
        return timeObject
    }

    const calculateTimeAfterSplitted = (time) => {
        const timeObject = splitTimeToObject(time)
        var totalTimeConvertToMinute = 0
        for (var index = 0; index < timeObject.length; index++) {
            if (timeObject[index].key === 'w') {
                totalTimeConvertToMinute += parseInt(timeObject[index].value) * 7 * 24 * 60
            } else if (timeObject[index].key === 'd') {
                totalTimeConvertToMinute += parseInt(timeObject[index].value) * 24 * 60
            } else if (timeObject[index].key === 'h') {
                totalTimeConvertToMinute += parseInt(timeObject[index].value) * 60
            } else if (timeObject[index].key === 'm') {
                totalTimeConvertToMinute += parseInt(timeObject[index].value)
            }
        }

        return totalTimeConvertToMinute
    }

    const compareTimeSpentWithTimeOriginal = (timeSpent) => {
        return issueInfo.timeOriginalEstimate >= calculateTimeAfterSplitted(timeSpent)
    }

    const convertMinuteToFormat = (time) => {
        if (time === 0 || time === undefined || time === NaN) {
            return "None"
        }
        var timeAfterConverting = ''

        //truong hop neu lon hon week
        if (time >= 7 * 24 * 60) {
            const getWeek = parseInt(time / (7 * 24 * 60))
            timeAfterConverting += getWeek + 'w'
            var timeRemaining = time - getWeek * 7 * 24 * 60
            //neu truong hop lon hon 1 ngay
            if (timeRemaining >= 24 * 60) {
                const getDay = parseInt(timeRemaining / (24 * 60))
                //neu lon hon 1 ngay
                timeAfterConverting += getDay + 'd'
                timeRemaining -= getDay * 24 * 60
                //neu lon hon 1 gio
                if (timeRemaining >= 60) {
                    const getHour = parseInt(timeRemaining / 60)
                    timeAfterConverting += getHour + 'h'
                    timeRemaining -= getHour * 60
                    if (timeRemaining !== 0) {
                        timeAfterConverting += timeRemaining + 'm'
                    }
                } else {
                    //neu nho hon 1 gio
                    timeAfterConverting += timeRemaining + 'm'
                }
            } else {
                const getHour = parseInt(timeRemaining / 60)
                if (getHour >= 1) {
                    timeAfterConverting += getHour + 'h'
                    timeRemaining -= getHour * 60
                    if (timeRemaining !== 0) {
                        timeAfterConverting += timeRemaining + 'm'
                    }
                } else {
                    timeAfterConverting += timeRemaining + 'm'
                }
            }
        } else {
            //truong hop nho hon 1 tuan
            const getDay = parseInt(time / (24 * 60))
            if (getDay >= 1) {
                timeAfterConverting += getDay + 'd'
                time -= getDay * 24 * 60
                //neu lon hon 1 gio
                if (time >= 60) {
                    const getHour = parseInt(time / 60)
                    timeAfterConverting += getHour + 'h'
                    time -= getHour * 60
                    if (time !== 0) {
                        timeAfterConverting += time + 'm'
                    }
                } else {
                    if (time !== 0) {
                        timeAfterConverting += time + 'm'
                    }
                }
            } else {
                //truong hop nho hon 1 ngay
                const getHour = parseInt(time / 60)
                if (getHour >= 1) {
                    timeAfterConverting += getHour + 'h'
                    time -= getHour * 60
                    if (time !== 0) {
                        timeAfterConverting += time + 'm'
                    }
                } else {
                    if (time !== 0) {
                        timeAfterConverting += time + 'm'
                    }
                }
            }
        }

        return timeAfterConverting
    }

    const renderAllIssuesInProject = () => {
        if (Object.keys(issueInfo).length === 0) {
            if (issuesBacklog && issuesBacklog?.length !== 0) {
                setIssueInfo(issuesBacklog[0])
            }
        }
        const getAllIssues = issuesBacklog?.map((issue, index) => {
            return <li onClick={() => {
                setIssueInfo(issue)
            }} className={`list-group-item`} key={issue._id.toString()} style={{ backgroundColor: issueInfo?._id === issue._id ? '#E9F2FF' : '#ffff  ' }}>
                <p>{issue.summary}</p>
                <div className='d-flex justify-content-between align-items-center'>
                    <div className='d-flex align-items-center'>
                        {iTagForIssueTypes(issue.issue_status)}
                        {iTagForPriorities(issue.issue_priority)}
                    </div>
                    <Avatar icon={<UserOutlined />} />
                </div>
            </li>
        })
        return <ul className="list-group">
            {getAllIssues}
        </ul>
    }

    const calculateProgress = () => {
        if (issueInfo?.timeSpent !== 0 && issueInfo?.timeOriginalEstimate !== 0) {

            return issueInfo?.timeSpent / (issueInfo?.timeOriginalEstimate) * 100
        }
        return 0
    }

    const renderComments = () => {
        // let listComments = issueInfo?.comments.map((value, index) => {
        //     return (<li className='comment d-flex' key={value._id}>
        //         <div className="avatar">
        //             <Avatar src={value.creator.avatar} size={40} />
        //         </div>
        //         <div style={{ width: '100%' }}>
        //             <p style={{ marginBottom: 5, fontWeight: 'bold' }}>
        //                 {value.creator.username} <span style={{ fontWeight: 'normal' }} className='ml-4'>{value?.isModified ? "Modified " : ''}{convertTime(value?.timeStamp)}</span>
        //             </p>
        //             {editComment.trim() !== '' && editComment === value._id.toString() ? (
        //                 <div>
        //                     <TextArea value={editContentComment} defaultValue="" onChange={(e) => {
        //                         setEditContentComment(e.target.value)
        //                     }} autosize={{ minRows: 5, maxRows: 10 }} />
        //                     <div>
        //                         <Button onClick={() => {
        //                             setEditComment('')
        //                             //gửi lên sự kiện cập nhật comment
        //                             dispatch(updateCommentAction({ commentId: value._id.toString(), content: editContentComment, issueId: issueInfo?._id.toString(), timeStamp: new Date() }))
        //                         }} type="primary" className='mt-2 mr-2'>Save</Button>
        //                         <Button onClick={() => {
        //                             setEditComment('')
        //                         }} className='mt-2'>Cancel</Button>
        //                     </div>
        //                 </div>
        //             ) : (
        //                 <div>
        //                     <p style={{ marginBottom: 5 }}>
        //                         {value.content}
        //                     </p>
        //                     {
        //                         value.creator._id === userInfo?.id ? (<div className="mb-2"><button className="btn bg-transparent p-0 mr-3" onClick={() => {
        //                             setEditContentComment(value.content);
        //                             setEditComment(value._id.toString());
        //                         }} style={{ color: '#929398', fontWeight: 'bold', cursor: 'pointer' }}>Edit</button>
        //                             <button className="btn bg-transparent p-0" onKeyDown={() => { }} onClick={() => {
        //                                 dispatch(deleteCommentAction({ commentId: value._id.toString(), issueId: issueInfo?._id.toString() }));
        //                             }} style={{ color: '#929398', fontWeight: 'bold', cursor: 'pointer' }}>Delete</button></div>) : <div className='mt-3'></div>

        //                     }
        //                 </div>
        //             )}
        //         </div>
        //     </li>)
        // });

        // if (comment.isSubmit) {
        //     storeListComments.setComments(listComments)
        // }

        // return storeListComments.getComments()
    }




    function capitalizeFirstLetter(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    const renderTypeHistory = (name_status, old_status, new_status) => {
        if (name_status.toLowerCase() === "priority") {
            return <div>{iTagForPriorities(old_status)} <i className="fa-solid fa-arrow-right-long ml-3 mr-3"></i> {iTagForPriorities(new_status)}</div>
        } else if (name_status.toLowerCase() === "status") {
            return <div>{iTagForIssueTypes(old_status)} <i className="fa-solid fa-arrow-right-long ml-3 mr-3"></i>  {iTagForIssueTypes(new_status)}</div>
        } else if (name_status.toLowerCase() === "assignees") {
            const getAvatar = new_status.indexOf("+")
            return <div><span style={{ fontWeight: 'bold' }}>Assignees</span> <i className="fa-solid fa-arrow-left-long ml-3 mr-3"></i>  <Avatar src={new_status.substring(0, getAvatar)} /> {new_status.substring(getAvatar + 1)}</div>
        } else if (name_status.toLowerCase() === "time original estimate" || name_status.toLowerCase() === "time spent") {
            return <div>{convertMinuteToFormat(old_status)} <i className="fa-solid fa-arrow-right-long ml-3 mr-3"></i> {convertMinuteToFormat()}</div>
        } else if (name_status.toLowerCase() === "sprint" || name_status.toLowerCase().includes("epic") || name_status.toLowerCase().includes("version") || name_status.toLowerCase().includes("point") || name_status.toLowerCase().includes("type")) {
            return <div>{old_status} <i className="fa-solid fa-arrow-right-long ml-3 mr-3"></i> {new_status}</div>
        }
    }
    const renderHistoriesList = () => {
        const customHistoriesList = historyList?.map((history, index) => {
            return <div key={index} className='d-flex align-items-center mt-3'>
                <div className='history-avatar mr-2'>
                    <Avatar src={history.createBy?.avatar} />
                </div>
                <div className='history-info'>
                    <div className='history-info-type'>
                        <span><span style={{ fontWeight: 'bold' }}>{history?.createBy?.username}</span> {history?.type_history} the <span style={{ fontWeight: 'bold' }}>{capitalizeFirstLetter(history?.name_status)}</span> {convertTime(history.createAt)}</span>
                    </div>
                    <div className='history-info-status'>
                        {history?.type_history.toLowerCase() !== "created" ? renderTypeHistory(history?.name_status, history?.old_status, history?.new_status) : <></>}
                    </div>
                </div>
            </div>
        })

        return <div className='history-list-detail'>
            {customHistoriesList}
        </div>
    }

    const renderWorklogsList = () => {
        const customWorklogsList = worklogList?.map((worklog, index) => {
            return <div key={index} className='d-flex align-items-center mt-3'>
                <div className='worklog-avatar mr-2'>
                    <Avatar src={worklog.creator?.avatar} />
                </div>
                <div className='worklog-info'>
                    <div className='worklog-info-type'>
                        <span><span style={{ fontWeight: 'bold' }}>{worklog.creator.username}</span> logged the <span style={{ fontWeight: 'bold' }}>{worklog?.timeSpent}</span> {(worklog.working_date)}</span>
                    </div>
                    <div className='worklog-info-description'>
                        {worklog.description}
                    </div>
                </div>
            </div>
        })

        return <div className='worklog-list-detail'>
            {customWorklogsList}
        </div>
    }

    const calculateTime = (timeOri, timeSpe) => {
        const timeOriginalEstimate = calculateTimeAfterSplitted(timeOri)
        const timeSpent = calculateTimeAfterSplitted(timeSpe)

        return timeOriginalEstimate - timeSpent
    }

    const renderActivities = () => {
        if (buttonActive === 0) {

        } else if (buttonActive === 1) {
            return <div className="comment mt-3">
                <h6>Comment</h6>

                {/* Kiểm tra xem nếu người đó thuộc về issue thì mới có thể đăng bình luận */}
                {issueInfo?.creator?._id === userInfo?.id || issueInfo?.assignees?.findIndex(value => value._id === userInfo?.id) !== -1 ? (
                    <div className="block-comment" style={{ display: 'flex', flexDirection: 'column' }}>
                        <div className="input-comment d-flex">
                            <div className="avatar">
                                <Avatar src={userInfo?.avatar} size={40} />
                            </div>
                            <div style={{ width: '100%' }}>
                                <Input type='text' placeholder='Add a comment...' defaultValue="" value={comment.content} onChange={(e) => {
                                    setComment({
                                        content: e.target.value,
                                        isSubmit: false
                                    })
                                }} />
                                <Button type="primary" onClick={() => {
                                    if (comment.content.trim() === '') {
                                        showNotificationWithIcon('error', 'Tạo bình luận', 'Vui lòng nhập nội dung trước khi gửi')
                                    } else {
                                        dispatch(createCommentAction({ content: comment.content, issueId: issueInfo._id, creator: userInfo?.id }))
                                        setComment({
                                            content: '',
                                            isSubmit: true
                                        })
                                    }
                                }} className='mt-2'>Send</Button>
                            </div>
                        </div>
                        <ul className="display-comment mt-2 p-0" style={{ display: 'flex', flexDirection: 'column', height: '35rem', overflow: 'overlay', scrollbarWidth: 'none' }}>
                            {/* {renderComments()} */}
                        </ul>
                    </div>
                ) : <p className='text-danger'>Plese join in this issue to read comments</p>}

            </div>
        } else if (buttonActive === 2) {
            return <div className="comment mt-3">
                <h6>History</h6>
                <div style={{ height: 420, overflowY: 'auto', scrollbarWidth: 'none' }}>
                    {renderHistoriesList()}
                </div>
            </div>
        } else if (buttonActive === 3) {
            return <div className="comment mt-3">
                <h6>Work log</h6>
                {renderWorklogsList()}
            </div>
        }
    }


    return (
        <div style={{ overflow: 'none', margin: '0 20px' }}>
            <div className='issue-info-header'>
                <Breadcrumb
                    style={{ marginBottom: 10 }}
                    items={[
                        {
                            title: <a href="">Projects</a>,
                        },
                        {
                            title: <a href="">Hidden</a>,
                        }
                    ]}
                />
                <h4>Issues</h4>
                <div className='d-flex align-items-center'>
                    <Search
                        className='issue-search'
                        placeholder="Search issues"
                        style={{
                            width: 200
                        }}
                    />
                    <div className='issue-options d-flex'>
                        <div className='dropdown'>
                            <Button type='primary' className='mr-2 ml-2 btn-options' id="btn-option1 dropdownTypeMenu" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                Type <i className="fa fa-angle-down ml-2" style={{ fontSize: 13, fontWeight: 'bold' }}></i>
                            </Button>
                            <div className="dropdown-menu" aria-labelledby="dropdownTypeMenu" style={{width: 'max-content', padding: '10px'}}>
                                <p style={{fontSize: 13, marginBottom: 5}}>STANDARD ISSUE TYPES</p>
                                <Checkbox.Group className='mb-3'>
                                    <Row>
                                        <Col span="16">
                                            <Checkbox value="0">{iTagForIssueTypes(0)}</Checkbox>
                                        </Col>
                                        <Col span="16">
                                            <Checkbox value="1">{iTagForIssueTypes(1)}</Checkbox>
                                        </Col>
                                        <Col span="16">
                                            <Checkbox value="2">{iTagForIssueTypes(2)}</Checkbox>
                                        </Col>
                                    </Row>
                                </Checkbox.Group>
                                <p style={{fontSize: 13, marginBottom: 5}}>SUB-TASK ISSUE TYPE</p>
                                <Checkbox value="3">Sub task</Checkbox>
                            </div>
                        </div>

                        <div className='dropdown'>
                            <Button type='primary' className='mr-2 btn-options' id="btn-option2 dropdownStatusMenu" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                Status <i className="fa fa-angle-down ml-2" style={{ fontSize: 13, fontWeight: 'bold' }}></i>
                            </Button>
                            <div className="dropdown-menu" aria-labelledby="dropdownStatusMenu">
                                <Checkbox.Group style={{ width: '100%', margin: '10px' }}>
                                    <Row>
                                        {processList.map((process) => {
                                            return <Col span="16">
                                                <Checkbox value={process._id}><Tag color={process.tag_color}>{process.name_process}</Tag></Checkbox>
                                            </Col>
                                        })}
                                    </Row>
                                </Checkbox.Group>
                            </div>
                        </div>
                        <div className='dropdown'>
                            <Button type='primary' className='mr-2 btn-options' id="btn-option3 dropdownAssigneeMenu" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                Assignee <i className="fa fa-angle-down ml-2" style={{ fontSize: 13, fontWeight: 'bold' }}></i>
                            </Button>
                            <div className="dropdown-menu" aria-labelledby="dropdownAssigneeMenu">

                            </div>
                        </div>
                        <div className='dropdown'>
                            <Button type='primary' className='mr-2 btn-options' id="btn-option4 dropdownMoreMenu" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                More <i className="fa fa-angle-down ml-2" style={{ fontSize: 13, fontWeight: 'bold' }}></i>
                            </Button>
                            <div className="dropdown-menu" aria-labelledby="dropdownMoreMenu">

                            </div>
                        </div>
                    </div>
                    <div>
                        <Button type='primary' className='mr-2 btn-options'>Clear option filter </Button>
                        <Button type='primary' className='mr-2 btn-options'>Save option filter </Button>
                    </div>
                </div>
            </div>
            <div className="issue-info-body" style={{ width: '100%', padding: '5px 10px' }}>
                <div className='row'>
                    <div className='issue-info-left col-2' style={{ border: '1px solid #dddd', padding: 0, borderRadius: '5px', height: 'fit-content', maxHeight: 600, scrollbarWidth: 'none', overflowY: 'auto', backgroundColor: '#091e420f' }}>
                        <div className='d-flex justify-content-between'>
                            <button className='btn btn-transparent'>Created <i className="fa-solid fa-caret-down ml-2"></i></button>
                            <div>
                                <button className='btn btn-transparent' style={{ fontSize: 13 }}><i className="fa-solid fa-sort"></i></button>
                                <button className='btn btn-transparent' onClick={() => {
                                    dispatch(getIssuesBacklog(id))
                                }}><i className="fa-solid fa-arrows-rotate" style={{ fontSize: 13 }}></i></button>
                            </div>
                        </div>
                        <div>
                            {renderAllIssuesInProject()}
                        </div>
                        <div style={{ padding: '8px', display: 'flex', justifyContent: 'center' }}>{issuesBacklog?.length === 0 ? "0 of 0" : `1 - ${issuesBacklog?.length} of ${issuesBacklog?.length}`}</div>
                    </div>
                    {(issueInfo !== null || issueInfo !== undefined) && Object.keys(issueInfo).length === 0 ? <div className='col-10'>No issues</div> : <div className='col-10 row'>
                        <div className='issue-info-middle col-8'>
                            <div className="task-title">
                                <Select
                                    placeholder={issueTypeOptions[issueInfo?.issue_status]?.label}
                                    defaultValue={issueTypeOptions[issueInfo?.issue_status]?.value}
                                    style={{ width: '20%' }}
                                    options={issueTypeOptions}
                                    disabled={issueInfo?.creator?._id !== userInfo?.id}
                                    onSelect={(value, option) => {
                                        dispatch(updateInfoIssue(issueInfo?._id, issueInfo?.project_id.toString(), { issue_status: value }, `${issueInfo.issue_status}`, `${value}`, userInfo.id, 'updated', 'status'))
                                    }}
                                    name="issue_status"
                                />
                            </div>
                            <div className='mt-2'>
                                <p className="issue_summary" style={{ fontSize: '24px', fontWeight: 'bold' }}>{issueInfo?.summary}</p>
                                <div className="description">
                                    <p style={{ fontWeight: 'bold', fontSize: '15px' }}>Description</p>
                                    {editDescription ? (<p onKeyDown={() => { }} onDoubleClick={() => {
                                        if (issueInfo?.creator?._id === userInfo?.id) {
                                            setEditDescription(false)
                                        }
                                    }}>
                                        {renderContentModal()}
                                    </p>) : (
                                        <>
                                            <Editor name='description'
                                                apiKey='golyll15gk3kpiy6p2fkqowoismjya59a44ly52bt1pf82oe'
                                                init={{
                                                    plugins: 'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount linkchecker',
                                                    toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat',
                                                    tinycomments_mode: 'embedded',
                                                    tinycomments_author: 'Author name',
                                                    mergetags_list: [
                                                        { value: 'First.Name', title: 'First Name' },
                                                        { value: 'Email', title: 'Email' },
                                                    ],
                                                    ai_request: (request, respondWith) => respondWith.string(() => Promise.reject("See docs to implement AI Assistant")),
                                                }}
                                                initialValue={issueInfo?.description}
                                                onEditorChange={handlEditorChange}
                                            />

                                            <div className='mt-2'>
                                                <Button onClick={() => {
                                                    setEditDescription(true)
                                                    dispatch(updateInfoIssue(issueInfo?._id, issueInfo?.project_id, { description: description }, '', '', userInfo?.id, "update", "description"))
                                                }} type="primary" className='mr-2'>Save</Button>
                                                <Button onClick={() => {
                                                    setEditDescription(true)
                                                }}>Cancel</Button>
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className='activities'>
                                    <h5>Activity</h5>
                                    <div>
                                        <span>Show:</span>
                                        <button className='btn btn-light ml-3 mr-2' onClick={() => { setButtonActive(0) }} style={{ padding: '0 10px', fontSize: '14px', fontWeight: '600', backgroundColor: buttonActive === 0 ? "#e9f2ff " : "#091e420f", color: buttonActive === 0 ? '#0c66e4' : "#44546f" }}>All</button>
                                        <button className='btn btn-light mr-2' onClick={() => { setButtonActive(1) }} style={{ padding: '0 10px', fontSize: '14px', fontWeight: '600', backgroundColor: buttonActive === 1 ? "#e9f2ff " : "#091e420f", color: buttonActive === 1 ? '#0c66e4' : "#44546f" }}>Comments</button>
                                        <button className='btn btn-light mr-2' onClick={() => { setButtonActive(2); dispatch(getIssueHistoriesList(issueInfo?._id.toString())) }} style={{ padding: '0 10px', fontSize: '14px', fontWeight: '600', backgroundColor: buttonActive === 2 ? "#e9f2ff " : "#091e420f", color: buttonActive === 2 ? '#0c66e4' : "#44546f" }}>History</button>
                                        <button className='btn btn-light' onClick={() => { setButtonActive(3); dispatch(getWorklogHistoriesList(issueInfo?._id.toString())) }} style={{ padding: '0 10px', fontSize: '14px', fontWeight: '600', backgroundColor: buttonActive === 3 ? "#e9f2ff " : "#091e420f", color: buttonActive === 3 ? '#0c66e4' : "#44546f" }}>Work log</button>
                                    </div>
                                </div>
                                {renderActivities()}
                            </div>
                        </div>
                        <div className="issue-info-right col-4">
                            <div>
                                <div className="status">
                                    <h6>TYPE</h6>
                                    <Select
                                        options={renderIssueType()}
                                        style={{ width: '50%' }}
                                        disabled={issueInfo?.creator?._id !== userInfo?.id}
                                        onChange={(value, props) => {
                                            dispatch(updateInfoIssue(issueInfo?._id, issueInfo?.project_id, { issue_type: value }, issueInfo?.issue_type.name_process, props.label, userInfo.id, "updated", "issue type"))
                                        }}
                                        value={issueInfo?.issue_type?._id.toString()}
                                    />
                                </div>
                                <div className="assignees mt-3">
                                    <h6>ASSIGNEES</h6>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)' }}>
                                        {issueInfo?.assignees?.map((value, index) => {
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
                                        })}
                                        {
                                            issueInfo?.creator?._id === userInfo?.id ? (
                                                <button onKeyDown={() => { }} className='text-primary mt-2 mb-2 btn bg-transparent' style={{ fontSize: '12px', margin: '0px', cursor: 'pointer', display: addAssignee === false ? 'none' : 'block', padding: 0, textAlign: 'left' }} onClick={() => {
                                                    setAddAssignee(false)
                                                    dispatch(updateInfoIssue(issueInfo?._id, issueInfo?.projectId, { assignees: '66bb8785c618f818d7c18e71' }, null, "https://ui-avatars.com/api/?name=ltphilong+ltphilong", userInfo.id, "added", "assignees"))
                                                }} >
                                                    <i className="fa fa-plus" style={{ marginRight: 5 }} />Add more
                                                </button>
                                            ) : <></>
                                        }

                                    </div>
                                    {!addAssignee ? (
                                        <div>
                                            <Select
                                                onBlur={() => {
                                                    setAddAssignee(true)
                                                }}
                                                style={{ width: '200px' }}
                                                placeholder="Select a person"
                                                optionFilterProp="children"
                                                disabled={issueInfo?.creator._id !== userInfo?.id}
                                                onSelect={(value, option) => {
                                                    setAddAssignee(true)
                                                    dispatch(updateInfoIssue(issueInfo?._id, issueInfo?.projectId, { assignees: value }, null, "https://ui-avatars.com/api/?name=ltphilong+ltphilong", userInfo.id, "added", "assignees"))
                                                }}
                                                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                            >
                                                {renderOptionAssignee()}
                                            </Select>
                                        </div>
                                    ) : <></>}
                                </div>
                                <div className="reporter-sprint row align-items-center">
                                    <div className='col-6'>
                                        <h6 className='mt-3'>CREATOR</h6>
                                        <div style={{ display: 'flex' }} className="item">
                                            <div className="avatar">
                                                <Avatar src={issueInfo?.creator?.avatar} />
                                            </div>
                                            <p className="name d-flex align-items-center ml-1 p-0" style={{ fontWeight: 'bold' }}>
                                                {issueInfo?.creator?.username}
                                            </p>
                                        </div>
                                    </div>
                                    <div className='col-6'>
                                        <h6 className='mt-3'>SPRINT</h6>
                                        <Input disabled value={issueInfo?.current_sprint ? issueInfo?.current_sprint.sprint_name : "None"} />
                                    </div>
                                </div>
                                <div className='row epic-version'>
                                    <div className='col-6'>
                                        <h6 className='mt-3'>EPIC</h6>
                                        <Select style={{ width: '100%' }}
                                            options={renderEpics()}
                                            onChange={(value, props) => {
                                                //assign issue to new epic
                                                dispatch(updateInfoIssue(issueInfo?._id.toString(), issueInfo?.project_id.toString(), { epic_link: value }, issueInfo?.epic_link === null ? "None" : issueInfo?.epic_link.epic_name, props.label, userInfo.id, "updated", "epic link"))
                                                //update new issue in epic
                                                dispatch(updateEpic(value, { issue_id: issueInfo?._id.toString(), epic_id: issueInfo?.epic_link === null ? "null" : issueInfo?.epic_link._id.toString() }, issueInfo?.project_id.toString()))
                                            }}
                                            value={getCurrentEpic() !== null ? renderEpics()[getCurrentEpic()]?.value : "None"}
                                        />
                                    </div>
                                    <div className='col-6'>
                                        <h6 className='mt-3'>VERSION</h6>
                                        <Select style={{ width: '100%' }}
                                            defaultValue={issueInfo?.fix_version ? issueInfo?.fix_version?.version_name : "None"}
                                        />
                                    </div>
                                </div>
                                <div className='row story_point-component'>
                                    <div className='col-6'>
                                        <h6 className='mt-3'>STORY POINT</h6>
                                        <InputNumber min={0} max={1000} defaultValue={issueInfo?.story_point} value={issueInfo?.story_point} onBlur={(e) => {
                                            if (e.target.value >= 0 && e.target.value <= 1000) {
                                                dispatch(updateInfoIssue(issueInfo?._id.toString(), issueInfo?.project_id?.toString(), { story_point: e.target.value }, issueInfo?.story_point === null ? "None" : issueInfo?.story_point?.toString(), e.target.value, userInfo.id, "updated", "story point"))
                                            } else {
                                                showNotificationWithIcon('error', '', 'Error')
                                            }
                                        }} />
                                    </div>
                                    <div className='col-6'>
                                        <h6 className='mt-3'>COMPONENT</h6>
                                        <Select style={{ width: '100%' }}
                                            defaultValue={"None"}
                                        />
                                    </div>
                                </div>
                                <div className="priority" style={{ marginBottom: 20, marginTop: 10 }}>
                                    <h6>PRIORITY</h6>
                                    <Select
                                        style={{ width: '100%' }}
                                        placeholder={priorityTypeOptions[issueInfo?.issue_priority]?.label}
                                        defaultValue={priorityTypeOptions[issueInfo?.issue_priority]?.value}
                                        options={priorityTypeOptions}
                                        disabled={issueInfo?.creator._id !== userInfo?.id}
                                        onSelect={(value, option) => {
                                            const old_value = `${issueInfo.issue_priority}`
                                            const new_value = `${value}`
                                            dispatch(updateInfoIssue(issueInfo?._id, issueInfo?.project_id, { issue_priority: value }, old_value, new_value, userInfo.id, "updated", "priority"))
                                        }}
                                        name="priority"
                                    />
                                </div>
                                <div className="estimate mb-3">
                                    <h6>ORIGINAL ESTIMATE (HOURS)</h6>
                                    <input style={{ marginBottom: '3px' }} className="estimate-hours" onChange={(e) => {
                                        // //kiem tra gia tri co khac null khong, khac thi xoa
                                        // if (inputTimeOriginal.current) {
                                        //     clearTimeout(inputTimeOriginal.current)
                                        // }
                                        // inputTimeOriginal.current = setTimeout(() => {

                                        // }, 3000)
                                    }} disabled={issueInfo?.creator._id !== userInfo?.id}
                                        defaultValue={convertMinuteToFormat(issueInfo?.timeOriginalEstimate)}
                                        onBlur={(e) => {
                                            if (validateOriginalTime(e.target.value)) {
                                                const oldValue = calculateTimeAfterSplitted(issueInfo.timeOriginalEstimate ? issueInfo.timeOriginalEstimate : 0)
                                                const newValue = calculateTimeAfterSplitted(e.target.value)
                                                dispatch(updateInfoIssue(issueInfo?._id, projectInfo?._id, { timeOriginalEstimate: newValue }, oldValue, newValue, userInfo.id, "updated", "time original estimate"))
                                                showNotificationWithIcon('success', '', "Truong du lieu hop le")
                                            } else {
                                                showNotificationWithIcon('error', '', "Truong du lieu nhap vao khong hop le")
                                            }
                                        }}
                                    />
                                    <small>Format: <span className='text-danger'>2w3d4h5m</span></small>
                                </div>
                                <div className="time-tracking" style={{ cursor: 'pointer' }}>
                                    <h6>TIME TRACKING</h6>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <i className="fa fa-clock" />
                                        <div style={{ width: '100%' }}>
                                            <Progress onClick={() => {
                                                setIsModalOpen(true)
                                            }} percent={Math.floor(calculateProgress())} size="small" status="active" />
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span className="logged">{issueInfo?.timeSpent === 0 ? '0h' : convertMinuteToFormat(issueInfo?.timeSpent)} logged</span>
                                                <span className="estimate-time">
                                                    {issueInfo?.timeOriginalEstimate !== 0 && issueInfo?.timeSpent !== 0 ? (issueInfo?.timeOriginalEstimate - issueInfo?.timeSpent === 0 ? '0h' : convertMinuteToFormat(issueInfo?.timeOriginalEstimate - issueInfo?.timeSpent)) : '0h'} remaining
                                                </span>
                                            </div>

                                            <Modal title="Basic Modal" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
                                                <p>Original time estimate: {convertMinuteToFormat(issueInfo?.timeOriginalEstimate)}</p>
                                                <div className='d-flex'>
                                                    <div className='mr-2'>
                                                        <label htmlFor='timeSpent'>Time spent</label>
                                                        <Input name="timeSpent" onBlur={(e) => {
                                                            //tien hanh so sanh gia tri hien tai voi gia tri original
                                                            if (validateOriginalTime(e.target.value)) {
                                                                const timeOri = issueInfo.timeOriginalEstimate
                                                                const timeSpe = calculateTimeAfterSplitted(e.target.value + issueInfo.timeSpent)

                                                                if (compareTimeSpentWithTimeOriginal(e.target.value)) {
                                                                    const getTimeRemaining = timeOri - timeSpe

                                                                    setFormData({
                                                                        ...formData,
                                                                        timeSpent: timeSpe,
                                                                        timeRemaining: getTimeRemaining
                                                                    })
                                                                    showNotificationWithIcon('success', '', 'hop le nhe')
                                                                } else {
                                                                    showNotificationWithIcon('error', '', 'Time spent phai nho hon time original')
                                                                    setFormData({
                                                                        ...formData,
                                                                        timeSpent: 0,
                                                                        timeRemaining: 0
                                                                    })
                                                                }
                                                            } else {
                                                                showNotificationWithIcon('error', '', 'Gia tri nhap vao khong hop le')
                                                                setFormData({
                                                                    ...formData,
                                                                    timeSpent: 0,
                                                                    timeRemaining: 0
                                                                })
                                                            }
                                                        }} />
                                                    </div>
                                                    <div className='ml-2'>
                                                        <label htmlFor='timeRemaining'>Time remaining</label>
                                                        <Input name="timeRemaining" disabled value={formData.timeRemaining !== 0 ? convertMinuteToFormat(formData.timeRemaining) : 'None'} />
                                                    </div>

                                                </div>
                                                <div className='d-flex flex-column'>
                                                    <div className='description'>
                                                        <p>Use the format: 2w3d4h5m</p>
                                                        <ul>
                                                            <li>w = weeks</li>
                                                            <li>d = days</li>
                                                            <li>h = hours</li>
                                                            <li>m = minutes</li>
                                                        </ul>
                                                    </div>
                                                    <div className='starting-date d-flex flex-column'>
                                                        <label htmlFor='workingDate'>Date started<span className='text-danger'>*</span></label>
                                                        <DatePicker name='workingDate'
                                                            open={openDatePicker} style={{ width: '40%' }}
                                                            onClick={() => {
                                                                setOpenDatePicker(true)
                                                            }}
                                                            onOk={() => {
                                                                setOpenDatePicker(false)
                                                            }}
                                                            onChange={(date, dateString) => {
                                                                setFormData({
                                                                    ...formData,
                                                                    dateWorking: dateString
                                                                })

                                                            }} showTime />
                                                    </div>
                                                    <div className='description'>
                                                        <label htmlFor='workDescription'>Work description <span className='text-danger'>*</span></label>
                                                        <textarea name="workDescription" style={{ width: '100%', height: '100px' }} onChange={(e) => {
                                                            if (e.target.value.trim() !== "") {
                                                                setFormData({
                                                                    ...formData,
                                                                    description: e.target.value
                                                                })
                                                            } else {
                                                                showNotificationWithIcon('error', '', 'Truong * khong duoc bo trong')
                                                            }
                                                        }} />
                                                    </div>
                                                </div>
                                            </Modal>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ color: '#929398' }}>Create at {convertTime(issueInfo?.creatAt)}</div>
                                <div style={{ color: '#929398' }}>{issueInfo?.creatAt !== issueInfo?.updateAt ? `Update at ${convertTime(issueInfo?.updateAt)}` : ""}</div>
                            </div>
                        </div>
                    </div>}
                </div>
            </div>
        </div>
    )
}
