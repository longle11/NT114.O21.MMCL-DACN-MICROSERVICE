import { InputNumber } from 'antd'
import React from 'react'
import { updateInfoIssue } from '../../../redux/actions/IssueAction'
import { showNotificationWithIcon } from '../../../util/NotificationUtil'
import { useDispatch } from 'react-redux'
import { checkConstraintPermissions } from '../../../util/CheckConstraintFields'
import { getValueOfNumberFieldInIssue } from '../../../util/IssueFilter'
import { eyeSlashIcon } from '../../../util/icon'

export default function StoryPoint(props) {
    const issueInfo = props.issueInfo
    const userInfo = props.userInfo
    const projectInfo = props.projectInfo
    const dispatch = useDispatch()
    return (
        <div className='d-flex align-items-center'>
            {props.editAttributeTag === 'story_point' ? <InputNumber 
            className='info-item-field' min={0} 
            max={1000} 
            defaultValue={getValueOfNumberFieldInIssue(issueInfo, "story_point")} 
            value={getValueOfNumberFieldInIssue(issueInfo, "story_point")}
            onBlur={(e) => {
                props.handleEditAttributeTag('')
                if (e.target.value >= 0 && e.target.value <= 1000) {
                    dispatch(updateInfoIssue(issueInfo?._id.toString(), issueInfo?.project_id?._id?.toString(), { story_point: e.target.value }, getValueOfNumberFieldInIssue(issueInfo, "story_point") === null ? "None" : getValueOfNumberFieldInIssue(issueInfo, "story_point")?.toString(), e.target.value, userInfo.id, "updated", "story point", projectInfo, userInfo))
                } else {
                    showNotificationWithIcon('error', '', 'Story point\'s value must greater than 0')
                }
            }} /> :
                <span onDoubleClick={() => {
                    if(checkConstraintPermissions(projectInfo, issueInfo, userInfo, 1)) {
                        props.handleEditAttributeTag('story_point')
                    }
                }} style={{ width: '100%', color: '#7A869A' }}>{
                    checkConstraintPermissions(projectInfo, issueInfo, userInfo, 9) ? (Number.isInteger(getValueOfNumberFieldInIssue(issueInfo, "story_point")) ? getValueOfNumberFieldInIssue(issueInfo, "story_point") : "None") : eyeSlashIcon
                }</span>}
        </div>
    )
}
