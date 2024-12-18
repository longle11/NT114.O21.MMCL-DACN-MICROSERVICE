import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { handleClickOk, openModal } from '../../../redux/actions/ModalAction'
import { Input, Select } from 'antd';
import { defaultForIssueType, issueTypeOptions } from '../../../util/CommonFeatures';
import { createIssue } from '../../../redux/actions/IssueAction';
import { attributesFiltering } from '../../../util/IssueAttributesCreating';

const { TextArea } = Input;
export default function IssueCreatingModal(props) {
    const startDate = props.startDate
    const endDate = props.endDate
    const userInfo = props.userInfo
    const projectId = props.projectId
    const workflowList = props.workflowList
    const processList = props.processList
    const projectInfo = props.projectInfo

    const dispatch = useDispatch()
    const [editSummary, setEditSummary] = useState('')
    const [editIssueStatus, setEditIssueStatus] = useState(0)
    useEffect(() => {
        dispatch(handleClickOk(handleSelectIssueOk))
    }, [editSummary, editIssueStatus])
    const handleSelectIssueOk = () => {
        if (editSummary.trim() !== "") {
            dispatch(createIssue(attributesFiltering(
                projectInfo,
                {
                    project_id: projectId,
                    issue_status: editIssueStatus,
                    summary: editSummary,
                    creator: userInfo.id,
                    start_date: startDate,
                    end_date: endDate,
                    issue_type: defaultForIssueType(editIssueStatus, workflowList, processList),
                    current_sprint: null
                }
            ), projectId, userInfo.id, null, null, projectInfo, userInfo))
            setEditSummary('')
            setEditIssueStatus(0)
        }
        dispatch(openModal(false))
    }
    return (
        <div className='mt-4'>
            <TextArea
                rows={4}
                onChange={(e) => {
                    setEditSummary(e.target.value)
                }}
                placeholder="What needs to be done?"
            />
            <div className='d-flex align-items-center mt-2'>
                <Select className='issue_creating_modal-edit-select-ant' style={{ borderRadius: 0 }}
                    defaultValue={issueTypeOptions(projectInfo?.issue_types_default)[0].value}
                    onChange={(value, option) => {
                        setEditIssueStatus(value)
                    }}
                    options={issueTypeOptions(projectInfo?.issue_types_default)?.filter(status => [0, 1, 2].includes(status.value))} />
            </div>
        </div>
    )
}
