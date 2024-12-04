import { Select } from 'antd'
import React from 'react'

export default function Labels() {
    return (
        <div className='form-group'>
            <label>Default labels</label>
            <Select placeholder="Select labels" style={{ width: '100%' }} options={[]} />
        </div>
    )
}
