import React, { memo, useState } from 'react'
import { Handle, Position } from '@xyflow/react';
import { NavLink } from 'react-router-dom';
import "./CustomNodeProcess.css"
import { Popconfirm } from 'antd';
import { useSelector } from 'react-redux';
function CustomNodeProcess(props) {
    const [openConfirm, setOpenConfirm] = useState(false)
    const handleClickDeleteNode = useSelector(state => state.workflow.handleClickDeleteNode)
    const confirm = (e) => {
        handleClickDeleteNode()
        setOpenConfirm(false)
    };
    const cancel = (e) => {
        setOpenConfirm(false)
    };

    return (
        <div
            className='delete-node-workflow'
            style={{
                background: 'white',
                padding: '16px 5px 16px 16px',
                borderRadius: '10px',
                border: '1px solid black',
                borderColor: props.data.color
            }}>
            <Handle type="source" position={Position.Top} id="a" />
            <Handle type="source" position={Position.Right} id="b" />
            <Handle type="target" position={Position.Bottom} id="c" />
            <Handle type="target" position={Position.Left} id="d" />
            <div className='d-flex align-items-center'>
                <div>{props.data.label}</div>
                <Popconfirm
                    title="Delete this node"
                    description="Are you sure to delete this node?"
                    onConfirm={confirm}
                    onCancel={cancel}
                    open={openConfirm}
                    okText="Yes"
                    cancelText="No"
                >
                    <NavLink onClick={(e) => {
                        setOpenConfirm(true)
                    }} style={{visibility: 'hidden'}} className="ml-1"><i className="fa-solid fa-circle-xmark"></i></NavLink>
                </Popconfirm>
            </div>

        </div>
    )
}

export default memo(CustomNodeProcess);