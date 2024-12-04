import React from 'react'
import { iTagForIssueTypes } from '../../../util/CommonFeatures'
import { Tag } from 'antd'
import { NavLink } from 'react-router-dom'
import { getValueOfNumberFieldInIssue, getValueOfStringFieldInIssue } from '../../../util/IssueFilter'
import { checkConstraintPermissions } from '../../../util/CheckConstraintFields'
import { eyeSlashIcon } from '../../../util/icon'

export default function Parent(props) {
    const issueParentInfo = props.issueParentInfo
    const projectInfo = props.projectInfo
    const issueInfo = props.issueInfo
    const userInfo = props.userInfo
    return (
        <div className="priority d-flex align-items-center mb-0" style={{ marginBottom: 20 }}>
            {checkConstraintPermissions(projectInfo, issueInfo, userInfo, 9) ? (issueParentInfo ? <Tag className='items-attribute' style={{ padding: '5px 20px' }}>
                <span>{iTagForIssueTypes(getValueOfNumberFieldInIssue(issueParentInfo, "issue_status"), null, null, projectInfo?.issue_types_default)}</span>
                <NavLink onClick={() => {
                    window.location.reload()
                }} to={`/projectDetail/${issueParentInfo?.project_id}/issues/issue-detail/${issueParentInfo?._id}`}>WD-{issueParentInfo?.ordinal_number} {getValueOfStringFieldInIssue(issueParentInfo, "summary")}</NavLink>
            </Tag> : <Tag style={{ padding: '5px 20px' }}>None</Tag>) : eyeSlashIcon}
        </div>
    )
}
