import { Avatar, Button, Input, InputNumber, Popconfirm, Select } from 'antd';
import React, { useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { Editor } from '@tinymce/tinymce-react';
import Parser from 'html-react-parser';
import { Option } from 'antd/es/mentions';
import { deleteAssignee, deleteIssue, updateInfoIssue } from '../../../redux/actions/IssueAction';
import { createCommentAction, deleteCommentAction, updateCommentAction } from '../../../redux/actions/CommentAction';
import { showNotificationWithIcon } from '../../../util/NotificationUtil';
import storeListComments from '../../../util/StoreListComment';
import { GetProjectAction } from '../../../redux/actions/ListProjectAction';
const { DateTime } = require('luxon');
const { TextArea } = Input;
export default function InfoModal() {
    const issueInfo = useSelector(state => state.issue.issueInfo)
    const projectInfo = useSelector(state => state.listProject.projectInfo)
    const userInfo = useSelector(state => state.user.userInfo)

    const [time, editTime] = useState(false)
    const [trackingTime, editTrackingTime] = useState({
        timeSpent: issueInfo?.timeSpent,
        timeRemaining: issueInfo?.timeRemaining
    })

    //sử dụng cho phần bình luận
    //tham số isSubmit thì để khi bấm send thì mới thực hiện duyệt mảng comments
    const [comment, setComment] = useState({
        content: '',
        isSubmit: true,
    })
    //su dung cho debounce time original
    const inputTimeOriginal = useRef(null)


    const issueStatus = [
        { label: 'BACKLOG', value: 0 },
        { label: 'SELECTED FOR DEVELOPMENT', value: 1 },
        { label: 'IN PROGRESS', value: 2 },
        { label: 'DONE', value: 3 }
    ]

    const [editDescription, setEditDescription] = useState(true)
    //tham số truyền vào sẽ là id của comment khi click vào chỉnh sửa
    const [editComment, setEditComment] = useState('')
    const [editContentComment, setEditContentComment] = useState('')

    const [addAssignee, setAddAssignee] = useState(true)
    const [description, setDescription] = useState('')
    const handlEditorChange = (content, editor) => {
        setDescription(content)
    }


    const dispatch = useDispatch()


    const convertTime = (commentTime) => {
        const diff = DateTime.now().diff(DateTime.fromISO(commentTime), ['minutes', 'hours', 'days', 'months']).toObject();

        if (diff.hours >= 1) {
            return `${Math.round(diff.hours)} hour ago`
        } else if (diff.minutes >= 1) {
            return `${Math.round(diff.minutes)} minutes ago`
        } if (diff.days >= 1) {
            return `${Math.round(diff.days)} days ago`
        } if (diff.months >= 1) {
            return `${Math.round(diff.months)} months ago`
        } else {
            return 'a few second ago'
        }
    }

    const renderComments = () => {
        let listComments = issueInfo?.comments.map((value, index) => {
            return (<li className='comment d-flex' key={index}>
                <div className="avatar">
                    <Avatar src={value.creator.avatar} size={40} />
                </div>
                <div style={{ width: '100%' }}>
                    <p style={{ marginBottom: 5, fontWeight: 'bold' }}>
                        {value.creator.username} <span style={{ fontWeight: 'normal' }} className='ml-4'>{value?.isModified ? "Modified " : ''}{convertTime(value?.timeStamp)}</span>
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
                                {value.content}
                            </p>
                            {
                                value.creator._id === userInfo.id ? (<div className='mb-2'><span onClick={() => {
                                    setEditContentComment(value.content);
                                    setEditComment(value._id.toString());
                                }} style={{ color: '#929398', fontWeight: 'bold', cursor: 'pointer' }} className='mr-3'>Edit</span><span onClick={() => {
                                    dispatch(deleteCommentAction({ commentId: value._id.toString(), issueId: issueInfo?._id.toString() }));
                                }} style={{ color: '#929398', fontWeight: 'bold', cursor: 'pointer' }}>Delete</span></div>) : <div className='mt-3'></div>

                            }
                        </div>
                    )}
                </div>
            </li>)
        });

        if (comment.isSubmit) {
            storeListComments.setComments(listComments)
        }

        return storeListComments.getComments()
    }


    const renderIssueStatus = (pos) => {
        return issueStatus.map((status) => {
            if (pos === status.value) {
                return <option key={status.value} selected value={status.value}>{status.label}</option>
            }
            return <option key={status.value} value={status.value}>{status.label}</option>
        })
    }
    const iTagForIssueTypes = (type) => {
        //0 la story
        if (type === 0) {
            return <i className="fa-solid fa-bookmark mr-2" style={{ color: '#65ba43', fontSize: '20px' }} ></i>
        }
        //1 la task
        if (type === 1) {
            return <i className="fa-solid fa-square-check mr-2" style={{ color: '#4fade6', fontSize: '20px' }} ></i>
        }
        //2 la bug
        if (type === 2) {
            return <i className="fa-solid fa-circle-exclamation mr-2" style={{ color: '#cd1317', fontSize: '20px' }} ></i>
        }
    }

    const renderOptionAssignee = () => {
        return projectInfo?.members?.filter((value, index) => {
            const isExisted = issueInfo?.assignees?.findIndex((user) => {
                return user._id === value._id
            })
            if (isExisted !== -1) {
                return false
            }
            if (issueInfo?.creator._id === value._id) {
                return false
            }
            return true
        }).map((value, index) => {
            return <Option value={value._id}>{value.username}</Option>
        })
    }

    const iTagForPriorities = (priority) => {
        if (priority === 0) {
            return <i className="fa-solid fa-arrow-up" style={{ color: '#cd1317', fontSize: '20px' }} />
        }
        if (priority === 1) {
            return <i className="fa-solid fa-arrow-up" style={{ color: '#e9494a', fontSize: '20px' }} />
        }
        if (priority === 2) {
            return <i className="fa-solid fa-arrow-up" style={{ color: '#e97f33', fontSize: '20px' }} />
        }
        if (priority === 3) {
            return <i className="fa-solid fa-arrow-down" style={{ color: '#2d8738', fontSize: '20px' }} />
        }
        if (priority === 4) {
            return <i className="fa-solid fa-arrow-down" style={{ color: '#57a55a', fontSize: '20px' }} />
        }
    }
    const priorityTypeOptions = [
        { label: <>{iTagForPriorities(0)} Highest</>, value: 0 },
        { label: <>{iTagForPriorities(1)} High</>, value: 1 },
        { label: <>{iTagForPriorities(2)} Medium</>, value: 2 },
        { label: <>{iTagForPriorities(3)} Low</>, value: 3 },
        { label: <>{iTagForPriorities(4)} Lowest</>, value: 4 }
    ]
    const issueTypeOptions = [
        { label: <>{iTagForIssueTypes(0)} Story</>, value: 0 },
        { label: <>{iTagForIssueTypes(1)} Task</>, value: 1 },
        { label: <>{iTagForIssueTypes(2)} Bug</>, value: 2 }
    ]


    return <div className="modal fade" id="infoModal" tabIndex={-1} role="dialog" aria-labelledby="infoModal" aria-hidden="true">
        <div className="modal-dialog modal-info">
            <div className="modal-content">
                <div className="modal-header align-items-center">
                    <div className="task-title">
                        <Select
                            placeholder={issueTypeOptions[issueInfo?.issueType]?.label}
                            defaultValue={issueTypeOptions[issueInfo?.issueType]?.value}
                            style={{ width: '100%' }}
                            options={issueTypeOptions}
                            disabled={issueInfo?.creator._id !== userInfo.id}
                            onSelect={(value, option) => {
                                dispatch(updateInfoIssue(issueInfo?._id, issueInfo?.projectId, { issueType: value }))
                            }}
                            name="issueType"
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }} className="task-click">
                        {
                            issueInfo?.creator._id.toString() === userInfo.id ? (
                                <div>
                                    <Popconfirm placement="topLeft"
                                        title="Delete this issue?"
                                        description="Are you sure to delete this issue from project?"
                                        onConfirm={async () => {
                                            //dispatch su kien xoa nguoi dung khoi du an
                                            await dispatch(deleteIssue(issueInfo?._id))

                                            //dispatch lại sự kiện load lại project
                                            dispatch(GetProjectAction(issueInfo?.projectId, ""))
                                        }} okText="Yes" cancelText="No">
                                        <i className="fa fa-trash-alt" style={{ cursor: 'pointer' }} />
                                    </Popconfirm>
                                </div>
                            ) : <></>
                        }
                        <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">×</span>
                        </button>
                    </div>
                </div>
                <div className="modal-body">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-8">
                                <p className="issue" style={{ fontSize: '24px', fontWeight: 'bold' }}>{issueInfo?.shortSummary}</p>
                                <div className="description">
                                    <p style={{ fontWeight: 'bold', fontSize: '15px' }}>Description</p>
                                    {editDescription ? (<p onDoubleClick={() => {
                                        if (issueInfo?.creator._id === userInfo.id) {
                                            setEditDescription(false)
                                        }
                                    }}>
                                        {issueInfo?.description.trim() !== '' ? Parser(`${issueInfo?.description}`) : issueInfo?.creator._id === userInfo.id ? <p style={{ color: 'blue' }}>Add Your Description</p> : <p>There is no description yet</p>}
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
                                                    dispatch(updateInfoIssue(issueInfo?._id, issueInfo?.projectId, { description }))
                                                }} type="primary" className='mr-2'>Save</Button>
                                                <Button onClick={() => {
                                                    setEditDescription(true)
                                                }}>Cancel</Button>
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className="comment">
                                    <h6>Comment</h6>

                                    {/* Kiểm tra xem nếu người đó thuộc về issue thì mới có thể đăng bình luận */}
                                    {issueInfo?.creator._id === userInfo.id || issueInfo?.assignees.findIndex(value => value._id === userInfo.id) !== -1 ? (
                                        <>
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
                                                    {renderComments()}
                                                </ul>
                                            </div>
                                        </>
                                    ) : <p className='text-danger'>Plese join in this issue to read comments</p>}

                                </div>
                            </div>
                            <div className="col-4">
                                <div className="status">
                                    <h6>STATUS</h6>
                                    <select className="custom-select" disabled={issueInfo?.creator._id !== userInfo.id} onChange={(event) => {
                                        dispatch(updateInfoIssue(issueInfo?._id, issueInfo?.projectId, { issueStatus: event.target.value }))
                                    }}>
                                        {renderIssueStatus(issueInfo?.issueStatus)}
                                    </select>
                                </div>
                                <div className="assignees">
                                    <h6>ASSIGNEES</h6>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)' }}>
                                        {issueInfo?.assignees?.map((value, index) => {
                                            return <div style={{ display: 'flex', alignItems: 'center', marginRight: '5px' }} className="item mt-2">
                                                <div className="avatar">
                                                    <Avatar src={value.avatar} />
                                                </div>
                                                <p className="name d-flex align-items-center ml-1" style={{ fontWeight: 'bold' }}>
                                                    {value.username}
                                                    {issueInfo?.creator._id === userInfo.id ? (
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
                                            issueInfo?.creator._id === userInfo.id ? (
                                                <div style={{ display: 'flex', alignItems: 'center', width: '100px' }}>

                                                    <span onClick={() => {
                                                        setAddAssignee(false)
                                                    }} className='text-primary mt-2 mb-2' style={{ fontSize: '12px', margin: '0px', cursor: 'pointer' }}>
                                                        <i className="fa fa-plus" style={{ marginRight: 5 }} />Add more
                                                    </span>
                                                </div>
                                            ) : <></>
                                        }

                                    </div>
                                    {!addAssignee ? (
                                        <div>
                                            <Select
                                                style={{ width: '200px' }}
                                                placeholder="Select a person"
                                                optionFilterProp="children"
                                                disabled={issueInfo?.creator._id !== userInfo.id}
                                                onSelect={(value, option) => {
                                                    setAddAssignee(true)
                                                    dispatch(updateInfoIssue(issueInfo?._id, issueInfo?.projectId, { assignees: value }))
                                                }}
                                                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                            >
                                                {renderOptionAssignee()}
                                            </Select>
                                        </div>
                                    ) : <></>}
                                </div>
                                <div className="reporter">
                                    <h6 className='mt-3'>CREATOR</h6>
                                    <div style={{ display: 'flex' }} className="item">
                                        <div className="avatar">
                                            <Avatar src={issueInfo?.creator.avatar} />
                                        </div>
                                        <p className="name d-flex align-items-center ml-    1" style={{ fontWeight: 'bold' }}>
                                            {issueInfo?.creator.username}
                                        </p>
                                    </div>
                                </div>
                                <div className="priority" style={{ marginBottom: 20 }}>
                                    <h6>PRIORITY</h6>
                                    <Select
                                        style={{ width: '100%' }}
                                        placeholder={priorityTypeOptions[issueInfo?.priority]?.label}
                                        defaultValue={priorityTypeOptions[issueInfo?.priority]?.value}
                                        options={priorityTypeOptions}
                                        disabled={issueInfo?.creator._id !== userInfo.id}
                                        onSelect={(value, option) => {
                                            dispatch(updateInfoIssue(issueInfo?._id, issueInfo?.projectId, { priority: value }))
                                        }}
                                        name="priority"
                                    />
                                </div>
                                <div className="estimate">
                                    <h6>ORIGINAL ESTIMATE (HOURS)</h6>
                                    <input type="number" className="estimate-hours" onChange={(e) => {
                                        //kiem tra gia tri co khac null khong, khac thi xoa
                                        if (inputTimeOriginal.current) {
                                            clearTimeout(inputTimeOriginal.current)
                                        }
                                        inputTimeOriginal.current = setTimeout(() => {
                                            dispatch(updateInfoIssue(issueInfo?._id, projectInfo?._id, {timeOriginalEstimate: e.target.value}))
                                        }, 500)
                                    }} disabled={issueInfo?.creator._id !== userInfo.id} defaultValue="" value={issueInfo?.timeOriginalEstimate} />
                                </div>
                                <div className="time-tracking">
                                    <h6>TIME TRACKING</h6>
                                    <div style={{ display: 'flex' }}>
                                        <i className="fa fa-clock" />
                                        <div style={{ width: '100%' }}>
                                            <div className="progress">
                                                <div className="progress-bar" role="progressbar" style={{ width: (issueInfo?.timeSpent / (issueInfo?.timeSpent + issueInfo?.timeRemaining)) * 100 + '%' }} onDoubleClick={() => {
                                                    editTime(true)
                                                }} />
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <p className="logged">{issueInfo?.timeSpent}h logged</p>
                                                <p className="estimate-time">{issueInfo?.timeRemaining}h estimated</p>
                                            </div>

                                            {issueInfo?.creator._id === userInfo.id && time ? (
                                                <div>
                                                    <div className='row'>
                                                        <div className='col-6 p-0'>
                                                            <label>Time spent</label>
                                                            <InputNumber value={issueInfo?.timeSpent} name="timeSpent" min={0} onChange={(value) => {
                                                                editTrackingTime({
                                                                    timeSpent: value,
                                                                    ...trackingTime
                                                                })
                                                            }} />
                                                        </div>
                                                        <div className='col-6 p-0 text-center'>
                                                            <label>Time remaining</label>
                                                            <InputNumber value={issueInfo?.timeRemaining} min={0} defaultValue={0} name="timeRemaining" onChange={(value) => {
                                                                editTrackingTime({
                                                                    timeRemaining: value,
                                                                    ...trackingTime
                                                                })
                                                            }} />
                                                        </div>

                                                        <div className='col-12 mt-3 p-0'>
                                                            <Button type='primary mr-2' onClick={() => {
                                                                dispatch(updateInfoIssue(issueInfo?._id, issueInfo?.projectId, { timeSpent: trackingTime.timeSpent, timeRemaining: trackingTime.timeRemaining }))
                                                                editTime(false)
                                                            }}>Save</Button>
                                                            <Button type='default' onClick={() => {
                                                                editTime(false)
                                                            }}>Cancel</Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : <></>}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ color: '#929398' }}>Create at {convertTime(issueInfo?.creatAt)}</div>
                                <div style={{ color: '#929398' }}>{issueInfo?.creatAt !== issueInfo?.updateAt ? `Update at ${convertTime(issueInfo?.updateAt)}` : ""}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div >
}
