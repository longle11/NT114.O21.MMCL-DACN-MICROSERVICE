import React from 'react'
import {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    ReactFlowProvider,
    MarkerType,
} from '@xyflow/react';
import { ReactFlow } from '@xyflow/react';
import './WorkflowView.css'
import '@xyflow/react/dist/style.css';
import CustomNode from '../Custom-Worklow-Node/CustomNode';
import CustomNodeProcess from '../Custom-Worklow-Node/CustomNodeProcess';
const nodeTypes = {
    custom: CustomNode,
    customNodeProcess: CustomNodeProcess,
};

const defaultViewport = { x: 0, y: 0, zoom: 1.5};
function View(props) {
    const [nodes, setNodes, onNodesChange] = useNodesState(JSON.parse(localStorage.getItem('nodes')));
    const [edges, setEdges, onEdgesChange] = useEdgesState(JSON.parse(localStorage.getItem('edges'))?.map(edge => {
        return {
            ...edge,
            markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 10,
                height: 10,
                color: '#A0522D',
            },
            style: {
                strokeWidth: 1,
                stroke: '#A0522D',
            }
        }
    }));
    return (
        <div style={{ width: '100wh', height: '60vh' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                fitViewOptions={{ padding: 0.5 }}
                defaultViewport={defaultViewport}
                fitView>
                <MiniMap />
                <Controls />
                <Background />  
            </ReactFlow>
        </div>
    )
}

export default function WorkflowView(props) {
    return (
        <ReactFlowProvider>
            <View {...props} />
        </ReactFlowProvider>
    );
}