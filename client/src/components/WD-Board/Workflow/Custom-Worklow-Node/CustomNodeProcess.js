import React, { memo } from 'react'
import { Handle, Position } from '@xyflow/react';
function CustomNodeProcess(props) {
    
    return (
        <div style={{
            background: 'white',
            padding: 16,
            borderRadius: '10px',
            border: '1px solid black',
            borderColor: props.data.color
        }}>
            <Handle type="source" position={Position.Top} id="a" />
            <Handle type="source" position={Position.Right} id="b" />
            <Handle type="target" position={Position.Bottom} id="c" />
            <Handle type="target" position={Position.Left} id="d" />
            <div>{props.data.label}</div>
        </div>
    )
}

export default memo(CustomNodeProcess);