import { Select } from 'antd'
import React from 'react'
import { useDispatch } from 'react-redux'
import { updateInfoIssue } from '../../../redux/actions/IssueAction'
import { updateVersion } from '../../../redux/actions/CategoryAction'
import { renderVersionList } from '../../../util/CommonFeatures'
import { checkConstraintPermissions } from '../../../util/CheckConstraintFields'
import { getValueOfObjectFieldInIssue } from '../../../util/IssueFilter'
import { eyeSlashIcon } from '../../../util/icon'

export default function FixVersion(props) {
    const issueInfo = props.issueInfo
    const userInfo = props.userInfo
    const projectInfo = props.projectInfo
    const id = props.id
    const versionList = props.versionList
    const dispatch = useDispatch()
    return (
        <div className='d-flex align-items-center'>
            {props.editAttributeTag === 'fix_version' ? <Select
                options={renderVersionList(versionList, id)}
                className='info-item-field'
                style={{ width: '100%', padding: 0 }}
                value={getValueOfObjectFieldInIssue(issueInfo, "fix_version")?._id}
                onSelect={(value, option) => {
                    dispatch(updateInfoIssue(issueInfo?._id, issueInfo?.project_id?._id, { fix_version: value }, getValueOfObjectFieldInIssue(issueInfo, "fix_version") ? getValueOfObjectFieldInIssue(issueInfo, "fix_version")?.version_name : "None", option.label, userInfo.id, "updated", "fix version", projectInfo, userInfo))
                    //update new issue in versio
                    dispatch(updateVersion(value, { issue_id: issueInfo?._id.toString(), version_id: getValueOfObjectFieldInIssue(issueInfo, "fix_version") === null ? null : getValueOfObjectFieldInIssue(issueInfo, "fix_version")._id.toString() }, issueInfo?.project_id?._id.toString()))
                }}
                onBlur={() => {
                    props.handleEditAttributeTag('')
                }}
            /> :
                <span onDoubleClick={() => {
                    if (checkConstraintPermissions(projectInfo, issueInfo, userInfo, 1)) {
                        props.handleEditAttributeTag('fix_version')
                    }
                }} style={{ width: '100%', color: '#7A869A' }}>{
                        checkConstraintPermissions(projectInfo, issueInfo, userInfo, 9) ? (getValueOfObjectFieldInIssue(issueInfo, "fix_version") ? getValueOfObjectFieldInIssue(issueInfo, "fix_version")?.version_name : "None") : eyeSlashIcon
                    }</span>}
        </div>
    )
}
