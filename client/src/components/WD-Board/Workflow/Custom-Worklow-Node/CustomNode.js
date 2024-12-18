import React, { memo } from 'react'
import CustomHandle from './CustomHandle'
import { Position } from '@xyflow/react';
const nodeStyle = {
  background: 'white',
  padding: 16,
  borderRadius: '50%',
  border: '1px solid black'
};
function CustomNode(props) {
  return (
    <div style={nodeStyle}>
      <CustomHandle
        type="source"
        position={Position.Bottom}
        connectionCount={1}
      />
      <div>{props.data.label}</div>
    </div>
  )
}

export default memo(CustomNode);