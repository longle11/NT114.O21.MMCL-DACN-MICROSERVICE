import { InputNumber } from 'antd'
import React from 'react'

export default function Number(props) {
    const positionNewIssueTagAdded = props.positionNewIssueTagAdded
    const setPositionNewIssueTagAdded = props.setPositionNewIssueTagAdded
    const is_edited = props.is_edited
    const issue_config = props.issue_config
    return (
        <div className='form-group'>
            <label>Default number</label>
            <InputNumber 
            disabled={!is_edited} 
            min={1} max={1000} 
            defaultValue={issue_config?.default_value}
            onChange={(value) => {
                setPositionNewIssueTagAdded({ ...positionNewIssueTagAdded, isModifyAvailable: true, data: { ...positionNewIssueTagAdded.data, default_value: value } })
            }} 
            placeholder='Enter a default number' 
            style={{ width: '100%' }} />
        </div>
    )
}