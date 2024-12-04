import { Input } from 'antd'
import React from 'react'

export default function ShortText(props) {
    const setPositionNewIssueTagAdded = props.setPositionNewIssueTagAdded
    const positionNewIssueTagAdded = props.positionNewIssueTagAdded
    const is_edited = props.is_edited
    const issue_config = props.issue_config
    return (
        <div className='form-group'>
            <label>Default text</label>
            <Input disabled={!is_edited} defaultValue={issue_config?.default_value} onChange={(e) => {
                setPositionNewIssueTagAdded({ ...positionNewIssueTagAdded, isModifyAvailable: true, data: { ...positionNewIssueTagAdded.data, default_value: e.target.value } })
            }} placeholder='Enter default text' className='form-control' />
        </div>
    )
}
