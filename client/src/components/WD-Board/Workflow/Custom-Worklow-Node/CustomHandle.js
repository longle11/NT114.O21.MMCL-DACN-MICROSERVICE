import React from 'react'
import { Handle, useHandleConnections } from '@xyflow/react';

export default function CustomHandle(props) {
    const connections = useHandleConnections({
        type: props.type,
    });
    return (
        <div>
            <Handle
                {...props}
                isConnectable={connections.length < props.connectionCount}
            />
        </div>
    )
}

