import React from 'react'
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
import CustomNodeProcess from '../Custom-Worklow-Node/CustomNodeProcess';
const nodeTypes = {
    custom: CustomNode,
    customNodeProcess: CustomNodeProcess,
};

const defaultViewport = { x: 0, y: 0, zoom: 1.5};
function View(props) {
    const [nodes, setNodes, onNodesChange] = useNodesState(JSON.parse(localStorage.getItem('nodes')));
    const [edges, setEdges, onEdgesChange] = useEdgesState(JSON.parse(localStorage.getItem('edges')));
    console.log(edges, JSON.parse(localStorage.getItem('edges')))
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