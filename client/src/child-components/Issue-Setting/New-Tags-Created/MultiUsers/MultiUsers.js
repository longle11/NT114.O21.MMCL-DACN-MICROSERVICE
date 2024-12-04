import { Avatar, Select } from 'antd'
import React from 'react'
import { useSelector } from 'react-redux'
import { UserOutlined } from '@ant-design/icons';
import { NavLink } from 'react-router-dom';

export default function MultiUsers(props) {
    const userInfo = useSelector(state => state.user.userInfo)
    const positionNewIssueTagAdded = props.positionNewIssueTagAdded
    const setPositionNewIssueTagAdded = props.setPositionNewIssueTagAdded
    const is_edited = props.is_edited
    const issue_config = props.issue_config
    return (
        <div className='form-group d-flex flex-column'>
            <label>Default users</label>
            <Select
                mode='multiple'
                className='mb-2'
                disabled={!is_edited}
                placeholder="Select labels"
                value={positionNewIssueTagAdded.data.default_value}
                defaultValue={issue_config?.default_value}
                style={{ width: '50%', height: 40 }}
                options={[
                    {
                        label: <span><Avatar className='mr-2' size="small" icon={<UserOutlined />} />Unassignee</span>,
                        value: null
                    },
                    {
                        label: <span><Avatar className='mr-2' size="small" src={userInfo?.avatar} />{userInfo?.username}</span>,
                        value: userInfo?.id
                    }
                ]} />
            {is_edited ? (positionNewIssueTagAdded.data.default_value === null ? <NavLink onClick={() => {
                setPositionNewIssueTagAdded({ ...positionNewIssueTagAdded, isModifyAvailable: true, data: { ...positionNewIssueTagAdded.data, default_value: [userInfo?.id] } })
            }}>Assign to me</NavLink> : <NavLink onClick={() => {
                setPositionNewIssueTagAdded({ ...positionNewIssueTagAdded, isModifyAvailable: true, data: { ...positionNewIssueTagAdded.data, default_value: null } })
            }}>Cancel asisgn to me</NavLink>) : <></>}
        </div>
    )
}
