import React from 'react'
import { iTagForIssueTypes } from '../../../util/CommonFeatures'
import { Tag } from 'antd'
import { NavLink } from 'react-router-dom'

export default function Parent(props) {
    const issueParentInfo = props.issueParentInfo
    return (
        <div className="row priority d-flex align-items-center mt-2 mb-0" style={{ marginBottom: 20 }}>
            <span className='col-4' style={{ fontSize: 14, color: '#42526e', fontWeight: '500' }}>Priority</span>
            {issueParentInfo ? <Tag className='items-attribute' style={{ padding: '5px 20px' }}>
                <span>{iTagForIssueTypes(issueParentInfo?.issue_status, null, null)}</span>
                <NavLink onClick={() => {
                    window.location.reload()
                }} to={`/projectDetail/${issueParentInfo?.project_id}/issues/issue-detail/${issueParentInfo?._id}`}>WD-{issueParentInfo?.ordinal_number} {issueParentInfo?.summary}</NavLink>
            </Tag> : <Tag style={{ padding: '5px 20px' }}>None</Tag>}
        </div>
    )
}
