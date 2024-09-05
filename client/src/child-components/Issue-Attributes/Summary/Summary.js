import { Input } from 'antd'
import React, { useState } from 'react'
import { updateInfoIssue } from '../../../redux/actions/IssueAction'
import { showNotificationWithIcon } from '../../../util/NotificationUtil'
import { useDispatch } from 'react-redux'

export default function Summary(props) {
    const issueInfo = props.issueInfo
    const userInfo = props.userInfo
    const dispatch = useDispatch()
    const [summary, setSummary] = useState('')
    return (
        <div>
            {props.editAttributeTag === 'summary' ? <Input onChange={(e) => {
                setSummary(e.target.value)
            }}
                className="issue_summary"
                onKeyDown={(e) => {
                    if (e.key.toLowerCase() === 'enter') {
                        if (summary.trim() === "") {
                            showNotificationWithIcon('error', '', "Summary can't be left blank")
                        } else {
                            dispatch(updateInfoIssue(issueInfo?._id, issueInfo.project_id, { summary: summary }, null, null, userInfo.id, "updated", "summary"))
                            props.handleEditAttributeTag('')
                        }
                    }
                }}
                onBlur={() => {
                    if (summary.trim() === "") {
                        showNotificationWithIcon('error', '', "Summary can't be left blank")
                    } else {
                        dispatch(updateInfoIssue(issueInfo?._id, issueInfo.project_id, { summary: summary }, null, null, userInfo.id, "updated", "summary"))
                        props.handleEditAttributeTag('')
                    }
                }}
                defaultValue={issueInfo?.summary} /> :
            <span onDoubleClick={() => {
                props.handleEditAttributeTag('summary')
                setSummary(issueInfo?.summary)
            }} className='items-attribute m-0' style={{ padding: '10px 20px 10px 5px', width: '100%', display: 'block', fontSize: '24px', fontWeight: 'bold' }}>{issueInfo?.summary}</span>}
        </div>
    )
}
