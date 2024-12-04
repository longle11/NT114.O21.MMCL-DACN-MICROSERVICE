import React, { useState } from 'react'
import { Select, Button } from 'antd'
import { updateInfoIssue } from '../../../redux/actions/IssueAction'
import { useDispatch } from 'react-redux'
import { checkConstraintPermissions } from '../../../util/CheckConstraintFields'
import { getValueOfStringFieldInIssue } from '../../../util/IssueFilter'
import { eyeSlashIcon } from '../../../util/icon'

export default function ChangeType(props) {
    const dispatch = useDispatch()
    const issueInfo = props.issueInfo
    const userInfo = props.userInfo
    const projectInfo = props.projectInfo
    const [optionValue, setOptionValue] = useState(null)
    return (
        <div className="priority d-flex align-items-center">
            {props.editAttributeTag === 'change_type' ? <div style={{ position: 'relative', padding: 0 }}>
                <Select
                    onBlur={() => {
                        props.handleEditAttributeTag('')
                    }}
                    className='info-item-field'
                    style={{ width: '100%', padding: 0 }}
                    options={projectInfo?.issue_fields_config?.find(field => field.field_key_issue === 'change_type')?.default_value?.map(field => {
                        return {
                            label: field,
                            value: field,
                        }
                    })}
                    disabled={issueInfo?.creator._id !== userInfo?.id}
                    onSelect={(value, option) => {
                        setOptionValue(value)
                    }}
                    name="change_type"
                />
                <div style={{ position: 'absolute', right: 0, marginTop: 5, zIndex: 99999999 }}>
                    <Button onClick={(e) => {
                        e.stopPropagation()
                        const old_value = `${getValueOfStringFieldInIssue(issueInfo, 'change_type')}`
                        const new_value = `${optionValue}`
                        dispatch(updateInfoIssue(issueInfo?._id, issueInfo?.project_id?._id, { change_type: optionValue }, old_value, new_value, userInfo.id, "updated", "change type", projectInfo, userInfo))
                        props.handleEditAttributeTag("")
                    }} type='primary' className='mr-1'><i className="fa fa-check"></i></Button>
                    <Button onClick={(e) => {
                        e.stopPropagation()
                        props.handleEditAttributeTag("")
                    }}><i className="fa fa-times"></i></Button>
                </div>
            </div> :
                <span onDoubleClick={() => {
                    if (checkConstraintPermissions(projectInfo, issueInfo, userInfo, 1)) {
                        props.handleEditAttributeTag('change_type')
                    }
                }} style={{ width: '100%', color: '#7A869A' }}>{
                        checkConstraintPermissions(projectInfo, issueInfo, userInfo, 9) ?
                            (getValueOfStringFieldInIssue(issueInfo, "change_type") ? getValueOfStringFieldInIssue(issueInfo, "change_type") : "None") : eyeSlashIcon
                    }</span>}
        </div>
    )
}
