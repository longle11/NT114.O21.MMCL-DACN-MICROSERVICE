import { InputNumber } from 'antd'
import React from 'react'
import { updateInfoIssue } from '../../../redux/actions/IssueAction'
import { showNotificationWithIcon } from '../../../util/NotificationUtil'
import { useDispatch } from 'react-redux'
import { checkConstraintPermissions } from '../../../util/CheckConstraintFields'

export default function StoryPoint(props) {
    const issueInfo = props.issueInfo
    const userInfo = props.userInfo
    const projectInfo = props.projectInfo
    const dispatch = useDispatch()
    return (
        <div className='row d-flex align-items-center mt-2'>
            <span className='col-4' style={{ fontSize: 14, color: '#42526e', fontWeight: '500' }}>Story point</span>
            {props.editAttributeTag === 'story_point' ? <InputNumber className='col-7' min={0} max={1000} defaultValue={issueInfo?.story_point} value={issueInfo?.story_point} onBlur={(e) => {
                props.handleEditAttributeTag('')
                if (e.target.value > 0 && e.target.value <= 1000) {
                    dispatch(updateInfoIssue(issueInfo?._id.toString(), issueInfo?.project_id?._id?.toString(), { story_point: e.target.value }, issueInfo?.story_point === null ? "None" : issueInfo?.story_point?.toString(), e.target.value, userInfo.id, "updated", "story point"))
                } else {
                    showNotificationWithIcon('error', '', 'Story point\'s value must greater than 0')
                }
            }} /> :
                <span onDoubleClick={() => {
                    if(checkConstraintPermissions(projectInfo, issueInfo, userInfo, 7)) {
                        props.handleEditAttributeTag('story_point')
                    }
                }} className='items-attribute col-7' style={{ padding: '10px 10px', width: '100%', color: '#7A869A' }}>{Number.isInteger(issueInfo?.story_point) ? issueInfo?.story_point : "None"}</span>}
        </div>
    )
}
