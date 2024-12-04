import { Button, DatePicker } from 'antd'
import dayjs from 'dayjs'
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { updateInfoIssue } from '../../../redux/actions/IssueAction'
import { getValueOfStringFieldInIssue } from '../../../util/IssueFilter'
import { checkConstraintPermissions } from '../../../util/CheckConstraintFields'
import { eyeSlashIcon } from '../../../util/icon'

export default function ActualStartEndDate(props) {
    const date = props.date
    const type_date = props.type_date
    const issueInfo = props.issueInfo
    const projectInfo = props.projectInfo
    const userInfo = props.userInfo
    const [getDate, setGetDate] = useState(dayjs())
    const dispatch = useDispatch()
    return (
        <div className='d-flex align-items-center'>
            {props.editAttributeTag === type_date ? <div style={{ position: 'relative', padding: 0 }}>
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
                        if (type_date === "actual_start") {
                            dispatch(updateInfoIssue(issueInfo._id, issueInfo.project_id._id, { actual_start: getDate.toISOString() }, getValueOfStringFieldInIssue(issueInfo, "actual_start") ? dayjs(getValueOfStringFieldInIssue(issueInfo, "actual_start")).format('DD/MM/YYYY hh:mm A') : "None", getDate.format('DD/MM/YYYY hh:mm A'), userInfo.id, "updated", "Actual Start", projectInfo, userInfo))
                        } else {
                            dispatch(updateInfoIssue(issueInfo._id, issueInfo.project_id._id, { actual_end: getDate.toISOString() }, getValueOfStringFieldInIssue(issueInfo, "actual_end") ? dayjs(getValueOfStringFieldInIssue(issueInfo, "actual_end")).format('DD/MM/YYYY hh:mm A') : "None", getDate.format('DD/MM/YYYY hh:mm A'), userInfo.id, "updated", "Actual End", projectInfo, userInfo))
                        }
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
                        props.handleEditAttributeTag(type_date)
                    }
                }} style={{ color: '#7A869A' }}>
                    {
                        checkConstraintPermissions(projectInfo, issueInfo, userInfo, 9) ?
                            (date ? dayjs(date).format("DD/MM/YYYY hh:mm A") : "None") : eyeSlashIcon
                    }
                </span>}
        </div>
    )
}
