import React from 'react'
import { Select } from 'antd'
import { updateInfoIssue } from '../../../redux/actions/IssueAction'
import { useDispatch } from 'react-redux'
import { checkConstraintPermissions } from '../../../util/CheckConstraintFields'
import { getValueOfStringFieldInIssue } from '../../../util/IssueFilter'
import { eyeSlashIcon } from '../../../util/icon'

export default function DropDownField(props) {
    const dispatch = useDispatch()
    const issueInfo = props.issueInfo
    const userInfo = props.userInfo
    const field_name = props.field_name
    const field_key_issue = props.field_key_issue
    const projectInfo = props.projectInfo
    return (
        <div className="d-flex align-items-center">
            {props.editAttributeTag === field_key_issue ? <Select
                onBlur={() => {
                    props.handleEditAttributeTag('')
                }}
                className='info-item-field'
                style={{ width: '100%', padding: 0 }}
                options={projectInfo?.issue_fields_config?.find(field => field.field_key_issue === field_key_issue)?.default_value?.map(field => {
                    return {
                        label: field,
                        value: field,
                    }
                })}
                disabled={issueInfo?.creator._id !== userInfo?.id}
                onSelect={(value, option) => {
                    const old_value = `${getValueOfStringFieldInIssue(issueInfo, field_key_issue)}`
                    const new_value = `${value}`
                    dispatch(updateInfoIssue(issueInfo?._id, issueInfo?.project_id?._id, { [field_key_issue]: value }, old_value, new_value, userInfo.id, "updated", field_name, projectInfo, userInfo))
                }}
            /> :
                <span onDoubleClick={() => {
                    if (checkConstraintPermissions(projectInfo, issueInfo, userInfo, 1)) {
                        props.handleEditAttributeTag(field_key_issue)
                    }

                }} style={{ width: '100%', color: '#7A869A' }}>{
                        checkConstraintPermissions(projectInfo, issueInfo, userInfo, 9) ?
                            (getValueOfStringFieldInIssue(issueInfo, field_key_issue) ? getValueOfStringFieldInIssue(issueInfo, field_key_issue) : "None") : eyeSlashIcon
                    }</span>}
        </div>
    )
}
