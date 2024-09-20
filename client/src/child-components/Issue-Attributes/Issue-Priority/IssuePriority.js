import React from 'react'
import { priorityTypeOptions } from '../../../util/CommonFeatures'
import { Select } from 'antd'
import { updateInfoIssue } from '../../../redux/actions/IssueAction'
import { useDispatch } from 'react-redux'
import { checkConstraintPermissions } from '../../../util/CheckConstraintFields'

export default function IssuePriority(props) {
    const dispatch = useDispatch()
    const issueInfo = props.issueInfo
    const userInfo = props.userInfo
    const projectInfo = props.projectInfo
    return (
        <div className="row priority d-flex align-items-center mt-2" style={{ marginBottom: 20 }}>
            <span className='col-4' style={{ fontSize: 14, color: '#42526e', fontWeight: '500' }}>Priority</span>
            {props.editAttributeTag === 'issue_priority' ? <Select
                onBlur={() => {
                    props.handleEditAttributeTag('')
                }}
                className='col-7 info-item-field'
                style={{ width: '100%', padding: 0 }}
                placeholder={priorityTypeOptions[issueInfo?.issue_priority]?.label}
                defaultValue={priorityTypeOptions[issueInfo?.issue_priority]?.value}
                options={priorityTypeOptions}
                disabled={issueInfo?.creator._id !== userInfo?.id}
                onSelect={(value, option) => {
                    const old_value = `${issueInfo.issue_priority}`
                    const new_value = `${value}`
                    dispatch(updateInfoIssue(issueInfo?._id, issueInfo?.project_id?._id, { issue_priority: value }, old_value, new_value, userInfo.id, "updated", "priority", projectInfo, userInfo))
                }}
                name="priority"
            /> :
                <span onDoubleClick={() => {
                    if(checkConstraintPermissions(projectInfo, issueInfo, userInfo, 4)) {
                        props.handleEditAttributeTag('issue_priority')
                    }
                    
                }} className='items-attribute col-7' style={{ padding: '10px 10px', width: '100%', color: '#7A869A' }}>{priorityTypeOptions[issueInfo?.issue_priority]?.label}</span>}
        </div>
    )
}
