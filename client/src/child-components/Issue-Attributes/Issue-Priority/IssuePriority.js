import React from 'react'
import { priorityTypeOptions } from '../../../util/CommonFeatures'
import { Select } from 'antd'
import { updateInfoIssue } from '../../../redux/actions/IssueAction'
import { useDispatch } from 'react-redux'
import { checkConstraintPermissions } from '../../../util/CheckConstraintFields'
import { getValueOfNumberFieldInIssue } from '../../../util/IssueFilter'
import { eyeSlashIcon } from '../../../util/icon'

export default function IssuePriority(props) {
    const dispatch = useDispatch()
    const issueInfo = props.issueInfo
    const userInfo = props.userInfo
    const projectInfo = props.projectInfo
    return (
        <div className="priority d-flex align-items-center">
            {props.editAttributeTag === 'issue_priority' ? <Select
                onBlur={() => {
                    props.handleEditAttributeTag('')
                }}
                className='info-item-field'
                style={{ width: '100%', padding: 0 }}
                placeholder={priorityTypeOptions[getValueOfNumberFieldInIssue(issueInfo, "issue_priority")]?.label}
                defaultValue={priorityTypeOptions[getValueOfNumberFieldInIssue(issueInfo, "issue_priority")]?.value}
                options={priorityTypeOptions}
                disabled={issueInfo?.creator._id !== userInfo?.id}
                onSelect={(value, option) => {
                    const old_value = `${getValueOfNumberFieldInIssue(issueInfo, 'issue_priority')}`
                    const new_value = `${value}`
                    dispatch(updateInfoIssue(issueInfo?._id, issueInfo?.project_id?._id, { issue_priority: value }, old_value, new_value, userInfo.id, "updated", "priority", projectInfo, userInfo))
                }}
                name="priority"
            /> :
                <span onDoubleClick={() => {
                    if (checkConstraintPermissions(projectInfo, issueInfo, userInfo, 1)) {
                        props.handleEditAttributeTag('issue_priority')
                    }
                }} style={{ width: '100%', color: '#7A869A' }}>{
                        checkConstraintPermissions(projectInfo, issueInfo, userInfo, 9) ? (priorityTypeOptions[getValueOfNumberFieldInIssue(issueInfo, "issue_priority")]?.label) : eyeSlashIcon
                    }</span>}
        </div>
    )
}
