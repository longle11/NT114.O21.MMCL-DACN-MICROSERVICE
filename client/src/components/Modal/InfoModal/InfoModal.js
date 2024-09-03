import { Avatar, Button, DatePicker, Divider, Input, InputNumber, Modal, Popconfirm, Progress, Select, Tag } from 'antd';
import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { Editor } from '@tinymce/tinymce-react';
import Parser from 'html-react-parser';
import { createWorklogHistory, deleteAssignee, deleteIssue, getIssueHistoriesList, getWorklogHistoriesList, updateInfoIssue } from '../../../redux/actions/IssueAction';
import { createCommentAction } from '../../../redux/actions/CommentAction';
import { showNotificationWithIcon } from '../../../util/NotificationUtil';
import { GetProjectAction, GetWorkflowListAction } from '../../../redux/actions/ListProjectAction';
import { priorityTypeOptions, issueTypeOptions, iTagForPriorities, iTagForIssueTypes, renderSprintList, renderEpicList, renderVersionList } from '../../../util/CommonFeatures';
import { getEpicList, getVersionList, updateEpic } from '../../../redux/actions/CategoryAction';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { UserOutlined } from '@ant-design/icons'
import './InfoModal.css'
import { updateUserInfo } from '../../../redux/actions/UserAction';
import { calculateTimeAfterSplitted, convertMinuteToFormat, validateOriginalTime } from '../../../validations/TimeValidation';
const { DateTime } = require('luxon');


