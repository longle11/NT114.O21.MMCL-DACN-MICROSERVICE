import { Input } from 'antd'
import dayjs from 'dayjs'
import React from 'react'
import { NavLink } from 'react-router-dom'

export default function Date(props) {
    const setPositionNewIssueTagAdded = props.setPositionNewIssueTagAdded
    const positionNewIssueTagAdded = props.positionNewIssueTagAdded
    const is_edited = props.is_edited
    const issue_config = props.issue_config
    return (
        <div className='form-group'>
            <label>Default Date</label>
            <div className='d-flex align-items-center'>
                <Input 
                defaultValue={issue_config?.default_value}
                value={positionNewIssueTagAdded.data.default_value} 
                className='mr-2' style={{ width: '30%' }} 
                disabled={!is_edited} />
                {
                    is_edited ? (positionNewIssueTagAdded.data.default_value === null ? <NavLink onClick={() => {
                        setPositionNewIssueTagAdded({ ...positionNewIssueTagAdded, isModifyAvailable: true, data: { ...positionNewIssueTagAdded.data, default_value: dayjs().format("DD/MM/YYYY") } })
                    }}>Set now day</NavLink> : <NavLink onClick={() => {
                        setPositionNewIssueTagAdded({ ...positionNewIssueTagAdded, isModifyAvailable: true, data: { ...positionNewIssueTagAdded.data, default_value: null } })
                    }}>Unset</NavLink>) : <></>
                }
            </div>
        </div>
    )
}
