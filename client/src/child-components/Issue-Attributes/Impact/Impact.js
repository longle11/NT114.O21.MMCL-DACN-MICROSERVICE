import React from 'react'
import { priorityTypeOptions } from '../../../util/CommonFeatures'
import { Select } from 'antd'
import { updateInfoIssue } from '../../../redux/actions/IssueAction'
import { useDispatch } from 'react-redux'
import { checkConstraintPermissions } from '../../../util/CheckConstraintFields'
import { getValueOfStringFieldInIssue } from '../../../util/IssueFilter'
import { eyeSlashIcon } from '../../../util/icon'

export default function Impact(props) {
    const dispatch = useDispatch()
    const issueInfo = props.issueInfo
    const userInfo = props.userInfo
    const projectInfo = props.projectInfo
    return (
        <div className="priority d-flex align-items-center">
            {props.editAttributeTag === 'impact' ? <Select
                onBlur={() => {
                    props.handleEditAttributeTag('')
                }}
                className='info-item-field'
                style={{ width: '100%', padding: 0 }}
                options={projectInfo?.issue_fields_config?.find(field => field.field_key_issue === 'impact')?.default_value?.map(field => {
                    return {
                        label: field,
                        value: field,
                    }
                })}
                disabled={issueInfo?.creator._id !== userInfo?.id}
                onSelect={(value, option) => {
                    const old_value = `${getValueOfStringFieldInIssue(issueInfo, 'impact')}`
                    const new_value = `${value}`
                    dispatch(updateInfoIssue(issueInfo?._id, issueInfo?.project_id?._id, { impact: value }, old_value, new_value, userInfo.id, "updated", "impact", projectInfo, userInfo))
                }}
                name="priority"
            /> :
                <span onDoubleClick={() => {
                    if (checkConstraintPermissions(projectInfo, issueInfo, userInfo, 1)) {
                        props.handleEditAttributeTag('impact')
                    }
                }} style={{ width: '100%', color: '#7A869A' }}>{
                        checkConstraintPermissions(projectInfo, issueInfo, userInfo, 9) ? (getValueOfStringFieldInIssue(issueInfo, "impact") ? getValueOfStringFieldInIssue(issueInfo, "impact") : "None") : eyeSlashIcon
                    }</span>}
        </div>
    )
}
