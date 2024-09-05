import { Avatar } from 'antd'
import React from 'react'

export default function Reporter(props) {
    const issueInfo = props.issueInfo
    return (
        <div className='row d-flex align-items-center'>
            <span className='col-4' style={{ fontSize: 14, color: '#42526e', fontWeight: '500' }}>Creator</span>
            <div style={{ display: 'flex', maxWidth: 'fit-content' }} className="item col-7">
                <div className="avatar">
                    <Avatar src={issueInfo?.creator.avatar} size='default' />
                </div>
                <p className="name d-flex align-items-center ml-1 p-0" style={{ fontWeight: 'bold', fontSize: 12, paddingRight: 5 }}>
                    {issueInfo?.creator.username}
                </p>
            </div>
        </div>
    )
}
