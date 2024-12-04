import { Input } from 'antd'
import React, { useEffect, useState } from 'react'
import { updateInfoIssue } from '../../../redux/actions/IssueAction'
import { showNotificationWithIcon } from '../../../util/NotificationUtil'
import { useDispatch } from 'react-redux'
import { checkConstraintPermissions } from '../../../util/CheckConstraintFields'
import { getValueOfStringFieldInIssue } from '../../../util/IssueFilter'
import { eyeSlashIcon } from '../../../util/icon'

export default function ShortTextField(props) {
    const issueInfo = props.issueInfo
    const userInfo = props.userInfo
    const field_key_issue = props.field_key_issue
    const projectInfo = props.projectInfo
    const dispatch = useDispatch()
    const [editAttributeTag, setEditAttributeTag] = useState("")
    const [shortText, setShortText] = useState('')
    useEffect(() => { }, [shortText])
    return (
        <div>
            {editAttributeTag === 'shortText' ? <Input
                onChange={(e) => {
                    setShortText(e.target.value)
                }}
                className="issue_shortText mt-2"
                onKeyDown={(e) => {
                    if (e.key.toLowerCase() === 'enter') {
                        if (shortText.trim() === "") {
                            showNotificationWithIcon('error', '', "ShortText can't be left blank")
                        } else {
                            if (shortText.trim() !== getValueOfStringFieldInIssue(issueInfo, field_key_issue)?.trim()) {
                                dispatch(updateInfoIssue(issueInfo?._id, issueInfo.project_id._id, { [field_key_issue]: shortText }, null, null, userInfo.id, "updated", field_key_issue, projectInfo, userInfo))
                            }
                            setEditAttributeTag('')
                        }
                    }
                }}
                onBlur={() => {
                    if (shortText.trim() === "") {
                        showNotificationWithIcon('error', '', "ShortText can't be left blank")
                    } else {
                        if (shortText.trim() !== getValueOfStringFieldInIssue(issueInfo, field_key_issue)?.trim()) {
                            dispatch(updateInfoIssue(issueInfo?._id, issueInfo.project_id._id, { [field_key_issue]: shortText }, null, null, userInfo.id, "updated", field_key_issue, projectInfo, userInfo))
                        }
                        setEditAttributeTag('')
                    }
                }}
                defaultValue={getValueOfStringFieldInIssue(issueInfo, field_key_issue)} /> :
                <span onDoubleClick={() => {
                    if (checkConstraintPermissions(projectInfo, issueInfo, userInfo, 1)) {
                        setEditAttributeTag('shortText')
                        setShortText(getValueOfStringFieldInIssue(issueInfo, field_key_issue))
                    }
                }} className='item-value_field m-0' style={{ width: '100%', display: 'block', fontSize: 13, fontWeight: 'bold' }}>
                    {
                        checkConstraintPermissions(projectInfo, issueInfo, userInfo, 9) ? (getValueOfStringFieldInIssue(issueInfo, field_key_issue) ? getValueOfStringFieldInIssue(issueInfo, field_key_issue) : "None") : eyeSlashIcon
                    }
                </span>}
        </div>
    )
}
