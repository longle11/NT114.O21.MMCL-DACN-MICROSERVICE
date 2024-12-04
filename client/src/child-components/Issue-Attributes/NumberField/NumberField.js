import { InputNumber } from 'antd'
import React from 'react'
import { updateInfoIssue } from '../../../redux/actions/IssueAction'
import { showNotificationWithIcon } from '../../../util/NotificationUtil'
import { useDispatch } from 'react-redux'
import { checkConstraintPermissions } from '../../../util/CheckConstraintFields'
import { getValueOfNumberFieldInIssue } from '../../../util/IssueFilter'
import { eyeSlashIcon } from '../../../util/icon'

export default function NumberField(props) {
    const issueInfo = props.issueInfo
    const userInfo = props.userInfo
    const field_key_issue = props.field_key_issue
    const projectInfo = props.projectInfo
    const dispatch = useDispatch()
    return (
        <div className='d-flex align-items-center'>
            {props.editAttributeTag === field_key_issue ? <InputNumber
                className='info-item-field' min={0}
                max={1000}
                defaultValue={getValueOfNumberFieldInIssue(issueInfo, field_key_issue)}
                value={getValueOfNumberFieldInIssue(issueInfo, field_key_issue)}
                onBlur={(e) => {
                    props.handleEditAttributeTag('')
                    if (e.target.value > 0 && e.target.value <= 1000) {
                        dispatch(updateInfoIssue(issueInfo?._id.toString(), issueInfo?.project_id?._id?.toString(), { [field_key_issue]: e.target.value }, getValueOfNumberFieldInIssue(issueInfo, field_key_issue) === null ? "None" : getValueOfNumberFieldInIssue(issueInfo, field_key_issue)?.toString(), e.target.value, userInfo.id, "updated", field_key_issue, projectInfo, userInfo))
                    } else {
                        showNotificationWithIcon('error', '', 'Story point\'s value must greater than 0')
                    }
                }} /> :
                <span onDoubleClick={() => {
                    if (checkConstraintPermissions(projectInfo, issueInfo, userInfo, 1)) {
                        props.handleEditAttributeTag(field_key_issue)
                    }
                }} style={{ width: '100%', color: '#7A869A' }}>
                    {
                        checkConstraintPermissions(projectInfo, issueInfo, userInfo, 9) ? (Number.isInteger(getValueOfNumberFieldInIssue(issueInfo, field_key_issue)) ? getValueOfNumberFieldInIssue(issueInfo, field_key_issue) : "None") : eyeSlashIcon
                    }
                </span>}
        </div>
    )
}
