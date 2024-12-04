import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { handleClickOk } from '../../../redux/actions/ModalAction'
import { iTagForIssueTypes } from '../../../util/CommonFeatures'
import { Select } from 'antd'
import { updateInfoIssue } from '../../../redux/actions/IssueAction'
import { updateEpic } from '../../../redux/actions/CategoryAction'
import { getValueOfObjectFieldInIssue } from '../../../util/IssueFilter'

export default function AddParentModal(props) {
    const issue = props.issue
    const userInfo = props.userInfo
    const epicList = props.epicList
    const projectInfo = props.projectInfo
    const dispatch = useDispatch()
    const [chooseEpic, handleChooseEpic] = useState(null)
    useEffect(() => {
        dispatch(handleClickOk(handleSelectIssueOk))
    }, [chooseEpic])
    const handleSelectIssueOk = () => {
        const getIndexNewEpic = epicList.findIndex(epic => epic._id === chooseEpic)
        dispatch(updateInfoIssue(issue._id, issue.project_id._id, { epic_link: chooseEpic }, getValueOfObjectFieldInIssue(issue, 'epic_link') ? getValueOfObjectFieldInIssue(issue, 'epic_link').epic_name : "None", epicList[getIndexNewEpic].epic_name, userInfo.id, "updated", "epic"))
        dispatch(updateEpic(chooseEpic, { issue_id: issue._id, epic_id: getValueOfObjectFieldInIssue(issue, 'epic_link') ? getValueOfObjectFieldInIssue(issue, 'epic_link')._id : null }, issue.project_id._id))
    }
    return (
        <div>
            <p>Select a parent issue for this issue. Issues can only belong to one parent issue at a time.</p>
            <div className='d-flex flex-column'>
                <label className='font-weight-bold' htmlFor='epic_link'>Epic</label>
                <Select onSelect={(value) => {
                    handleChooseEpic(value)
                }} style={{width: '100%'}} defaultValue={getValueOfObjectFieldInIssue(issue, 'epic_link') ? getValueOfObjectFieldInIssue(issue, 'epic_link').epic_name : null} options={epicList.filter(epic => epic._id !== (getValueOfObjectFieldInIssue(issue, 'epic_link') ? getValueOfObjectFieldInIssue(issue, 'epic_link')._id : null)).map(epic => {
                    return {
                        label: <div className='d-flex align-items-center'>
                            <span>{iTagForIssueTypes(3, null, null, projectInfo?.issue_types_default)}</span>
                            <span>{epic.epic_name}</span>
                        </div>,
                        value: epic._id
                    }
                })}/>
            </div>
        </div>
    )
}
