import { Input } from 'antd'
import React, { useEffect, useState } from 'react'
import { updateInfoIssue } from '../../../redux/actions/IssueAction'
import { showNotificationWithIcon } from '../../../util/NotificationUtil'
import { useDispatch } from 'react-redux'
import { checkConstraintPermissions } from '../../../util/CheckConstraintFields'

export default function Summary(props) {
    const issueInfo = props.issueInfo
    const userInfo = props.userInfo
    const projectInfo = props.projectInfo
    const dispatch = useDispatch()
    const [editAttributeTag, setEditAttributeTag] = useState("")
    const [summary, setSummary] = useState('')
    useEffect(() => { }, [summary])
    return (
        <div>
            {editAttributeTag === 'summary' ? <Input
                onChange={(e) => {
                    setSummary(e.target.value)
                }}
                className="issue_summary mt-2"
                onKeyDown={(e) => {
                    if (e.key.toLowerCase() === 'enter') {
                        if (summary.trim() === "") {
                            showNotificationWithIcon('error', '', "Summary can't be left blank")
                        } else {
                            if (summary.trim() !== issueInfo.summary.trim()) {
                                dispatch(updateInfoIssue(issueInfo?._id, issueInfo.project_id._id, { summary: summary }, null, null, userInfo.id, "updated", "summary"))
                            }
                            setEditAttributeTag('')
                        }
                    }
                }}
                onBlur={() => {
                    if (summary.trim() === "") {
                        showNotificationWithIcon('error', '', "Summary can't be left blank")
                    } else {
                        if (summary.trim() !== issueInfo.summary.trim()) {
                            dispatch(updateInfoIssue(issueInfo?._id, issueInfo.project_id._id, { summary: summary }, null, null, userInfo.id, "updated", "summary"))
                        }
                        setEditAttributeTag('')
                    }
                }}
                defaultValue={issueInfo?.summary} /> :
                <span onDoubleClick={() => {
                    if (checkConstraintPermissions(projectInfo, issueInfo, userInfo, 0)) {
                        setEditAttributeTag('summary')
                        setSummary(issueInfo?.summary)
                    }
                }} className='items-attribute m-0 mt-2' style={{ width: '100%', display: 'block', fontSize: '24px', fontWeight: 'bold' }}>{issueInfo?.summary}</span>}
        </div>
    )
}
