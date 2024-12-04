import { Select } from 'antd'
import React from 'react'
import { useDispatch } from 'react-redux'
import { updateInfoIssue } from '../../../redux/actions/IssueAction'
import { updateSprintAction } from '../../../redux/actions/CreateProjectAction'
import { renderSprintList } from '../../../util/CommonFeatures'
import { checkConstraintPermissions } from '../../../util/CheckConstraintFields'
import { getValueOfObjectFieldInIssue } from '../../../util/IssueFilter'
import { eyeSlashIcon } from '../../../util/icon'

export default function CurrentSprint(props) {
    const issueInfo = props.issueInfo
    const sprintList = props.sprintList
    const userInfo = props.userInfo
    const projectInfo = props.projectInfo
    const id = props.id
    const dispatch = useDispatch()
    const sprintValue = getValueOfObjectFieldInIssue(issueInfo, "current_sprint")
    return (
        <div>
            <div className="reporter-sprint d-flex align-items-cente">
                {props.editAttributeTag === 'sprint' ? <Select
                    onSelect={(value, option) => {
                        //assign issue to new epic
                        dispatch(updateInfoIssue(
                            issueInfo?._id.toString(),
                            issueInfo?.project_id?._id.toString(),
                            { current_sprint: option.value },
                            sprintValue === null ? "None" : sprintValue?.sprint_name,
                            option.label,
                            userInfo.id,
                            "updated",
                            "sprint",
                            projectInfo,
                            userInfo
                        ))
                        //delete issue from old sprint
                        dispatch(updateSprintAction(sprintValue?._id, { issue_id: issueInfo?._id.toString(), project_id: issueInfo?.project_id?._id }))
                        //update new issue in new sprint
                        dispatch(updateSprintAction(option.value, { issue_id: issueInfo?._id.toString(), project_id: issueInfo?.project_id?._id }))
                        props.handleEditAttributeTag('')
                    }}
                    onBlur={() => {
                        props.handleEditAttributeTag('')
                    }}
                    style={{ width: '100%', padding: 0 }}
                    className='info-item-field'
                    options={renderSprintList(sprintList, id)}
                    defaultValue={sprintValue ? sprintValue.sprint_name : null} /> : <span onDoubleClick={() => {
                        if (checkConstraintPermissions(projectInfo, issueInfo, userInfo, 1)) {
                            props.handleEditAttributeTag('sprint')
                        }
                    }}
                        style={{ width: '100%', color: '#7A869A' }}>{checkConstraintPermissions(projectInfo, issueInfo, userInfo, 9) ? (sprintValue ? sprintValue.sprint_name : "None") : eyeSlashIcon}
                </span>}
            </div>
        </div >
    )
}