export default function InfoModal() {
    const { id } = useParams()
    const issueInfo = useSelector(state => state.issue.issueInfo)
    const sprintList = useSelector(state => state.listProject.sprintList)
    const projectInfo = useSelector(state => state.listProject.projectInfo)
    const processList = useSelector(state => state.listProject.processList)
    const workflowList = useSelector(state => state.listProject.workflowList)
    const userInfo = useSelector(state => state.user.userInfo)
    const historyList = useSelector(state => state.issue.historyList)
    const worklogList = useSelector(state => state.issue.worklogList)
    const epicList = useSelector(state => state.categories.epicList)
    const versionList = useSelector(state => state.categories.versionList)

    const [editAttributeTag, setEditAttributeTag] = useState('')

    const [timeTable, setTimeTable] = useState(false)
    const [openDatePicker, setOpenDatePicker] = useState(false)
    const [buttonActive, setButtonActive] = useState(1)
    const [editDescription, setEditDescription] = useState(true)
    //tham số truyền vào sẽ là id của comment khi click vào chỉnh sửa
    const [addAssignee, setAddAssignee] = useState(true)
    const [description, setDescription] = useState('')
    const [summary, setSummary] = useState('')
    //sử dụng cho phần bình luận
    //tham số isSubmit thì để khi bấm send thì mới thực hiện duyệt mảng comments
    const [comment, setComment] = useState({
        content: '',
        isSubmit: true,
    })

    const [chooseExistingSubIssue, setChooseExistingSubIssue] = useState(false)
    const [formData, setFormData] = useState({
        timeSpent: 0,
        dateWorking: '',
        description: '',
        timeRemaining: 0
    })
    useEffect(() => {
        setComment({
            content: '',
            isSubmit: true,
        })
        setEditAttributeTag('')
        setAddAssignee(true)
        setDescription('')
        setButtonActive(1)
        setEditDescription(true)
        setOpenDatePicker(false)
        setTimeTable(false)
        setFormData({
            timeSpent: 0,
            dateWorking: '',
            description: '',
            timeRemaining: 0
        })
        dispatch(GetWorkflowListAction(id))
        dispatch(getVersionList(id))
        dispatch(getEpicList(id))
    }, [issueInfo])
    const navigate = useNavigate()
    //su dung cho debounce time original
    const inputTimeOriginal = useRef(null)

    const dispatch = useDispatch()

    //su dung de render option theo workflow chi dinh
    const typeOptionsFollowWorkflow = (current_type) => {

        const getWorkflowsActive = workflowList.filter(workflow => workflow.isActivated)
        if (getWorkflowsActive.length !== 0) {
            const getIndex = getWorkflowsActive.findIndex(workflow => workflow.issue_statuses.includes(issueInfo?.issue_status))
            if (getIndex !== -1) {
                const getCurrentWorkflow = getWorkflowsActive[getIndex]
                const getEdges = getCurrentWorkflow.edges
                const data = getEdges.filter(edge => {
                    if (current_type === edge.source) {
                        return true
                    }
                    return false
                })
                const newdata = data?.filter(option => processList.map(process => process._id).includes(option.target)).map(option => {
                    const getNameNodeIndex = getCurrentWorkflow.nodes.findIndex(node => node.id === option.target)
                    if (getCurrentWorkflow.nodes[getNameNodeIndex]?.data) {
                        return {
                            label: <span>{option?.label} <i className="fa fa-long-arrow-alt-right ml-3 mr-3"></i><span style={{ fontWeight: "bold" }}>{getCurrentWorkflow.nodes[getNameNodeIndex]?.data?.label}</span></span>,
                            value: option.target
                        }
                    }
                })
                return newdata
            }
        }
        return processList?.filter(process => process._id !== current_type).map(process => {
            return {
                label: <span>{process.name_process}</span>,
                value: process._id.toString()
            }
        })
    }


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
                return user._id === value.user_info._id
            })
            return !(issueInfo?.creator._id === value.user_info._id || isExisted !== -1)
        }).map((valueIssue, index) => {
            return {
                label: <span><span style={{ fontWeight: 'bold' }}>{valueIssue.user_info.username}</span> ({valueIssue.user_info.email})</span>,
                value: valueIssue.user_info._id
            }
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
        if (issueInfo?.description !== null && issueInfo?.description.trim() !== '') {
            return Parser(`${issueInfo?.description}`)
        }

        if (issueInfo?.creator._id === userInfo?.id) {
            return <p style={{ color: 'blue' }}>Add Your Description</p>
        }
        return <p>There is no description yet</p>
    }





    const compareTimeSpentWithTimeOriginal = (timeSpent) => {
        return issueInfo.timeOriginalEstimate >= calculateTimeAfterSplitted(timeSpent)
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
                <span>Comment</span>

                {/* Kiểm tra xem nếu người đó thuộc về issue thì mới có thể đăng bình luận */}
                {issueInfo?.creator?._id === userInfo?.id || issueInfo?.assignees.findIndex(value => value._id === userInfo?.id) !== -1 ? (
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
                        <ul className="display-comment mt-2 p-0" style={{ display: 'flex', flexDirection: 'column', height: 400, overflow: 'overlay', scrollbarWidth: 'none' }}>
                            {/* {renderComments()} */}
                        </ul>
                    </div>
                ) : <p className='text-danger'>Plese join in this issue to read comments</p>}

            </div>
        } else if (buttonActive === 2) {
            return <div className="comment mt-3">
                <span>History</span>
                <div style={{ height: 420, overflowY: 'auto', scrollbarWidth: 'none' }}>
                    {renderHistoriesList()}
                </div>
            </div>
        } else if (buttonActive === 3) {
            return <div className="comment mt-3">
                <span>Work log</span>
                {renderWorklogsList()}
            </div>
        }
    }


    return <div role="dialog" className="modal fade" id="infoModal" tabIndex={-1} aria-labelledby="infoModal" aria-hidden="true" style={{ overflowY: 'hidden' }}>
        <div className="modal-dialog modal-info">
            <div className="modal-content">
                <div className="modal-header align-items-center">
                    <div className="task-title d-flex align-items-center" style={{ width: 'max-content' }}>
                        <NavLink style={{ width: '100%', marginRight: 10 }}>WD-{issueInfo?.ordinal_number}</NavLink>
                        {editAttributeTag === "issue_status" ? <Select
                            placeholder={issueTypeOptions[issueInfo?.issue_status]?.label}
                            defaultValue={issueTypeOptions[issueInfo?.issue_status]?.value}
                            style={{ width: '100%' }}
                            options={issueTypeOptions}
                            disabled={issueInfo?.creator?._id !== userInfo?.id}
                            onBlur={() => {
                                setEditAttributeTag('')
                            }}
                            onKeyDown={(e) => {
                                if (e.key.toLowerCase() === "enter") {
                                    setEditAttributeTag('')
                                }
                            }}
                            onSelect={(value, option) => {
                                dispatch(updateInfoIssue(issueInfo?._id, issueInfo?.project_id.toString(), { issue_status: value }, `${issueInfo.issue_status}`, `${value}`, userInfo.id, 'updated', 'status'))
                            }}
                            name="issue_status"
                        /> : <span onDoubleClick={() => {
                            setEditAttributeTag('issue_status')
                        }} className='items-attribute m-0' style={{ padding: '10px 5px 5px 10px', width: 'max-content' }}>{iTagForIssueTypes(issueInfo?.issue_status, null, null)}</span>}
                        <div className="status">
                            <div className='d-flex flex-column'>
                                {editAttributeTag === 'issue_type' ? <Select
                                    options={typeOptionsFollowWorkflow(issueInfo?.issue_type?._id.toString())}
                                    style={{ width: '100%', marginTop: 5 }}
                                    disabled={issueInfo?.creator._id !== userInfo?.id}
                                    onChange={(value, props) => {
                                        dispatch(updateInfoIssue(issueInfo?._id, issueInfo?.project_id, { issue_type: value }, issueInfo?.issue_type.name_process, props.label, userInfo.id, "updated", "issue type"))
                                    }}
                                    onBlur={() => {
                                        setEditAttributeTag('')
                                    }}
                                    dropdownRender={(menu) => (
                                        <>
                                            {menu}
                                            <Divider
                                                style={{
                                                    margin: '8px 0',
                                                }}
                                            />
                                            <div className='view-workflow' style={{ padding: '10px 20px', marginTop: 5, width: '100%' }}>
                                                <span style={{ textDecoration: 'none', color: 'black' }} onClick={() => {
                                                    navigate(`/projectDetail/${id}/workflows`)
                                                    window.location.reload()
                                                }}>View your workflow</span>
                                            </div>
                                        </>
                                    )}
                                    value={issueInfo?.issue_type?.name_process}
                                /> : <div className='d-flex align-items-center'>
                                    <Tag className='mr-3' style={{ borderRadius: 0 }} onDoubleClick={() => {
                                        setEditAttributeTag('issue_type')
                                    }} color={issueInfo?.issue_type?.tag_color}>{issueInfo?.issue_type?.name_process}</Tag>
                                    {issueInfo?.issue_type?._id === processList[processList?.length - 1]?._id ? <span className='d-flex align-items-center align-items-center font-weight-bold'><i className="fa fa-check text-success font-weight-bold mr-2"></i> Done</span> : <></>}
                                </div>}
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }} className="task-click">
                        <div>
                            <i style={{ fontSize: 20, marginRight: 15 }} className="fa fa-unlock"></i>
                            <i style={{ fontSize: 20, marginRight: 15 }} className="fa fa-lock"></i>
                            <i style={{ fontSize: 20, marginRight: 15 }} className="fa fa-thumbs-up"></i>
                            <i style={{ fontSize: 20, marginRight: 15 }} className="fa fa-share-alt"></i>
                            <i style={{ fontSize: 20, marginRight: 15 }} className="fa-solid fa-link"></i>
                            <i style={{ fontSize: 20, marginRight: 15 }} className="fa fa-ellipsis-h"></i>
                        </div>
                        {
                            issueInfo?.creator?._id.toString() === userInfo?.id ? (
                                <div>
                                    <Popconfirm placement="topLeft"
                                        title="Delete this issue?"
                                        description="Are you sure to delete this issue from project?"
                                        onConfirm={() => {
                                            //dispatch su kien xoa nguoi dung khoi du an
                                            dispatch(deleteIssue(issueInfo?._id))

                                            //dispatch lại sự kiện load lại project
                                            dispatch(GetProjectAction(issueInfo?.project_id, ""))
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
                <div className="modal-body p-0">
                    <div className="container-fluid">
                        <div className="row" style={{ height: 630 }}>
                            <div className="col-8" style={{ overflowY: 'auto', height: '90%', scrollbarWidth: 'none' }}>
                                <div>
                                    <i style={{ fontSize: 20, marginRight: 10, backgroundColor: 'rgba(9, 30, 66, 0.04)', padding: '8px' }} className="fa-solid fa-paperclip icon-options"></i>
                                    <i style={{ fontSize: 20, marginRight: 10, backgroundColor: 'rgba(9, 30, 66, 0.04)', padding: '8px' }} className="fa-solid fa-sitemap icon-options"></i>
                                </div>
                                {editAttributeTag === 'summary' ? <Input onChange={(e) => {
                                    setSummary(e.target.value)
                                }}
                                    className="issue_summary"
                                    onKeyDown={(e) => {
                                        if (e.key.toLowerCase() === 'enter') {
                                            if (summary.trim() === "") {
                                                showNotificationWithIcon('error', '', "Summary can't be left blank")
                                            } else {
                                                dispatch(updateInfoIssue(issueInfo?._id, issueInfo.project_id, { summary: summary }, null, null, userInfo.id, "updated", "summary"))
                                                setEditAttributeTag('')
                                            }
                                        }
                                    }}
                                    onBlur={() => {
                                        if (summary.trim() === "") {
                                            showNotificationWithIcon('error', '', "Summary can't be left blank")
                                        } else {
                                            dispatch(updateInfoIssue(issueInfo?._id, issueInfo.project_id, { summary: summary }, null, null, userInfo.id, "updated", "summary"))
                                            setEditAttributeTag('')
                                        }
                                    }}
                                    defaultValue={issueInfo?.summary} /> :
                                    <span onDoubleClick={() => {
                                        setEditAttributeTag('summary')
                                        setSummary(issueInfo?.summary)
                                    }} className='items-attribute m-0' style={{ padding: '10px 20px 10px 5px', width: '100%', display: 'block', fontSize: '24px', fontWeight: 'bold' }}>{issueInfo?.summary}</span>}
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
                                    <h4>Activity</h4>
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
                            <div className="col-4 p-0" style={{ height: 600, overflowY: 'auto', scrollbarWidth: 'none' }}>
                                <div>
                                    <div>
                                        <div className='d-flex justify-content-between align-items-center'>
                                            <h5 className='p-0 m-0' style={{ color: '#42526e' }}>Child issues</h5>
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
                                                <i className="fa-solid fa-plus"></i>
                                            </div>
                                        </div>
                                        <div className='d-flex'>
                                            <Progress
                                                percent={50}
                                                percentPosition={{
                                                    align: 'center',
                                                    type: 'inner',
                                                }}
                                                size={['95%', 7]}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ marginTop: 10 }}>
                                            <div className='d-flex justify-content-between align-items-center' style={{ padding: '5px 3px', border: '1px solid #dddd' }}>
                                                <div className='d-flex align-items-center'>
                                                    <span className='mr-1'>{iTagForIssueTypes(4, null, 13)}</span>
                                                    <NavLink style={{ fontSize: 12 }} className='mr-1'>WD-12</NavLink>
                                                    <span style={{ fontSize: 12 }} className='mr-1'>Day al noi d....</span>
                                                </div>
                                                <div className='d-flex align-items-center'>
                                                    <span className='mr-1'>{iTagForPriorities(2, null, 13)}</span>
                                                    <Avatar className='mr-1' size={'small'}><span className='d-flex'>-</span></Avatar>
                                                    <Avatar className='mr-1' size={'small'} icon={<UserOutlined />} />
                                                    <Tag className='mr-1' color='blue'>abcd</Tag>
                                                </div>
                                            </div>
                                            <div className='d-flex justify-content-between align-items-center' style={{ padding: '5px 3px', border: '1px solid #dddd' }}>
                                                <div className='d-flex align-items-center'>
                                                    <span className='mr-1'>{iTagForIssueTypes(4, null, 13)}</span>
                                                    <NavLink style={{ fontSize: 12 }} className='mr-1'>WD-12</NavLink>
                                                    <span style={{ fontSize: 12 }} className='mr-1'>Day al noi d....</span>
                                                </div>
                                                <div className='d-flex align-items-center'>
                                                    <span className='mr-1'>{iTagForPriorities(2, null, 13)}</span>
                                                    <Avatar className='mr-1' size={'small'}><span className='d-flex'>-</span></Avatar>
                                                    <Avatar className='mr-1' size={'small'} icon={<UserOutlined />} />
                                                    <Tag className='mr-1' color='blue'>abcd</Tag>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='mt-2'>
                                        <div className='d-flex align-items-center justify-content-between mt-1'>
                                            {chooseExistingSubIssue === false ? <div className='d-flex flex-column'>
                                                <div className='d-flex add-sub-isses'>
                                                    <Select style={{ border: 0, borderRadius: 0, backgroundColor: '#dddd' }} className='infomodal-edit-select-ant' defaultValue={issueTypeOptions[4]} disabled />
                                                    <Input style={{ border: '1px solid #7A869A', borderRadius: 0, backgroundColor: 'transparent' }} className='infomodal-edit-input-ant' placeholder='What needs to be done?' />
                                                </div>
                                                <div className='d-flex mt-2 align-items-center'>
                                                    <NavLink onClick={() => {
                                                        setChooseExistingSubIssue(true)
                                                    }} style={{ fontSize: 12 }}><i className="fa-solid fa-magnifying-glass mr-2" style={{ fontSize: 16 }}></i> Choose an existing issue</NavLink>
                                                    <div className='d-flex'>
                                                        <Button className='mr-1' type='primary' style={{ borderRadius: 0 }}>Create</Button>
                                                        <Button style={{ borderRadius: 0 }}>Cancel</Button>
                                                    </div>
                                                </div>


                                            </div> : <div className='d-flex flex-column' style={{ width: '100%' }}>
                                                <Select className='infomodal-edit-select-ant-add-issue' style={{ width: '100%', height: 35 }} />
                                                <div className='d-flex justify-content-end mt-2'>
                                                    <Button className='mr-1' onClick={() => {
                                                        setChooseExistingSubIssue(false)
                                                    }} type='primary' style={{ borderRadius: 0 }}>Add</Button>
                                                    <Button onClick={() => {
                                                        setChooseExistingSubIssue(false)
                                                    }} style={{ borderRadius: 0 }}>Cancel</Button>
                                                </div>
                                            </div>}
                                        </div>
                                    </div>
                                </div>
                                <div className="assignees mt-3">
                                    <span style={{ color: '#42526e', fontWeight: '500' }}>Assignees</span>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)' }}>
                                        {issueInfo?.assignees?.length > 0 ? renderAssignees() : <span style={{ backgroundColor: '#e9eaf0', padding: '5px 10px', borderRadius: 5, width: 'fit-content', fontSize: 12 }} className='d-flex align-items-center font-weight-bold'><Avatar icon={<UserOutlined />} size='small' className='mr-2' /> Unassignee</span>}
                                        {
                                            issueInfo?.creator._id === userInfo?.id ? (
                                                <div style={{ width: '100%', marginTop: 5 }}>
                                                    <button onKeyDown={() => { }} className='text-primary mt-2 mb-2 btn bg-transparent ml-2' style={{ width: 'max-content', fontSize: '12px', margin: '0px', cursor: 'pointer', display: addAssignee === false ? 'none' : 'block', padding: 0, textAlign: 'left' }} onClick={() => {
                                                        setAddAssignee(false)
                                                    }} >
                                                        <i className="fa fa-plus" style={{ marginRight: 5 }} />Add more
                                                    </button>
                                                </div>

                                            ) : <></>
                                        }

                                    </div>
                                    {!addAssignee ? (
                                        <div>
                                            <Select
                                                onBlur={() => {
                                                    setAddAssignee(true)
                                                }}
                                                style={{ width: '200px', marginTop: 10 }}
                                                placeholder="Select a person"
                                                disabled={issueInfo?.creator._id !== userInfo?.id}
                                                onSelect={(value, option) => {
                                                    setAddAssignee(true)
                                                    const getUserIndex = projectInfo?.members.findIndex(user => user.user_info._id.toString() === value)
                                                    if (getUserIndex !== -1) {
                                                        //update user info will receive that task in auth service
                                                        dispatch(updateUserInfo(value, { assigned_issue: issueInfo?._id }))

                                                        dispatch(updateInfoIssue(issueInfo?._id, issueInfo?.project_id, { assignees: value }, null, projectInfo?.members[getUserIndex].user_info.avatar, userInfo.id, "added", "assignees"))
                                                    }
                                                }}
                                                options={renderOptionAssignee()}
                                            />
                                        </div>
                                    ) : <></>}
                                </div>
                                <div style={{ width: '100%', marginTop: 10 }}>
                                    <Button style={{ textAlign: 'left', height: 'fit-content', width: '100%', padding: '10px 10px', backgroundColor: 'transparent', border: '1px solid #DFE1E6', borderRadius: '3px 3px 0 0' }} type="button" data-toggle="collapse" data-target="#collapseInfoModal" aria-expanded="false" aria-controls="collapseInfoModal">
                                        Details <span className='ml-2' style={{ fontSize: 12 }}>Labels, Sprint, Epic Link, Fix Version,....</span>
                                    </Button>
                                    <div className="collapse pt-2" id="collapseInfoModal" style={{ border: '1px solid #DFE1E6', borderTop: 'none', borderRadius: '0 0 3px 3px', padding: '0 10px' }}>
                                        <div className='row d-flex align-items-center'>
                                            <span className='col-4' style={{ fontSize: 14, color: '#42526e', fontWeight: '500' }}>Creator</span>
                                            <div style={{ display: 'flex', maxWidth: 'fit-content' }} className="item col-7">
                                                <div className="avatar">
                                                    <Avatar src={issueInfo?.creator.avatar} size='default' />
                                                </div>
                                                <p className="name d-flex align-items-center ml-1 p-0" style={{ fontWeight: 'bold', fontSize: 12, paddingRight: 5 }}>
                                                    {issueInfo?.creator.username}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="reporter-sprint row d-flex align-items-center">
                                            <span className='col-4' style={{ fontSize: 14, color: '#42526e', fontWeight: '500' }}>Sprint</span>
                                            {editAttributeTag === 'sprint' ? <Select options={renderSprintList(sprintList, id)} onBlur={() => {
                                                setEditAttributeTag('')
                                            }} defaultValue={issueInfo?.current_sprint ? issueInfo?.current_sprint.sprint_name : null} /> : <span onDoubleClick={() => {
                                                setEditAttributeTag('sprint')
                                            }} className='items-attribute col-7' style={{ padding: '10px 10px', width: '100%', color: '#7A869A' }}>{issueInfo?.current_sprint ? issueInfo?.current_sprint.sprint_name : "None"}</span>}
                                        </div>
                                        <div className='row epic-version d-flex align-items-center mt-2'>
                                            <span className='col-4' style={{ fontSize: 14, color: '#42526e', fontWeight: '500' }}>Epic Link</span>
                                            {editAttributeTag === 'epic_link' ? <Select className="col-7" style={{ width: '100%', padding: 0 }}
                                                options={renderEpicList(epicList, id)}
                                                onBlur={() => {
                                                    setEditAttributeTag('')
                                                }}
                                                onChange={(value, props) => {
                                                    //assign issue to new epic
                                                    dispatch(updateInfoIssue(issueInfo?._id.toString(), issueInfo?.project_id.toString(), { epic_link: value }, issueInfo?.epic_link === null ? "None" : issueInfo?.epic_link.epic_name, props.label, userInfo.id, "updated", "epic link"))
                                                    //update new issue in epic
                                                    dispatch(updateEpic(value, { issue_id: issueInfo?._id.toString(), epic_id: issueInfo?.epic_link === null ? null : issueInfo?.epic_link._id.toString() }, issueInfo?.project_id.toString()))
                                                }}
                                                value={issueInfo?.epic_link?.epic_name}
                                            /> :
                                                <span onDoubleClick={() => {
                                                    setEditAttributeTag('epic_link')
                                                }} className='items-attribute col-7' style={{ padding: '10px 10px', width: '100%', color: '#7A869A' }}>{getCurrentEpic() !== null ? renderEpics()[getCurrentEpic()]?.label : "None"}</span>}
                                        </div>
                                        <div className='row d-flex align-items-center mt-2'>
                                            <span className='col-4' style={{ fontSize: 14, color: '#42526e', fontWeight: '500' }}>Fix Version</span>
                                            {editAttributeTag === 'fix_version' ? <Select options={renderVersionList(versionList, id)} className='col-7' style={{ width: '100%', padding: 0 }}
                                                value={issueInfo?.fix_version?._id}
                                                onClick={() => {
                                                    console.log("gia tri versionList ", versionList);
                                                    console.log("gia tri epicList ", epicList);

                                                }}
                                                onBlur={() => {
                                                    setEditAttributeTag('')
                                                }}
                                            /> :
                                                <span onDoubleClick={() => {
                                                    setEditAttributeTag('fix_version')
                                                }} className='items-attribute col-7' style={{ padding: '10px 10px', width: '100%', color: '#7A869A' }}>{issueInfo?.fix_version ? issueInfo?.fix_version?.version_name : "None"}</span>}
                                        </div>
                                        <div className='row d-flex align-items-center mt-2'>
                                            <span className='col-4' style={{ fontSize: 14, color: '#42526e', fontWeight: '500' }}>Story point</span>
                                            {editAttributeTag === 'story_point' ? <InputNumber className='col-7' min={0} max={1000} defaultValue={issueInfo?.story_point} value={issueInfo?.story_point} onBlur={(e) => {
                                                setEditAttributeTag('')
                                                if (e.target.value > 0 && e.target.value <= 1000) {
                                                    dispatch(updateInfoIssue(issueInfo?._id.toString(), issueInfo?.project_id?.toString(), { story_point: e.target.value }, issueInfo?.story_point === null ? "None" : issueInfo?.story_point?.toString(), e.target.value, userInfo.id, "updated", "story point"))
                                                } else {
                                                    showNotificationWithIcon('error', '', 'Story point\'s value must greater than 0')
                                                }
                                            }} /> :
                                                <span onDoubleClick={() => {
                                                    setEditAttributeTag('story_point')
                                                }} className='items-attribute col-7' style={{ padding: '10px 10px', width: '100%', color: '#7A869A' }}>{Number.isInteger(issueInfo?.story_point) ? issueInfo?.story_point : "None"}</span>}
                                        </div>
                                        <div className='row d-flex align-items-center mt-2'>
                                            <span className='col-4' style={{ fontSize: 14, color: '#42526e', fontWeight: '500' }}>Component</span>
                                            {editAttributeTag === 'component' ? <Select onBlur={() => {
                                                setEditAttributeTag('')
                                            }} className='col-7' style={{ width: '100%', padding: 0 }}
                                                defaultValue={"None"}
                                            /> :
                                                <span onDoubleClick={() => {
                                                    setEditAttributeTag('component')
                                                }} className='items-attribute col-7' style={{ padding: '10px 10px', width: '100%', color: '#7A869A' }}>{"None"}</span>}
                                        </div>
                                        <div className="row priority d-flex align-items-center mt-2" style={{ marginBottom: 20 }}>
                                            <span className='col-4' style={{ fontSize: 14, color: '#42526e', fontWeight: '500' }}>Priority</span>
                                            {editAttributeTag === 'issue_priority' ? <Select
                                                onBlur={() => {
                                                    setEditAttributeTag('')
                                                }}
                                                className='col-7'
                                                style={{ width: '100%', padding: 0 }}
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
                                            /> :
                                                <span onDoubleClick={() => {
                                                    setEditAttributeTag('issue_priority')
                                                }} className='items-attribute col-7' style={{ padding: '10px 10px', width: '100%', color: '#7A869A' }}>{priorityTypeOptions[issueInfo?.issue_priority]?.label}</span>}
                                        </div>
                                        <div className="estimate mb-3">
                                            <span style={{ fontSize: 14, color: '#42526e', fontWeight: '500' }}>Original Estimate (hours)</span>
                                            {editAttributeTag === 'originalTimeEstimate' ? <div>
                                                <input style={{ marginBottom: '3px' }} className="estimate-hours" onChange={(e) => {
                                                    // //kiem tra gia tri co khac null khong, khac thi xoa
                                                    // if (inputTimeOriginal.current) {
                                                    //     clearTimeout(inputTimeOriginal.current)
                                                    // }
                                                    // inputTimeOriginal.current = setTimeout(() => {

                                                    // }, 3000)
                                                }} disabled={issueInfo?.creator._id !== userInfo?.id}
                                                    value={convertMinuteToFormat(issueInfo?.timeOriginalEstimate)}
                                                    defaultValue=""
                                                    onBlur={(e) => {
                                                        setEditAttributeTag('')
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
                                            </div> :
                                                <span onDoubleClick={() => {
                                                    setEditAttributeTag('originalTimeEstimate')
                                                }} className='items-attribute' style={{ padding: '10px 10px', width: '100%', color: '#7A869A' }}>{Number.isInteger(issueInfo?.timeOriginalEstimate) ? convertMinuteToFormat(issueInfo?.timeOriginalEstimate) : "None"}</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="time-tracking mt-2" style={{ cursor: 'pointer' }}>
                                    <span style={{ color: '#42526e', fontWeight: '500' }}>Time Tracking</span>
                                    <div>
                                        <div>
                                            <div className='d-flex align-items-center' style={{ width: '100%' }}>
                                                <i className="fa fa-clock" />
                                                <Progress style={{ width: '100%' }} onClick={() => {
                                                    setTimeTable(true)
                                                }} percent={Math.floor(calculateProgress())} size="small" status="active" />
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span className="logged ml-4">{issueInfo?.timeSpent === 0 ? '0h' : convertMinuteToFormat(issueInfo?.timeSpent)} logged</span>
                                                <span className="estimate-time mr-2">
                                                    {issueInfo?.timeOriginalEstimate !== 0 && issueInfo?.timeSpent !== 0 ? (issueInfo?.timeOriginalEstimate - issueInfo?.timeSpent === 0 ? '0h' : convertMinuteToFormat(issueInfo?.timeOriginalEstimate - issueInfo?.timeSpent)) : '0h'} remaining
                                                </span>
                                            </div>
                                        </div>
                                        <div style={{ width: '100%' }}>


                                            {issueInfo?.creator._id === userInfo?.id && timeTable === true ? (
                                                <div>
                                                    <div className='row justify-content-center'>
                                                        <div className='col-5 p-0 pr-2'>
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
                                                        <div className='col-5 p-0 text-center pl-2'>
                                                            <label htmlFor='timeRemaining'>Time remaining</label>
                                                            <Input name="timeRemaining" disabled value={formData.timeRemaining !== 0 ? convertMinuteToFormat(formData.timeRemaining) : 'None'} />
                                                        </div>
                                                        <div className='d-flex flex-column mt-2'>
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
                                                                <DatePicker name='workingDate' style={{ width: '100%' }} open={openDatePicker} onClick={() => {
                                                                    setOpenDatePicker(true)
                                                                }} onOk={() => {
                                                                    setOpenDatePicker(false)
                                                                }} onChange={(date, dateString) => {
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
                                                            <div className='col-12 mt-3 p-0'>
                                                                <Button type='primary mr-2' onClick={() => {
                                                                    setTimeTable(false)
                                                                    dispatch(updateInfoIssue(issueInfo?._id, issueInfo?.project_id.toString(), { timeSpent: formData.timeSpent }, issueInfo.timeSpent, formData.timeSpent, issueInfo.id, "updated", "time spent"))
                                                                    dispatch(createWorklogHistory({
                                                                        issue_id: issueInfo._id.toString(),
                                                                        creator: userInfo.id,
                                                                        working_date: formData.dateWorking,
                                                                        description: formData.description,
                                                                        timeSpent: convertMinuteToFormat(formData.timeSpent)
                                                                    }))
                                                                }}>Save</Button>
                                                                <Button type='default' onClick={() => {
                                                                    setTimeTable(false)
                                                                }}>Cancel</Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : <></>}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ color: '#929398' }}>Created at {convertTime(issueInfo?.createAt)}</div>
                                <div style={{ color: '#929398' }}>{convertTime(issueInfo?.createAt) !== convertTime(issueInfo?.updateAt) ? `Updated at ${convertTime(issueInfo?.updateAt)}` : "No updated recently"}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div >
}
