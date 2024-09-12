import { Select } from 'antd'
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { updateInfoIssue } from '../../../redux/actions/IssueAction'
import { updateSprintAction } from '../../../redux/actions/CreateProjectAction'
import { renderSprintList } from '../../../util/CommonFeatures'
import { checkConstraintPermissions } from '../../../util/CheckConstraintFields'

export default function CurrentSprint(props) {
    const issueInfo = props.issueInfo
    const sprintList = props.sprintList
    const userInfo = props.userInfo
    const projectInfo = props.projectInfo
    const id = props.id
    const dispatch = useDispatch()
    const [editAttributeTag, setEditAttributeTag] = useState('')

    return (
        <div>
            <div className="reporter-sprint row d-flex align-items-center">
                <span className='col-4' style={{ fontSize: 14, color: '#42526e', fontWeight: '500' }}>Sprint</span>
                {editAttributeTag === 'sprint' ? <Select
                    onSelect={(value, option) => {
                        //assign issue to new epic
                        dispatch(updateInfoIssue(issueInfo?._id.toString(), issueInfo?.project_id?._id.toString(), { current_sprint: value }, issueInfo?.current_sprint === null ? "None" : issueInfo?.current_sprint?.sprint_name, option.label, userInfo.id, "updated", "sprint"))
                        //delete issue from old sprint
                        dispatch(updateSprintAction(issueInfo?.current_sprint?._id, { issue_id: issueInfo?._id.toString(), project_id: issueInfo?.project_id?._id }))
                        //update new issue in new sprint
                        dispatch(updateSprintAction(value, { issue_id: issueInfo?._id.toString(), project_id: issueInfo?.project_id?._id }))

                    }}
                    style={{ width: '50%' }}
                    options={renderSprintList(sprintList, id)} onBlur={() => {
                        setEditAttributeTag('')
                    }}
                    defaultValue={issueInfo?.current_sprint ? issueInfo?.current_sprint.sprint_name : null} /> : <span onDoubleClick={() => {
                        if (checkConstraintPermissions(projectInfo, issueInfo, userInfo, 8)) {
                            props.handleEditAttributeTag('sprint')
                        }
                    }} className='items-attribute col-7' style={{ padding: '10px 10px', width: '100%', color: '#7A869A' }}>{issueInfo?.current_sprint ? issueInfo?.current_sprint.sprint_name : "None"}</span>}
            </div>
        </div >
    )
}
