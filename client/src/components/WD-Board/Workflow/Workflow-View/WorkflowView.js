import React, { useEffect } from 'react'
import {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    ReactFlowProvider,
} from '@xyflow/react';
import { ReactFlow } from '@xyflow/react';
import './WorkflowView.css'
import '@xyflow/react/dist/style.css';
import CustomNode from '../Custom-Worklow-Node/CustomNode';
const nodeTypes = {
    custom: CustomNode,
};

const defaultViewport = { x: 0, y: 0, zoom: 0 };
function View(props) {
    const [nodes, setNodes, onNodesChange] = useNodesState(JSON.parse(localStorage.getItem('nodes')));
    const [edges, setEdges, onEdgesChange] = useEdgesState(JSON.parse(localStorage.getItem('edges')));
    console.log(edges, JSON.parse(localStorage.getItem('edges')))
    return (
        <div style={{ width: '100wh', height: '60vh' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitViewOptions={{ padding: 0.5 }}
                defaultViewport={defaultViewport}
                maxZoom={0.5}
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