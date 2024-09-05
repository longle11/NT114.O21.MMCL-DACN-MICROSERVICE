import { Divider, Popconfirm, Select, Tag } from 'antd';
import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { deleteIssue, updateInfoIssue } from '../../../redux/actions/IssueAction';
import { GetProjectAction, GetWorkflowListAction } from '../../../redux/actions/ListProjectAction';
import { issueTypeOptions, iTagForIssueTypes } from '../../../util/CommonFeatures';
import { getEpicList, getVersionList } from '../../../redux/actions/CategoryAction';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import './InfoModal.css'
import LeftIssueInfo from '../../../child-components/Custom-Interface-Issue-Info/Left-Issue-Info/LeftIssueInfo';
import RightIssueInfo from '../../../child-components/Custom-Interface-Issue-Info/Right-Issue-Info/RightIssueInfo';


export default function InfoModal(props) {
    const { id } = useParams()
    const issueInfo = props.issueInfo
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
    const [subIssueSummary, setSubIssueSummary] = useState('')
    const [showAddSubIssue, setShowAddSubIssue] = useState(false)
    const displayNumberCharacterInSummarySubIssue = props.displayNumberCharacterInSummarySubIssue

    const hanleClickDisplayAddSubIssue = (valueForShowAddSubIssue) => {
        setShowAddSubIssue(valueForShowAddSubIssue)
    }
    const hanleClickEditSummaryInSubIssue = (valueForIssueSummary) => {
        setSubIssueSummary(valueForIssueSummary)
    }


    const [editAttributeTag, setEditAttributeTag] = useState('')

    useEffect(() => {
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


    return <div style={{ overflowY: 'hidden', width: '100%' }}>
        <div className="info-modal">
            <div className="modal-content border-0">
                <div className="modal-header align-items-center border-0" style={{padding: '0 15px 5px 15px'}}>
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
                                dispatch(updateInfoIssue(issueInfo?._id, issueInfo?.project_id?._id.toString(), { issue_status: value }, `${issueInfo.issue_status}`, `${value}`, userInfo.id, 'updated', 'status'))
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
                                worklogList={worklogList}
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
