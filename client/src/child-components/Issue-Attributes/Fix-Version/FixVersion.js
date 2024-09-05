import { Select } from 'antd'
import React from 'react'
import { useDispatch } from 'react-redux'
import { updateInfoIssue } from '../../../redux/actions/IssueAction'
import { updateVersion } from '../../../redux/actions/CategoryAction'
import { renderVersionList } from '../../../util/CommonFeatures'

export default function FixVersion(props) {
    const issueInfo = props.issueInfo
    const userInfo = props.userInfo
    const id = props.id
    const versionList = props.versionList
    const dispatch = useDispatch()
    return (
        <div className='row d-flex align-items-center mt-2'>
            <span className='col-4' style={{ fontSize: 14, color: '#42526e', fontWeight: '500' }}>Fix Version</span>
            {props.editAttributeTag === 'fix_version' ? <Select options={renderVersionList(versionList, id)} className='col-7' style={{ width: '100%', padding: 0 }}
                value={issueInfo?.fix_version?._id}
                onSelect={(value, option) => {
                    dispatch(updateInfoIssue(issueInfo?._id, issueInfo?.project_id?._id, { fix_version: value }, issueInfo?.fix_version ? issueInfo?.fix_version?.version_name : "None", option.label, userInfo.id, "updated", "fix version"))
                    //update new issue in versio
                    dispatch(updateVersion(value, { issue_id: issueInfo?._id.toString(), version_id: issueInfo?.fix_version === null ? null : issueInfo?.fix_version._id.toString() }, issueInfo?.project_id?._id.toString()))
                }}
                onBlur={() => {
                    props.handleEditAttributeTag('')
                }}
            /> :
                <span onDoubleClick={() => {
                    props.handleEditAttributeTag('fix_version')
                }} className='items-attribute col-7' style={{ padding: '10px 10px', width: '100%', color: '#7A869A' }}>{issueInfo?.fix_version ? issueInfo?.fix_version?.version_name : "None"}</span>}
        </div>
    )
}
