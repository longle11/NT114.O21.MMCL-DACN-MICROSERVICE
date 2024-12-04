import React, { useEffect, useState } from 'react'
import { priorityTypeOptions } from '../../../util/CommonFeatures'
import { Select, Button } from 'antd'
import { updateInfoIssue } from '../../../redux/actions/IssueAction'
import { useDispatch } from 'react-redux'
import { checkConstraintPermissions } from '../../../util/CheckConstraintFields'
import { getValueOfStringFieldInIssue } from '../../../util/IssueFilter'
import { eyeSlashIcon } from '../../../util/icon'

export default function ChangeReason(props) {
    const dispatch = useDispatch()
    const issueInfo = props.issueInfo
    const userInfo = props.userInfo
    const projectInfo = props.projectInfo
    return (
        <div className="priority d-flex align-items-center" style={{width: '100%'}}>
            {props.editAttributeTag === 'change_reason' ? <div style={{ padding: 0, width: '100%' }}>
                <Select
                    onBlur={() => {
                        props.handleEditAttributeTag('')
                    }}
                    className='info-item-field'
                    style={{ width: '100%', padding: 0 }}
                    options={projectInfo?.issue_fields_config?.find(field => field.field_key_issue === 'change_reason')?.default_value?.map(field => {
                        return {
                            label: field,
                            value: field,
                        }
                    })}
                    disabled={issueInfo?.creator._id !== userInfo?.id}
                    onSelect={(value, option) => {
                        const old_value = `${getValueOfStringFieldInIssue(issueInfo, 'change_reason')}`
                        const new_value = `${value}`
                        dispatch(updateInfoIssue(issueInfo?._id, issueInfo?.project_id?._id, { change_reason: value }, old_value, new_value, userInfo.id, "updated", "change reason", projectInfo, userInfo))
                        props.handleEditAttributeTag("")
                    }}
                    name="changeReason"
                />
            </div> :
                <span onDoubleClick={() => {
                    if (checkConstraintPermissions(projectInfo, issueInfo, userInfo, 1)) {
                        props.handleEditAttributeTag('change_reason')
                    }

                }} style={{ width: '100%', color: '#7A869A' }}>{
                    checkConstraintPermissions(projectInfo, issueInfo, userInfo, 9) ? (getValueOfStringFieldInIssue(issueInfo, "change_reason") ? getValueOfStringFieldInIssue(issueInfo, "change_reason") : "None") : eyeSlashIcon
                }</span>}
        </div>
    )
}
