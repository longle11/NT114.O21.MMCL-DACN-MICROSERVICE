import { Select } from 'antd'
import React from 'react'
import { useDispatch } from 'react-redux'
import { updateInfoIssue } from '../../../redux/actions/IssueAction'
import { updateEpic } from '../../../redux/actions/CategoryAction'
import { renderEpicList } from '../../../util/CommonFeatures'
import { checkConstraintPermissions } from '../../../util/CheckConstraintFields'
import { getValueOfObjectFieldInIssue } from '../../../util/IssueFilter'
import { eyeSlashIcon } from '../../../util/icon'

export default function EpicLink(props) {
    const issueInfo = props.issueInfo
    const userInfo = props.userInfo
    const id = props.id
    const epicList = props.epicList
    const projectInfo = props.projectInfo
    const dispatch = useDispatch()
    const getCurrentEpic = () => {
        if (getValueOfObjectFieldInIssue(issueInfo, "epic_link") === null) {
            return null
        }
        return epicList?.findIndex(epic => epic._id.toString() === getValueOfObjectFieldInIssue(issueInfo, "epic_link")?._id.toString())
    }
    return (
        <div className='epic-version d-flex align-items-center'>
            {props.editAttributeTag === 'epic_link' ? <Select
                className="info-item-field"
                style={{ width: '100%', padding: 0 }}
                options={renderEpicList(epicList, id)}
                onBlur={() => {
                    props.handleEditAttributeTag('')
                }}
                onChange={(value, props) => {
                    //assign issue to new epic
                    dispatch(updateInfoIssue(issueInfo?._id.toString(), issueInfo?.project_id?._id.toString(), { epic_link: value }, getValueOfObjectFieldInIssue(issueInfo, "epic_link") === null ? "None" : getValueOfObjectFieldInIssue(issueInfo, "epic_link").epic_name, props.label, userInfo.id, "updated", "epic link", projectInfo, userInfo))
                    //update new issue in epic
                    dispatch(updateEpic(value, { issue_id: issueInfo?._id.toString(), epic_id: getValueOfObjectFieldInIssue(issueInfo, "epic_link") === null ? null : getValueOfObjectFieldInIssue(issueInfo, "epic_link")._id.toString() }, issueInfo?.project_id?._id.toString()))
                }}
                value={getValueOfObjectFieldInIssue(issueInfo, "epic_link")?.epic_name}
            /> :
                <span onDoubleClick={() => {
                    if (checkConstraintPermissions(projectInfo, issueInfo, userInfo, 1)) {
                        props.handleEditAttributeTag('epic_link')
                    }
                }} style={{ width: '100%', color: '#7A869A' }}>{
                        checkConstraintPermissions(projectInfo, issueInfo, userInfo, 9) ? (getCurrentEpic() !== null ? renderEpicList(epicList, id)[getCurrentEpic()]?.label : "None") : eyeSlashIcon
                    }</span>}
        </div>
    )
}
