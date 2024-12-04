import React, { useState } from 'react'
import { Select, Button } from 'antd'
import { updateInfoIssue } from '../../../redux/actions/IssueAction'
import { useDispatch } from 'react-redux'
import { checkConstraintPermissions } from '../../../util/CheckConstraintFields'
import { getValueOfStringFieldInIssue } from '../../../util/IssueFilter'
import { eyeSlashIcon } from '../../../util/icon'

export default function ChangeRisk(props) {
    const dispatch = useDispatch()
    const issueInfo = props.issueInfo
    const userInfo = props.userInfo
    const projectInfo = props.projectInfo

    return (
        <div className="priority d-flex align-items-center">
            {props.editAttributeTag === 'change_risk' ? <div style={{ padding: 0, width: '100%' }}>
                <Select
                    onBlur={() => {
                        props.handleEditAttributeTag('')
                    }}
                    className='info-item-field'
                    style={{ width: '100%', padding: 0 }}
                    options={projectInfo?.issue_fields_config?.find(field => field.field_key_issue === 'change_risk')?.default_value?.map(field => {
                        return {
                            label: field,
                            value: field,
                        }
                    })}
                    disabled={issueInfo?.creator._id !== userInfo?.id}
                    onSelect={(value, option) => {
                        const old_value = `${getValueOfStringFieldInIssue(issueInfo, 'change_risk')}`
                        const new_value = `${value}`
                        dispatch(updateInfoIssue(issueInfo?._id, issueInfo?.project_id?._id, { change_risk: value }, old_value, new_value, userInfo.id, "updated", "change risk", projectInfo, userInfo))
                        props.handleEditAttributeTag("")
                    }}
                    name="change_risk"
                />
            </div> :
                <span onDoubleClick={() => {
                    if (checkConstraintPermissions(projectInfo, issueInfo, userInfo, 1)) {
                        props.handleEditAttributeTag('change_risk')
                    }
                }} style={{ width: '100%', color: '#7A869A' }}>{
                        checkConstraintPermissions(projectInfo, issueInfo, userInfo, 9) ?
                            (getValueOfStringFieldInIssue(issueInfo, "change_risk") ? getValueOfStringFieldInIssue(issueInfo, "change_risk") : "None") : eyeSlashIcon
                    }
                </span>}
        </div>
    )
}
