import { Avatar, Button, Divider, Popconfirm, Select, Tag } from 'antd';
import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { deleteIssue, getInfoIssue, updateInfoIssue } from '../../../redux/actions/IssueAction';
import { GetProjectAction, GetWorkflowListAction } from '../../../redux/actions/ListProjectAction';
import { issueTypeOptions, iTagForIssueTypes } from '../../../util/CommonFeatures';
import { getEpicList, getVersionList } from '../../../redux/actions/CategoryAction';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import './InfoModal.css'
import LeftIssueInfo from '../../../child-components/Custom-Interface-Issue-Info/Left-Issue-Info/LeftIssueInfo';
import RightIssueInfo from '../../../child-components/Custom-Interface-Issue-Info/Right-Issue-Info/RightIssueInfo';
import { getCommentAction } from '../../../redux/actions/CommentAction';
import { checkConstraintPermissions } from '../../../util/CheckConstraintFields';
import domainName from '../../../util/Config';
import { displayComponentInModal, openModalInfo } from '../../../redux/actions/ModalAction';
import AddFlagModal from '../AddFlagModal/AddFlagModal';
import AddParentModal from '../AddParentModal/AddParentModal';
import CloneIssueModal from '../CloneIssueModal/CloneIssueModal';


export default function InfoModal(props) {
    const { id } = useParams()
    // const issueInfo = useSelector(state => state.issue.issueInfo)
    const sprintList = useSelector(state => state.listProject.sprintList)
    const projectInfo = useSelector(state => state.listProject.projectInfo)
    const processList = useSelector(state => state.listProject.processList)
    const workflowList = useSelector(state => state.listProject.workflowList)
    const userInfo = useSelector(state => state.user.userInfo)
    const historyList = useSelector(state => state.issue.historyList)
    const worklogList = useSelector(state => state.issue.worklogList)
    const epicList = useSelector(state => state.categories.epicList)
    const versionList = useSelector(state => state.categories.versionList)
    const issuesBacklog = useSelector(state => state.issue.issuesBacklog)
    const commentList = useSelector(state => state.comment.commentList)
    const [subIssueSummary, setSubIssueSummary] = useState('')
    const [showAddSubIssue, setShowAddSubIssue] = useState(false)
    const displayNumberCharacterInSummarySubIssue = props.displayNumberCharacterInSummarySubIssue
    const issueIdForIssueDetail = props.issueIdForIssueDetail   //used to compare for displaying file uploading in issue detail page

    const [onClickedItems, setOnClickedItems] = useState(false)

    const hanleClickDisplayAddSubIssue = (valueForShowAddSubIssue) => {
        setShowAddSubIssue(valueForShowAddSubIssue)
    }
    const hanleClickEditSummaryInSubIssue = (valueForIssueSummary) => {
        setSubIssueSummary(valueForIssueSummary)
    }
    const issueInfo = props.issueInfo

    const [editAttributeTag, setEditAttributeTag] = useState('')

    useEffect(() => {
        if (id) {
            dispatch(GetWorkflowListAction(id))
            dispatch(getVersionList(id))
            dispatch(getEpicList(id))
            dispatch(GetProjectAction(id, null, null))
            if (issueInfo?._id) {
                dispatch(getCommentAction(issueInfo._id, -1))
                dispatch(getInfoIssue(issueInfo?._id))
            }
        }
    }, [])
    const navigate = useNavigate()
    //su dung cho debounce time original
    const inputTimeOriginal = useRef(null)

    const dispatch = useDispatch()
    const renderIssueTypeWithPermissions = () => {

        return <Tag className='mr-3' style={{ borderRadius: 5, padding: '5px 25px' }} onDoubleClick={() => {
            if (checkConstraintPermissions(projectInfo, issueInfo, userInfo, 2) === true) {
                setEditAttributeTag('issue_type')
            }
        }} color={issueInfo?.issue_type?.tag_color}>{issueInfo?.issue_type?.name_process}</Tag>
    }
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


    return <div style={{ overflowY: 'hidden', width: '100%' }}>
        <div className="info-modal">
            <div className="modal-content border-0">
                <div className="modal-header align-items-center border-0" style={{ padding: '0 15px 5px 15px' }}>
                    <div className="task-title d-flex align-items-center" style={{ width: 'max-content' }}>
                        <NavLink to={`/projectDetail/${id}/issues/issue-detail/${issueInfo?._id}`} style={{ width: '100%', marginRight: 10 }}>WD-{issueInfo?.ordinal_number}</NavLink>
                        {editAttributeTag === "issue_status" ? <Select
                            placeholder={issueTypeOptions[issueInfo?.issue_status]?.label}
                            defaultValue={issueTypeOptions[issueInfo?.issue_status]?.value}
                            style={{ width: '100%' }}
                            options={issueTypeOptions}
                            onBlur={() => {
                                setEditAttributeTag('')
                            }}
                            onKeyDown={(e) => {
                                if (e.key.toLowerCase() === "enter") {
                                    setEditAttributeTag('')
                                }
                            }}
                            onSelect={(value, option) => {
                                dispatch(updateInfoIssue(issueInfo?._id, issueInfo?.project_id?._id.toString(), { issue_status: value }, `${issueInfo.issue_status}`, `${value}`, userInfo.id, 'updated', 'status'))
                            }}
                            name="issue_status"
                        /> : <span onDoubleClick={() => {
                            if (checkConstraintPermissions(projectInfo, issueInfo, userInfo, 3)) {
                                setEditAttributeTag('issue_status')
                            }
                        }} className='items-attribute m-0' style={{ padding: '10px 5px 5px 10px', width: 'max-content' }}>{iTagForIssueTypes(issueInfo?.issue_status, null, null)}</span>}
                        <div className="issue_type">
                            <div className='d-flex flex-column'>
                                {editAttributeTag === 'issue_type' ? <Select
                                    options={typeOptionsFollowWorkflow(issueInfo?.issue_type?._id.toString())}
                                    style={{ width: 200, marginTop: 5 }}
                                    onChange={(value, props) => {
                                        dispatch(updateInfoIssue(issueInfo?._id, issueInfo?.project_id?._id, { issue_type: value }, issueInfo?.issue_type.name_process, props.label, userInfo.id, "updated", "issue type"))
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
                                            <div className='view-workflow' style={{ padding: '10px 20px', marginTop: 5, width: 'max-content' }}>
                                                <span style={{ textDecoration: 'none', color: 'black' }} onClick={() => {
                                                    navigate(`/projectDetail/${id}/workflows`)
                                                    window.location.reload()
                                                }}>View your workflow</span>
                                            </div>
                                        </>
                                    )}
                                    value={issueInfo?.issue_type?.name_process}
                                /> : <div className='d-flex align-items-center'>
                                    {
                                        renderIssueTypeWithPermissions()
                                    }
                                    {issueInfo?.issue_type?._id === processList[processList?.length - 1]?._id ? <span className='d-flex align-items-center align-items-center font-weight-bold'><i className="fa fa-check text-success font-weight-bold mr-2"></i> Done</span> : <></>}
                                </div>}
                            </div>
                        </div>
                        {issueInfo?.isFlagged ? <div className='issue_flagged ml-3 d-flex align-items-center'><i style={{ fontSize: 16, color: '#FF5630' }} className="fa fa-flag mr-2"></i> <span className='font-weight-bold m-0'>Flagged</span></div> : <></>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }} className="task-click">
                        <div style={{ display: 'flex' }}>
                            {issueInfo?.is_permissions === true ? <i onClick={() => {
                                dispatch(updateInfoIssue(issueInfo._id, id, { is_permissions: !issueInfo?.is_permissions }, issueInfo?.is_permissions === true ? "blocked" : "unblocked", !issueInfo?.is_permissions === true ? "unblocked" : "blocked", userInfo.id, "apply", "restriction"))
                            }} style={{ fontSize: 20, padding: 10 }} className="fa fa-lock"></i> :
                                <div className='dropdown'>
                                    <i onClick={() => {

                                    }} style={{ fontSize: 20, padding: 10 }} className="fa fa-unlock" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></i>
                                    <div class="dropdown-menu" aria-labelledby="dropdownMenuButton" style={{ width: 300, padding: '5px 10px' }}>
                                        <h6 style={{ fontSize: 14 }}>Do you want to apply this restrictions to the following objects?</h6>
                                        <ul style={{ fontSize: 13 }}>
                                            <li>Members</li>
                                            <li>Viewers</li>
                                            <li>Assignees</li>
                                        </ul>
                                        <div className='d-flex justify-content-between align-items-center'>
                                            <Button onClick={() => {
                                                dispatch(updateInfoIssue(issueInfo._id, id, { is_permissions: !issueInfo?.is_permissions }, issueInfo?.is_permissions === true ? "blocked" : "unblocked", !issueInfo?.is_permissions === true ? "unblocked" : "blocked", userInfo.id, "apply", "restriction"))
                                            }} type='primary'>Apply</Button>
                                            <NavLink onClick={() => {
                                                dispatch(openModalInfo(false))
                                            }} style={{ fontSize: 12 }} to={`${domainName}/projectDetail/${id}/settings/issue-permissions/${issueInfo._id}`}>Go to settings</NavLink>
                                        </div>
                                    </div>
                                </div>}


                            <NavLink style={
                                {
                                    width: 'fit-content',
                                    padding: issueInfo?.voted?.length === 0 ? 0 : 10,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    textDecoration: 'none'
                                }
                            } className={`${issueInfo?.voted?.length > 0 ? 'hover-items' : ''}`}>
                                <div className={`dropdown`}>
                                    <i onClick={(e) => {
                                        e.stopPropagation()
                                        e.preventDefault()
                                        setOnClickedItems(!onClickedItems)
                                    }} type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style={
                                        {
                                            fontSize: 20,
                                            padding: issueInfo?.voted?.length === 0 ? 10 : 0,
                                            color: onClickedItems ? '#0C66E4' : issueInfo?.voted?.map(user => user._id)?.includes(userInfo.id) ? '#0C66E4' : '#000',
                                            backgroundColor: onClickedItems ? '#E9F2FF' : 'transparent',
                                            textDecoration: 'none'
                                        }
                                    } className={`fa fa-thumbs-up ${issueInfo?.voted?.length === 0 ? 'hover-items' : ''}`}></i>
                                    <div className={`dropdown-menu ${onClickedItems ? "show" : ""}`} aria-labelledby="dropdownMenuButton" style={{ width: 'max-content' }}>
                                        <a onClick={() => {
                                            setOnClickedItems(!onClickedItems)
                                            dispatch(updateInfoIssue(issueInfo._id, issueInfo.project_id._id, { voted_user_id: userInfo.id }, null, null, userInfo.id, issueInfo?.voted?.map(user => user._id).includes(userInfo.id) ? "Unliked" : "Liked", "issue"))
                                        }} style={{ fontSize: 14 }} className="dropdown-item" href="##">
                                            <i style={{ color: '#0052CC', fontSize: 20 }} class="fa fa-thumbs-up mr-3"></i>
                                            {
                                                issueInfo?.voted?.map(user => user._id)?.includes(userInfo.id) ? <span>Remove vote</span> : <span>Vote for this issue</span>
                                            }
                                        </a>
                                        <hr className='mt-2 mb-0' />
                                        <div>
                                            {issueInfo?.voted?.length === 0 ? <div style={{ padding: '15px 10px' }}>
                                                <span style={{ fontSize: 13 }}>No one has voted for this issue</span>
                                            </div> : <div>
                                                <h6 style={{ fontSize: 14, margin: '10px 0 10px 10px' }}>Voted for this issue</h6>
                                                {
                                                    issueInfo?.voted?.map((user, index) => {
                                                        return <div className="dropdown-item" style={{ padding: '5px 10px' }} key={index}>
                                                            <Avatar className='mr-2' src={user.avatar} />
                                                            <span>{user.username}</span>
                                                        </div>
                                                    })
                                                }
                                            </div>}
                                        </div>
                                    </div>
                                </div>

                                {issueInfo?.voted?.length > 0 ? <span className='p-0 pl-2 font-weight-bold'>{issueInfo?.voted?.length}</span> : null}
                            </NavLink>
                            <i style={{ fontSize: 20, padding: 10 }} className="fa fa-share-alt"></i>
                            <i style={{ fontSize: 20, padding: 10 }} className="fa-solid fa-link"></i>
                            <div className="dropdown">
                                <i type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style={{ fontSize: 20, padding: 10 }} className="fa fa-ellipsis-h"></i>
                                <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                    {
                                        !issueInfo?.isFlagged ? <a className="dropdown-item" href="##" onClick={(e) => {
                                            dispatch(displayComponentInModal(<AddFlagModal editCurrentIssue={issueInfo} userInfo={userInfo} />, 1024, <h4><i style={{ fontSize: 25, color: '#FF5630' }} className="fa fa-flag mr-3"></i> Add Flag</h4>))
                                        }}>Add flag</a> : <a className="dropdown-item" href="##" onClick={(e) => {
                                            dispatch(updateInfoIssue(issueInfo._id, issueInfo.project_id._id, { isFlagged: false }, null, null, userInfo.id, "canceled", "flag"))
                                        }}>Remove flag</a>
                                    }
                                    {issueInfo?.issue_status !== 4 ? <a onClick={() => {
                                        dispatch(displayComponentInModal(<AddParentModal issue={issueInfo} userInfo={userInfo} epicList={epicList}/>, 600, "Add Epic"))
                                    }} className="dropdown-item" href="##">Add Parent</a> : <></>}
                                    <hr className='mt-1 mb-1' />
                                    <a onClick={() => {
                                        dispatch(displayComponentInModal(<CloneIssueModal issue={issueInfo} userInfo={userInfo}/>, 600, `Clone issue: WD-${issueInfo?.ordinal_number}`))
                                    }} className="dropdown-item" href="##">Clone issue</a>
                                    <a className="dropdown-item" href="##">Move other projects</a>
                                    <a className="dropdown-item" href="##">Delete</a>
                                    <hr className='mt-1 mb-1' />
                                    <a className="dropdown-item" href="##">Configuration</a>
                                </div>
                            </div>

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
                                            dispatch(GetProjectAction(issueInfo?.project_id?._id, ""))
                                        }} okText="Yes" cancelText="No">
                                        <i className="fa fa-trash-alt" style={{ cursor: 'pointer' }} />
                                    </Popconfirm>
                                </div>
                            ) : <></>
                        }
                    </div>
                </div>
                <div className="modal-body p-0">
                    <div className="container-fluid">
                        <div className="row" style={{ height: 630 }}>
                            <LeftIssueInfo
                                issueInfo={issueInfo}
                                userInfo={userInfo}
                                historyList={historyList}
                                issueIdForIssueDetail={issueIdForIssueDetail}
                                worklogList={worklogList}
                                projectInfo={projectInfo}
                                commentList={commentList}
                                hanleClickDisplayAddSubIssue={hanleClickDisplayAddSubIssue}
                                hanleClickEditSummaryInSubIssue={hanleClickEditSummaryInSubIssue} />
                            <RightIssueInfo
                                issueInfo={issueInfo}
                                userInfo={userInfo}
                                sprintList={sprintList}
                                issuesBacklog={issuesBacklog}
                                epicList={epicList}
                                displayNumberCharacterInSummarySubIssue={displayNumberCharacterInSummarySubIssue}
                                id={id}
                                hanleClickDisplayAddSubIssue={hanleClickDisplayAddSubIssue}
                                hanleClickEditSummaryInSubIssue={hanleClickEditSummaryInSubIssue}
                                showAddSubIssue={showAddSubIssue}
                                subIssueSummary={subIssueSummary}
                                projectInfo={projectInfo}
                                versionList={versionList}
                                processList={processList} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div >
}
