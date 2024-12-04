import { Input } from 'antd'
import dayjs from 'dayjs'
import React from 'react'
import { NavLink } from 'react-router-dom'

export default function TimeStamp(props) {
    const positionNewIssueTagAdded = props.positionNewIssueTagAdded
    const setPositionNewIssueTagAdded = props.setPositionNewIssueTagAdded
    const is_edited = props.is_edited
    const issue_config = props.issue_config
    return (
        <div className='form-group'>
            <label>Default time stamp</label>
            <div className='d-flex align-items-center'>
                <Input 
                value={issue_config?.default_value} 
                className='mr-2' 
                defaultValue={positionNewIssueTagAdded?.data?.default_value}
                style={{ width: '30%' }} 
                disabled={!is_edited} />
                {
                    is_edited ? (positionNewIssueTagAdded.data.default_value === null ? <NavLink onClick={() => {
                        setPositionNewIssueTagAdded({ ...positionNewIssueTagAdded, isModifyAvailable: true, data: { ...positionNewIssueTagAdded.data, default_value: dayjs().format("DD/MM/YYYY hh:mm A") } })
                    }}>Set now day</NavLink> : <NavLink onClick={() => {
                        setPositionNewIssueTagAdded({ ...positionNewIssueTagAdded, isModifyAvailable: true, data: { ...positionNewIssueTagAdded.data, default_value: null } })
                    }}>Unset</NavLink>) : <></>
                }
            </div>
        </div>
    )
}
