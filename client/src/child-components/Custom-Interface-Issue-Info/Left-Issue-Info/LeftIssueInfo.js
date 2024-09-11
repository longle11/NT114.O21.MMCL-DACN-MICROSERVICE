import { Avatar, Button, Input, message, Progress, Spin, Table, Tooltip, Upload } from 'antd'
import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { showNotificationWithIcon } from '../../../util/NotificationUtil'
import { getInfoIssue, getIssueHistoriesList, getWorklogHistoriesList, updateInfoIssue } from '../../../redux/actions/IssueAction'
import { createCommentAction, deleteCommentAction, getCommentAction, updateCommentAction } from '../../../redux/actions/CommentAction'
import { iTagForIssueTypes, iTagForPriorities } from '../../../util/CommonFeatures'
import { convertMinuteToFormat, convertTime } from '../../../validations/TimeValidation'
import Summary from '../../Issue-Attributes/Summary/Summary'
import Description from '../../Issue-Attributes/Description/Description'
import TextArea from 'antd/es/input/TextArea'
import { NavLink } from 'react-router-dom'
import './LeftIssueInfo.css'
import Parser from 'html-react-parser'
import { deleteFileAction, getAllFilesAction } from '../../../redux/actions/CategoryAction'
import domainName from '../../../util/Config'
export default function LeftIssueInfo(props) {

    const issueInfo = props.issueInfo
    const userInfo = props.userInfo
    const historyList = props.historyList
    const worklogList = props.worklogList
    const projectInfo = props.projectInfo
    const commentList = props.commentList
    const fileList = useSelector(state => state.categories.fileList)
    const issueIdForIssueDetail = props.issueIdForIssueDetail
    const [type, setType] = useState(false)
    const dispatch = useDispatch()
    const [buttonActive, setButtonActive] = useState(1)

    useEffect(() => {
        dispatch(getAllFilesAction())
        if (issueInfo?._id) {
            dispatch(getInfoIssue(issueInfo._id))
        }
    }, [])


    const [switchToListView, setSwitchToListView] = useState(false)


    //sử dụng cho phần bình luận
    //tham số isSubmit thì để khi bấm send thì mới thực hiện duyệt mảng comments
    const [comment, setComment] = useState({
        content: '',
        isSubmit: true,
    })

    const [fileInfo, setFileInfo] = useState({})


    const [editComment, setEditComment] = useState('')
    const [editContentComment, setEditContentComment] = useState('')
    const [commentSort, setCommentSort] = useState(false)
    const [historySort, setHistorySort] = useState(false)
    const [currentIssueId, setCurrentIssueId] = useState('')
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

    const renderImageForFileType = (fileType, filePath) => {
        if (fileType?.toLowerCase() === "pdf") {
            return <i style={{ fontSize: '2rem' }} className="fa-sharp fa-regular fa-file-pdf text-danger"></i>
        } else if (['jpeg', 'jpg', 'gif', 'png'].includes(fileType?.toLowerCase())) {
            console.log("filePath ", filePath);
            
            return <img style={{ height: '100%', width: '100%', objectFit: 'cover' }} src={filePath} alt='avt img' />
        } else if (fileType?.toLowerCase() === "docx") {
            return <i style={{ fontSize: '2rem' }} className="fa fa-file-alt text-primary"></i>
        } else if (fileType?.toLowerCase() === "xlsx") {
            return <i style={{ fontSize: '2rem' }} className="fa fa-file-excel text-success"></i>
        }
        return <i style={{ fontSize: '2rem' }} className="fa fa-file-upload"></i>
    }

    const downloadFileWithUrl = (fileUrl, fileName) => {
        const aTag = document.createElement('a')
        aTag.href = fileUrl
        aTag.setAttribute('download', fileName)
        document.body.appendChild(aTag)
        aTag.click()
        aTag.remove()
    }

    const renderFileUploading = (imagePathFile, fileName, fileTimeCreateAt, isUploading, file_id, filePath, originalFileName) => {
        return <div className="card file-card mt-1" style={{ width: '200px', position: 'relative', marginRight: 5, display: 'inline-block' }}>
            <div className='file-btns' style={{ position: 'absolute', right: 5, top: 5, display: 'none', alignItems: 'center', zIndex: 9999 }}>
                {!isUploading ? <Button onClick={() => {
                    downloadFileWithUrl(filePath, originalFileName)
                }} style={{ padding: '0 8px', marginRight: 5 }}><i className="fa fa-cloud-download-alt"></i></Button> : <></>}
                {!isUploading ? <Button onClick={() => {
                    setFileInfo({})
                    dispatch(deleteFileAction(file_id))
                    dispatch(updateInfoIssue(issueInfo._id, issueInfo.project_id._id, { uploaded_file_id: file_id }, null, null, userInfo.id, "remove", "file"))
                    dispatch(getAllFilesAction())
                }} style={{ padding: '0 8px' }}><i className="fa fa-trash-alt"></i></Button> : <></>}
            </div>
            <div className='file-img' style={{
                backgroundColor: '#f2f2f2',
                height: '5rem',
                width: '100%',
                display: 'flex',
                position: 'relative',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {imagePathFile}
                {isUploading ? <div className="progress" style={{
                    position: 'absolute',
                    bottom: 5,
                    paddig: '0 10px',
                    backgroundColor: '#ffff',
                    width: '90%'
                }}>
                    <div style={{ backgroundColor: '#44546F', width: `${fileInfo?.percent}%` }} className="progress-bar" role="progressbar" aria-valuenow={fileInfo?.percent} aria-valuemin={0} aria-valuemax={100} />
                </div> : <></>}

            </div>
            <div className="card-body p-0 d-flex flex-column ml-2 mt-1">
                <Tooltip title={originalFileName}>
                    <p style={{ fontSize: 12, textDecoration: 'none', color: "#000", margin: 0, fontWeight: 500 }} className="card-title">
                        {fileName}
                    </p>
                </Tooltip>
                <span style={{ fontSize: 12 }}>{convertTime(fileTimeCreateAt, true)}</span>
            </div>
        </div>
    }
    const renderShortFileName = (fileName) => {
        return fileName.length > 30 ? fileName.substring(0, 10) + "..." + fileName.substring(fileName.length - 10) : fileName
    }
    const getAllFiles = () => {
        if (fileList?.length > 0 && issueInfo?.file_uploaded?.length > 0) {
            return issueInfo?.file_uploaded?.map(file => {
                const getFileIndex = fileList.findIndex(currentFile => currentFile._id === file.toString())
                if (getFileIndex !== -1) {
                    const fileNameOriginal = fileList[getFileIndex].originalname
                    const pathFileIndex = fileNameOriginal.lastIndexOf('.')
                    const filePath = `${domainName}/api/files/uploads/${fileList[getFileIndex].fileName}`
                    
                    const imageFilePath = renderImageForFileType(fileNameOriginal.substring(pathFileIndex + 1), filePath)
                    const fileName = renderShortFileName(fileNameOriginal)
                    const fileTimeCreateAt = fileList[getFileIndex]?.createAt
                    return renderFileUploading(imageFilePath, fileName, fileTimeCreateAt, false, fileList[getFileIndex]._id, filePath, fileNameOriginal)
                }
            })
        }
        return <div></div>
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
                        <span><span style={{ fontWeight: 'bold' }}>{history?.createBy?.username}</span> {history?.type_history} the <span style={{ fontWeight: 'bold' }}>{capitalizeFirstLetter(history?.name_status)}</span> {convertTime(history?.createAt)}</span>
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
                {renderCommetList()}
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
    const uploadFileProps = {
        name: 'file',
        action: 'http://localhost/api/files/upload',
        headers: {
            authorization: 'authorization-text',
        },
        data: {
            creator_id: userInfo.id
        },
        onChange(info) {
            setFileInfo(preState => ({ ...preState, ...info.file }))
            if (info.file.status === 'done') {
                setFileInfo({})
                setCurrentIssueId('')
                dispatch(updateInfoIssue(issueInfo._id, issueInfo.project_id._id, { uploaded_file_id: info.file.response.data._id }, null, null, userInfo.id, "uploaded", "file"))
                dispatch(getAllFilesAction())
                message.success(`${info.file.name} file uploaded successfully`);
            } else if (info.file.status === 'error') {
                setFileInfo({})
                setCurrentIssueId('')
                message.error(`${info.file.name} file upload failed.`);
            }
        }
    };

    const renderAllFilesWithTripView = () => {
        return <div style={{ overflowX: 'auto', scrollbarWidth: 'thin' }}>
            {issueIdForIssueDetail !== null && issueIdForIssueDetail === currentIssueId ? (Object.keys(fileInfo).length > 0 ? renderFileUploading(renderImageForFileType(fileInfo?.name?.substring(fileInfo?.name?.lastIndexOf('.') + 1), null), renderShortFileName(fileInfo?.name), fileInfo?.lastModified, true, null, null, null) : <></>) : <></>}
            {getAllFiles()}
        </div>
    }
    const formatBytes = (bytes) => {
        if (!bytes) return '0 Bytes';

        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        const formatted = (bytes / Math.pow(1024, i)).toFixed(2);

        return `${formatted} ${sizes[i]}`;
    }
    const fileColumns = () => {
        return [
            {
                title: 'Type',
                dataIndex: 'type',
                width: 'max-content',
                align: 'center',
                key: 'type',
                render: (text, record) => {
                    return <span>{renderImageForFileType(record?.fileName?.substring(record?.fileName?.lastIndexOf('.') + 1), record?.url)}</span>
                }
            },
            {
                title: 'Name',
                dataIndex: 'name',
                width: '150px',
                key: 'name',
                render: (text, record) => {
                    const fileName = record?.name?.length > 30 ? record?.name?.substring(0, 10) + "..." + record?.name?.substring(record?.name?.length - 10) : record?.name
                    return <Tooltip title={record?.name}><span className='ml-1'>{fileName}</span></Tooltip>
                }
            },
            {
                title: 'Size',
                dataIndex: 'size',
                align: 'center',
                width: '100px',
                key: 'size',
                render: (text, record) => {
                    return <span>{formatBytes(record?.size)}</span>
                }
            },
            {
                title: 'Date added',
                dataIndex: 'createAt',
                width: '230px',
                key: 'createAt',
                render: (text, record) => {
                    return convertTime(record?.createAt, true)
                }
            },
            {
                title: '',
                dataIndex: 'action',
                width: 'fit-content',
                align: 'center',
                key: 'action',
                render: (text, record) => {
                    return <div style={{ display: 'flex', justifyContent: 'center' }}>
                        {!record?.isUploading ? <Button onClick={() => {
                            downloadFileWithUrl(record?.url, record?.fileName)
                        }} style={{ padding: '0 8px', marginRight: 5 }}><i className="fa fa-cloud-download-alt"></i></Button> : <></>}
                        {!record?.isUploading ? <Button onClick={() => {
                            setFileInfo({})
                            dispatch(deleteFileAction(record?._id))
                            dispatch(updateInfoIssue(issueInfo._id, issueInfo.project_id._id, { uploaded_file_id: record?._id }, null, null, userInfo.id, "remove", "file"))
                            dispatch(getAllFilesAction())
                        }} style={{ padding: '0 8px' }}><i className="fa fa-trash-alt"></i></Button> : <></>}
                        {record?.isUploading ? <Progress type="circle" percent={fileInfo?.percent} size={20} /> : <></>}
                    </div>
                }
            }
        ]
    }
    const renderAllFilesWithListView = () => {
        var convertFile = {}
        if (Object.keys(fileInfo).length > 0 && issueIdForIssueDetail !== null && issueIdForIssueDetail === currentIssueId) {
            convertFile = {
                fileName: fileInfo.name,
                createAt: fileInfo.lastModified,
                name: "",
                size: fileInfo.size,
                isUploading: true,
                url: null,
                _id: null,
            }
        }
        const getFiles = issueInfo?.file_uploaded?.map(file => {
            const index = fileList?.findIndex(currentFile => currentFile?._id?.toString() === file?.toString())
            if (index !== -1) {
                return fileList[index]
            }
        })
        const converAllExistedFiles = getFiles?.map((file) => {
            return {
                fileName: file?.fileName,
                createAt: file?.createAt,
                name: file?.originalname,
                size: file?.size,
                isUploading: false,
                url: `${domainName}/api/files/uploads/${file?.fileName}`,
                _id: file?._id
            }
        })
        const allFiles = Object.keys(convertFile).length > 0 ? [convertFile].concat(converAllExistedFiles) : converAllExistedFiles
        return <Table
            className='custom-file-table'
            scroll={{
                x: 150,
                y: 250
            }}
            columns={fileColumns()}
            dataSource={allFiles}
        />
    }
    return (
        <div className="col-8"
            style={{ overflowY: 'auto', height: '90%', scrollbarWidth: 'none' }}>
            <div className='d-flex align-items-center'>
                <Upload accept=".png, .jpg, .jpeg, .docx, .xlsx, .pdf" {...uploadFileProps} beforeUpload={() => {
                    setCurrentIssueId(issueInfo?._id)
                }} showUploadList={false}>
                    {currentIssueId === "" ? <i type="button" style={{ fontSize: 20, marginRight: 10, backgroundColor: 'rgba(9, 30, 66, 0.04)', padding: '8px' }} className="fa-solid fa-paperclip icon-options"></i> : 
                    <i onClick={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                    }} type="button" style={{ fontSize: 20, marginRight: 10, backgroundColor: 'rgba(9, 30, 66, 0.04)', padding: '8px' }}  className="fa-solid fa-paperclip icon-options"></i>}
                </Upload>

                <i onClick={() => {
                    props.hanleClickDisplayAddSubIssue(true)
                    props.hanleClickEditSummaryInSubIssue('')
                    // setShowAddSubIssue(true)
                    // setSubIssueSummary('')
                }} style={{ fontSize: 20, marginRight: 10, backgroundColor: 'rgba(9, 30, 66, 0.04)', padding: '8px' }} className="fa-solid fa-sitemap icon-options"></i>
            </div>
            <Summary issueInfo={issueInfo} userInfo={userInfo} />
            <Description issueInfo={issueInfo} userInfo={userInfo} />
            {
                issueInfo?.file_uploaded?.length > 0 ? <div className='mt-2 mb-2'>
                    <div className='d-flex justify-content-between align-items-center mb-1'>
                        <h6>Attachments <Avatar className='ml-1' style={{ width: 15, height: 15 }}><span style={{ fontSize: 11, display: 'flex', alignItems: 'center' }}>{issueInfo?.file_uploaded?.length}</span></Avatar></h6>
                        <div className='d-flex'>
                            <div className="dropdown">
                                <Button className='btns-hover' id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style={{ border: 'none', backgroundColor: 'transparent', padding: '0 5px 0 10px', marginRight: 5 }}><i style={{ fontSize: 13 }} className="fa fa-ellipsis-h mr-1"></i></Button>
                                <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                    <a onClick={() => {
                                        setSwitchToListView(!switchToListView)
                                    }} className="dropdown-item" style={{ fontSize: 15 }} href="##">{switchToListView ? "Switch to strip view" : "Switch to list view"}</a>
                                    <a className="dropdown-item d-flex justify-content-between align-items-center" style={{ fontSize: 15 }} href="##">
                                        <NavLink onClick={() => {
                                            issueInfo?.file_uploaded?.map(file => {
                                                const getFileIndex = fileList.findIndex(currentFile => currentFile._id === file.toString())
                                                if (getFileIndex !== -1) {
                                                    console.log("fileList[getFileIndex].originalname ", fileList[getFileIndex].fileName);
                                                    
                                                    const fileNameOriginal = fileList[getFileIndex].originalname
                                                    const filePath = `${domainName}/api/files/uploads/${fileList[getFileIndex].fileName}`
                                                    downloadFileWithUrl(filePath, fileNameOriginal)
                                                }
                                            })
                                        }} style={{textDecoration: 'none', color: '#000'}}>Download all</NavLink>
                                        <Avatar className='ml-1' style={{ width: 15, height: 15 }}><span style={{ fontSize: 11, display: 'flex', alignItems: 'center' }}>{issueInfo?.file_uploaded?.length}</span></Avatar>
                                    </a>
                                    <a className="dropdown-item" style={{ fontSize: 15 }} href="##">Delete all</a>
                                </div>
                            </div>
                            <Upload accept=".png, .jpg, .jpeg, .docx, .xlsx, .pdf" {...uploadFileProps} beforeUpload={() => {
                                setCurrentIssueId(issueInfo?._id)
                            }} showUploadList={false}>
                                {currentIssueId === "" ? <Button style={{ padding: '0 10px', border: 'none', backgroundColor: 'transparent' }}><i style={{ fontSize: 13 }} className="fa fa-plus btns-hover"></i></Button> :
                                <Button disabled style={{ padding: '0 10px', border: 'none', backgroundColor: 'transparent' }}><i style={{ fontSize: 13 }} className="fa fa-plus btns-hover"></i></Button>}
                            </Upload>
                        </div>
                    </div>
                    {!switchToListView ? renderAllFilesWithTripView() : renderAllFilesWithListView()}
                </div> : <div className='mb-2'>
                    {issueIdForIssueDetail !== null && issueIdForIssueDetail === currentIssueId ? (Object.keys(fileInfo).length > 0 ? renderFileUploading(renderImageForFileType(fileInfo?.name?.substring(fileInfo?.name?.lastIndexOf('.') + 1), null), renderShortFileName(fileInfo?.name), fileInfo?.lastModified, true, null, null, null) : <></>) : <></>}
                </div>
            }
            <div className='activities'>
                <h5>Activity</h5>
                <div>
                    <span>Show:</span>
                    <button className='btn btn-light ml-3 mr-2' onClick={() => { setButtonActive(0) }} style={{ padding: '0 10px', fontSize: '14px', fontWeight: '600', backgroundColor: buttonActive === 0 ? "#e9f2ff " : "#091e420f", color: buttonActive === 0 ? '#0c66e4' : "#44546f" }}>All</button>
                    <button className='btn btn-light mr-2' onClick={() => { setButtonActive(1) }} style={{ padding: '0 10px', fontSize: '14px', fontWeight: '600', backgroundColor: buttonActive === 1 ? "#e9f2ff " : "#091e420f", color: buttonActive === 1 ? '#0c66e4' : "#44546f" }}>Comments</button>
                    <button className='btn btn-light mr-2' onClick={() => { setButtonActive(2); dispatch(getIssueHistoriesList(issueInfo?._id.toString(), -1)) }} style={{ padding: '0 10px', fontSize: '14px', fontWeight: '600', backgroundColor: buttonActive === 2 ? "#e9f2ff " : "#091e420f", color: buttonActive === 2 ? '#0c66e4' : "#44546f" }}>History</button>
                    <button className='btn btn-light' onClick={() => { setButtonActive(3); dispatch(getWorklogHistoriesList(issueInfo?._id.toString(), -1)) }} style={{ padding: '0 10px', fontSize: '14px', fontWeight: '600', backgroundColor: buttonActive === 3 ? "#e9f2ff " : "#091e420f", color: buttonActive === 3 ? '#0c66e4' : "#44546f" }}>Work log</button>
                </div>
            </div>
            {renderActivities()}
        </div>
    )
}
