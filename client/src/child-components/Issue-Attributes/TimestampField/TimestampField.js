import { Button, DatePicker } from 'antd'
import dayjs from 'dayjs'
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { updateInfoIssue } from '../../../redux/actions/IssueAction'
import { getValueOfStringFieldInIssue } from '../../../util/IssueFilter'
import { checkConstraintPermissions } from '../../../util/CheckConstraintFields'
import { eyeSlashIcon } from '../../../util/icon'

export default function TimeStampField(props) {
    const date = props.date
    const issueInfo = props.issueInfo
    const field_key_issue = props.field_key_issue
    const projectInfo = props.projectInfo
    const userInfo = props.userInfo
    const [getDate, setGetDate] = useState(dayjs())
    const dispatch = useDispatch()
    return (
        <div className='d-flex align-items-center'>
            {props.editAttributeTag === field_key_issue ? <div style={{ position: 'relative', padding: 0 }}>
                <DatePicker
                    showTime={true}
                    style={{ borderRadius: 0, width: '100%' }}
                    defaultValue={date ? dayjs(date) : getDate}
                    value={getDate}
                    onChange={(e, dateString) => {
                        setGetDate(dayjs(dateString))
                    }} />
                <div style={{ position: 'absolute', right: 0, marginTop: 5, zIndex: 99999999 }}>
                    <Button onClick={(e) => {
                        e.stopPropagation()
                        dispatch(updateInfoIssue(
                            issueInfo._id,
                            issueInfo.project_id._id,
                            { [field_key_issue]: getDate.toISOString() },
                            getValueOfStringFieldInIssue(issueInfo, field_key_issue) ? dayjs(getValueOfStringFieldInIssue(issueInfo, field_key_issue)).format('DD/MM/YYYY hh:mm A') : "None",
                            getDate.format('DD/MM/YYYY hh:mm A'),
                            userInfo.id,
                            "updated",
                            field_key_issue,
                            projectInfo,
                            userInfo
                        ))
                        props.handleEditAttributeTag("")
                        setGetDate(dayjs())
                    }} type='primary' className='mr-1'><i className="fa fa-check"></i></Button>
                    <Button onClick={(e) => {
                        e.stopPropagation()
                        props.handleEditAttributeTag("")
                        setGetDate(dayjs())
                    }}><i className="fa fa-times"></i></Button>
                </div>
            </div> :
                <span onDoubleClick={() => {
                    if (checkConstraintPermissions(projectInfo, issueInfo, userInfo, 1)) {
                        props.handleEditAttributeTag(field_key_issue)
                    }
                }} style={{ color: '#7A869A' }}>{
                        checkConstraintPermissions(projectInfo, issueInfo, userInfo, 1) ? (date ? dayjs(date).format("DD/MM/YYYY hh:mm A") : "None") : eyeSlashIcon
                    }</span>}
        </div>
    )
}
