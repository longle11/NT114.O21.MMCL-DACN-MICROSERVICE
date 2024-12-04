import React from 'react'
import { iTagForIssueTypes } from '../../../util/CommonFeatures'

export default function NewChangesInactiveToActive(props) {
    const workflowList = props.workflowList
    const projectInfo = props.projectInfo
    const flowArrs = props.flowArrs
    const currentWorkflowInactive = props.currentWorkflowInactive
    return (
        flowArrs.length > 0 && currentWorkflowInactive !== null ? <div>
            <span className='font-weight-bold'><i style={{color: '#ff9966'}} className="fa fa-exclamation-circle mr-2"></i>There are some changes from active workflows</span>
            <div>
                {
                    flowArrs?.map(flow => {
                        const getFlowIndex = workflowList.findIndex(currentFlow => currentFlow._id === flow.workflow_id)
                        return <div className='d-flex mt-1 align-items-center'>
                            <span className='font-weight-bold mr-3'>{workflowList[getFlowIndex].name_workflow}:</span>
                            {
                                flow.issue_statuses.length > 0 ? <span className='d-flex align-items-center'>
                                    <span className='d-flex align-items-center'>{workflowList[getFlowIndex].issue_statuses.map(status => iTagForIssueTypes(status, null, null, projectInfo?.issue_types_default))}</span>
                                    <span><i className="fa fa-long-arrow-alt-right ml-2 mr-2"></i></span>
                                    <span className='d-flex align-items-center'>{flow.issue_statuses.map(status => iTagForIssueTypes(status, null, null, projectInfo?.issue_types_default))}</span>
                                </span> : <span className='d-flex align-items-center'>
                                    <span className='d-flex align-items-center'><span className='mr-2'>Active</span> {workflowList[getFlowIndex].issue_statuses.map(status => iTagForIssueTypes(status, null, null, projectInfo?.issue_types_default))}</span>
                                    <span><i className="fa fa-long-arrow-alt-right ml-2 mr-2"></i></span>
                                    <span>Inactive</span>
                                </span>
                            }
                        </div>
                    })
                }
            </div>
            <div className='d-flex align-items-center mt-2'>
                <span className='font-weight-bold mr-3'>{currentWorkflowInactive?.name_workflow}: </span>
                <span>Inactive</span>
                <span><i className="fa fa-long-arrow-alt-right ml-2 mr-2"></i></span>
                <span>Active</span>
            </div>
        </div> : <></>
    )
}
