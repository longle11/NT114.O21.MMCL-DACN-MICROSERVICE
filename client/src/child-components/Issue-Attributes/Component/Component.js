import { Select } from 'antd'
import React from 'react'

export default function Component(props) {
    return (
        <div className='row d-flex align-items-center mt-2'>
            <span className='col-4' style={{ fontSize: 14, color: '#42526e', fontWeight: '500' }}>Component</span>
            {props.editAttributeTag === 'component' ? <Select onBlur={() => {
                props.handleEditAttributeTag('')
            }} className='col-7' style={{ width: '100%', padding: 0 }}
                defaultValue={"None"}
            /> :
                <span onDoubleClick={() => {
                    props.handleEditAttributeTag('component')
                }} className='items-attribute col-7' style={{ padding: '10px 10px', width: '100%', color: '#7A869A' }}>{"None"}</span>}
        </div>
    )
}
