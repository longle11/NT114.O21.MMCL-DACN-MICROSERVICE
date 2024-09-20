import { Button, DatePicker } from 'antd'
import dayjs from 'dayjs'
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { updateInfoIssue } from '../../../redux/actions/IssueAction'

export default function StartEndDate(props) {
    const date = props.date
    const name_date = props.name_date
    const type_date = props.type_date
    const issueInfo = props.issueInfo
    const projectInfo = props.projectInfo
    const userInfo = props.userInfo
    const [getDate, setGetDate] = useState(dayjs())
    const dispatch = useDispatch()
    return (
        <div className='row d-flex align-items-center mt-2'>
            <span className='col-4' style={{ fontSize: 14, color: '#42526e', fontWeight: '500' }}>{name_date}</span>
            {props.editAttributeTag === type_date ? <div className='col-7' style={{ position: 'relative', padding: 0 }}>
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
                        if (type_date === "start_date") {
                            dispatch(updateInfoIssue(issueInfo._id, issueInfo.project_id._id, { start_date: getDate.toISOString() }, issueInfo.start_date ? dayjs(issueInfo.start_date).format('DD/MM/YYYY hh:mm A') : "None", getDate.format('DD/MM/YYYY hh:mm A'), userInfo.id, "updated", "Start Date", projectInfo, userInfo))
                        } else {
                            dispatch(updateInfoIssue(issueInfo._id, issueInfo.project_id._id, { end_date: getDate.toISOString() }, issueInfo.end_date ? dayjs(issueInfo.end_date).format('DD/MM/YYYY hh:mm A') : "None", getDate.format('DD/MM/YYYY hh:mm A'), userInfo.id, "updated", "End Date", projectInfo, userInfo))
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
                    // if(checkConstraintPermissions(projectInfo, issueInfo, userInfo, 7)) {
                    //     props.handleEditAttributeTag('story_point')
                    // }
                    props.handleEditAttributeTag(type_date)
                }} className='items-attribute col-7' style={{ padding: '10px 10px', width: '100%', color: '#7A869A' }}>{date ? dayjs(date).format("DD/MM/YYYY hh:mm A") : "None"}</span>}
        </div>
    )
}
