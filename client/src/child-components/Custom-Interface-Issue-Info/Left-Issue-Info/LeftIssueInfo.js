import { Avatar, Button, Input } from 'antd'
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { showNotificationWithIcon } from '../../../util/NotificationUtil'
import { getIssueHistoriesList, getWorklogHistoriesList } from '../../../redux/actions/IssueAction'
import { createCommentAction, deleteCommentAction, getCommentAction, updateCommentAction } from '../../../redux/actions/CommentAction'
import { iTagForIssueTypes, iTagForPriorities } from '../../../util/CommonFeatures'
import { convertMinuteToFormat, convertTime } from '../../../validations/TimeValidation'
import Summary from '../../Issue-Attributes/Summary/Summary'
import Description from '../../Issue-Attributes/Description/Description'
import TextArea from 'antd/es/input/TextArea'
import { NavLink } from 'react-router-dom'
import './LeftIssueInfo.css'
import Parser from 'html-react-parser'
export default function LeftIssueInfo(props) {

    const issueInfo = props.issueInfo
    const userInfo = props.userInfo
    const historyList = props.historyList
    const worklogList = props.worklogList
    const projectInfo = props.projectInfo
    const commentList = props.commentList
    const [type, setType] = useState(false)
    const dispatch = useDispatch()
    const [buttonActive, setButtonActive] = useState(1)

    //sử dụng cho phần bình luận
    //tham số isSubmit thì để khi bấm send thì mới thực hiện duyệt mảng comments
    const [comment, setComment] = useState({
        content: '',
        isSubmit: true,
    })
    const [editComment, setEditComment] = useState('')
    const [editContentComment, setEditContentComment] = useState('')
    const [commentSort, setCommentSort] = useState(false)
    const [historySort, setHistorySort] = useState(false)
    const renderComments = () => {
        let listComments = commentList?.map((value, index) => {
            return (<li className='comment d-flex' key={value._id}>
                <div className="avatar">
                    <Avatar src={value.creator.avatar} size={35} />
                </div>
                <div style={{ width: '100%' }}>
                    <p style={{ marginBottom: 5, fontWeight: 'bold' }}>
                        {value.creator.username} <NavLink onClick={() => {
                            setType(!type)
                        }} style={{ fontWeight: 'normal' }} className='ml-4 edit-comment-time'>{value?.isModified ? "Modified " : ''}{convertTime(value?.timeStamp, type)}</NavLink>
                    </p>
                    {editComment.trim() !== '' && editComment === value._id.toString() ? (
                        <div>
                            <TextArea value={editContentComment} defaultValue="" onChange={(e) => {
                                setEditContentComment(e.target.value)
                            }} autosize={{ minRows: 5, maxRows: 10 }} />
                            <div>
                                <Button onClick={() => {
                                    setEditComment('')
                                    //gửi lên sự kiện cập nhật comment
                                    dispatch(updateCommentAction({ commentId: value._id.toString(), content: editContentComment, issueId: issueInfo?._id.toString(), timeStamp: new Date() }))
                                }} type="primary" className='mt-2 mr-2'>Save</Button>
                                <Button onClick={() => {
                                    setEditComment('')
                                }} className='mt-2'>Cancel</Button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <p style={{ marginBottom: 5 }}>
                                {Parser(value.content)}
                            </p>
                            <div>
                                {
                                    value.creator._id === userInfo?.id && !value.content.includes('fa fa-flag mr-1 flag-icon-comment') ? (<div className="mb-2"><button className="btn bg-transparent p-0 mr-3" onClick={() => {
                                        setEditContentComment(value.content);
                                        setEditComment(value._id.toString());
                                    }} style={{ color: '#929398', fontWeight: 'bold', fontSize: 13, cursor: 'pointer' }}>Edit</button>
                                        <button className="btn bg-transparent p-0" onKeyDown={() => { }} onClick={() => {
                                            dispatch(deleteCommentAction({ commentId: value._id.toString(), issueId: issueInfo?._id.toString() }));
                                        }} style={{ color: '#929398', fontWeight: 'bold', fontSize: 13, cursor: 'pointer' }}>Delete</button></div>) :
                                        <div className='mt-3'>

                                        </div>
                                }
                            </div>
                        </div>
                    )}
                </div>
            </li>)
        });

        return listComments
    }

    function capitalizeFirstLetter(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    const renderTypeHistory = (name_status, old_status, new_status) => {
        if (name_status.toLowerCase() === "priority") {
            return <div>{iTagForPriorities(old_status, null, null)} <i className="fa-solid fa-arrow-right-long ml-3 mr-3"></i> {iTagForPriorities(new_status, null, null)}</div>
        } else if (name_status.toLowerCase() === "status") {
            return <div>{iTagForIssueTypes(old_status, null, null)} <i className="fa-solid fa-arrow-right-long ml-3 mr-3"></i>  {iTagForIssueTypes(new_status, null, null)}</div>
        } else if (name_status.toLowerCase() === "assignees") {
            const getAvatar = new_status?.indexOf("=")
            return <div><span style={{ fontWeight: 'bold' }}>Assignees</span> <i className="fa-solid fa-arrow-left-long ml-3 mr-3"></i>  <Avatar src={new_status} /> {new_status?.substring(getAvatar + 1)}</div>
        } else if (name_status.toLowerCase() === "time original estimate" || name_status.toLowerCase() === "time spent") {
            return <div>{convertMinuteToFormat(parseInt(old_status))} <i className="fa-solid fa-arrow-right-long ml-3 mr-3"></i> {convertMinuteToFormat(parseInt(new_status))}</div>
        } else if (name_status.toLowerCase() === "sprint" || name_status.toLowerCase().includes("epic") || name_status.toLowerCase().includes("version") || name_status.toLowerCase().includes("point") || name_status.toLowerCase().includes("type")) {
            return <div>{old_status} <i className="fa-solid fa-arrow-right-long ml-3 mr-3"></i> {new_status}</div>
        } else if (name_status.toLowerCase() === "sub issue") {
            return <div><span style={{ fontWeight: 'bold' }}>Sub issues</span> <i className="fa-solid fa-arrow-left-long ml-3 mr-3"></i> <span className='text-success'>{new_status}</span></div>
        }
    }
    const renderHistoriesList = () => {
        var isPermissions = false
        if (issueInfo?.permissions === true) {
            const getUserRoleIndex = projectInfo?.members?.findIndex(user => user.user_info._id === userInfo?.id)
            if (getUserRoleIndex !== -1) {  //user has admin role which can edit in this issue
                const userRole = projectInfo?.members[getUserRoleIndex].user_role
                if (userRole === 0 || userRole === 1) {
                    isPermissions = true
                } else {
                    isPermissions = false
                }
            }
        } else {
            isPermissions = true
        }

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
            {isPermissions ? customHistoriesList : <span className='text-danger'>You don't have enough permission to read this infomation</span>}
        </div>
    }

    const renderWorklogsList = () => {
        var isPermissions = false
        if (issueInfo?.permissions === true) {
            const getUserRoleIndex = projectInfo?.members?.findIndex(user => user.user_info._id === userInfo?.id)
            if (getUserRoleIndex !== -1) {  //user has admin role which can edit in this issue
                const userRole = projectInfo?.members[getUserRoleIndex].user_role
                if (userRole === 0 || userRole === 1) {
                    isPermissions = true
                } else {
                    isPermissions = false
                }
            }
        } else {
            isPermissions = true
        }
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
            {isPermissions ? customWorklogsList : <span className='text-danger'>You don't have enough permission to read this infomation</span>}
        </div>
    }

    const renderCommetList = () => {
        return <div>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'end' }}>
                {!commentSort ? <Button className='mb-2' onClick={() => {
                    setCommentSort(true)
                    dispatch(getCommentAction(issueInfo._id, 1))
                }}>Newest first <i className="fa fa-sort-alpha-down ml-2"></i></Button> :
                    <Button className='mb-2' onClick={() => {
                        setCommentSort(false)
                        dispatch(getCommentAction(issueInfo._id, -1))
                    }}>Oldest first <i className="fa fa-sort-alpha-up ml-2"></i></Button>
                }
            </div>

            {/* Kiểm tra xem nếu người đó thuộc về issue thì mới có thể đăng bình luận */}
            {
                issueInfo?.creator?._id === userInfo?.id || issueInfo?.assignees.findIndex(value => value._id === userInfo?.id) !== -1 ? (
                    <div className="block-comment" style={{ display: 'flex', flexDirection: 'column' }}>
                        <div className="input-comment d-flex">
                            <div className="avatar">
                                <Avatar src={userInfo?.avatar} size={35} />
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
                        <ul className="display-comment mt-2 p-0" style={{ display: 'flex', flexDirection: 'column', height: 400, overflow: 'overlay', scrollbarWidth: 'none' }}>
                            {renderComments()}
                        </ul>
                    </div>
                ) : <p className='text-danger'>Plese join in this issue to read comments</p>
            }
        </div>
    }

    const renderActivities = () => {
        if (buttonActive === 0) {

        } else if (buttonActive === 1) {
            return <div className="comment mt-3">
                {commentList && commentList?.length > 0 ? renderCommetList() : <span>No comments recently</span>}
            </div>
        } else if (buttonActive === 2) {
            return <div className="comment mt-3">
                {historyList && historyList?.length > 0 ? <div style={{ height: 420, overflowY: 'auto', scrollbarWidth: 'none' }}>
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'end' }}>
                        {!historySort ? <Button className='mb-2' onClick={() => {
                            setHistorySort(true)
                            dispatch(getIssueHistoriesList(issueInfo._id, 1))
                        }}>Newest first <i className="fa fa-sort-alpha-down ml-2"></i></Button> :
                            <Button className='mb-2' onClick={() => {
                                setHistorySort(false)
                                dispatch(getIssueHistoriesList(issueInfo._id, -1))
                            }}>Oldest first <i className="fa fa-sort-alpha-up ml-2"></i></Button>
                        }
                    </div>
                    {renderHistoriesList()}
                </div> : <span>No history recently</span>}
            </div>
        } else if (buttonActive === 3) {
            return <div className="comment mt-3">
                {worklogList && worklogList?.length > 0 ? renderWorklogsList() : <span>No worklogs recently</span>}
            </div>
        }
    }
    return (
        <div className="col-8"
            style={{ overflowY: 'auto', height: '90%', scrollbarWidth: 'none' }}>
            <div>
                <i style={{ fontSize: 20, marginRight: 10, backgroundColor: 'rgba(9, 30, 66, 0.04)', padding: '8px' }} className="fa-solid fa-paperclip icon-options"></i>
                <i onClick={() => {
                    props.hanleClickDisplayAddSubIssue(true)
                    props.hanleClickEditSummaryInSubIssue('')
                    // setShowAddSubIssue(true)
                    // setSubIssueSummary('')
                }} style={{ fontSize: 20, marginRight: 10, backgroundColor: 'rgba(9, 30, 66, 0.04)', padding: '8px' }} className="fa-solid fa-sitemap icon-options"></i>
            </div>
            <Summary issueInfo={issueInfo} userInfo={userInfo} />
            <Description issueInfo={issueInfo} userInfo={userInfo} />

            <div className='activities'>
                <h4>Activity</h4>
                <div>
                    <span>Show:</span>
                    <button className='btn btn-light ml-3 mr-2' onClick={() => { setButtonActive(0) }} style={{ padding: '0 10px', fontSize: '14px', fontWeight: '600', backgroundColor: buttonActive === 0 ? "#e9f2ff " : "#091e420f", color: buttonActive === 0 ? '#0c66e4' : "#44546f" }}>All</button>
                    <button className='btn btn-light mr-2' onClick={() => { setButtonActive(1) }} style={{ padding: '0 10px', fontSize: '14px', fontWeight: '600', backgroundColor: buttonActive === 1 ? "#e9f2ff " : "#091e420f", color: buttonActive === 1 ? '#0c66e4' : "#44546f" }}>Comments</button>
                    <button className='btn btn-light mr-2' onClick={() => { setButtonActive(2); dispatch(getIssueHistoriesList(issueInfo?._id.toString(), -1)) }} style={{ padding: '0 10px', fontSize: '14px', fontWeight: '600', backgroundColor: buttonActive === 2 ? "#e9f2ff " : "#091e420f", color: buttonActive === 2 ? '#0c66e4' : "#44546f" }}>History</button>
                    <button className='btn btn-light' onClick={() => { setButtonActive(3); dispatch(getWorklogHistoriesList(issueInfo?._id.toString())) }} style={{ padding: '0 10px', fontSize: '14px', fontWeight: '600', backgroundColor: buttonActive === 3 ? "#e9f2ff " : "#091e420f", color: buttonActive === 3 ? '#0c66e4' : "#44546f" }}>Work log</button>
                </div>
            </div>
            {renderActivities()}
        </div>
    )
}
