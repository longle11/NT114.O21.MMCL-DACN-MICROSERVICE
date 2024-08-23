import React, { useCallback, useEffect, useRef, useState } from 'react'
import mongoose from "mongoose";
import {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    reconnectEdge,
    Panel,
    useReactFlow,
    ReactFlowProvider,
} from '@xyflow/react';
import { ReactFlow } from '@xyflow/react';
import './ProcessWorkflow.css'
import '@xyflow/react/dist/style.css';
import { Input, Modal, Select } from 'antd';
import CustomNode from '../WD-Board/Workflow/Custom-Worklow-Node/CustomNode';
import { useDispatch, useSelector } from 'react-redux';
import { GetProcessListAction } from '../../redux/actions/ListProjectAction';
const nodeTypes = {
    custom: CustomNode,
};
function Tester(props) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isModalProcessOpen, setIsModalProcessOpen] = useState(false)
    const [valueConnection, setValueConnection] = useState({})
    const [valueNameProcess, setValueNameProcess] = useState('')
    useEffect(() => {
        dispatch(GetProcessListAction("66c7375ebe1ad0e86f5fe223"))
    }, [])
    const [nodes, setNodes, onNodesChange] = useNodesState(JSON.parse(localStorage.getItem('nodes')));
    const [edges, setEdges, onEdgesChange] = useEdgesState(JSON.parse(localStorage.getItem('edges')));
    const [labelEdge, setLabelEdge] = useState('')
    const edgeReconnectSuccessful = useRef(true);
    const dispatch = useDispatch()



    const onConnect = useCallback((params) => {
        setIsModalOpen(true)
        setValueConnection(params)
    });
   
   
    const { setViewport } = useReactFlow();


    const onReconnectStart = useCallback(() => {
        edgeReconnectSuccessful.current = false;
    }, []);
    const onReconnect = useCallback((oldEdge, newConnection) => {
        edgeReconnectSuccessful.current = true;
        setEdges((els) => reconnectEdge(oldEdge, newConnection, els));
    }, []);

    const nodeOptions = () => {
        return nodes?.map(node => {
            return {
                label: node.data.label,
                value: node.id
            }
        })
    }


    const handleOk = () => {
        setIsModalOpen(false);
        //default if valueConnection is null, that means user doesn't choose any status => default is both default selection
        if (Object.keys(valueConnection).length === 0) {
            valueConnection.source = nodeOptions()[0].id
            valueConnection.target = nodeOptions()[0].id
            valueConnection.sourceHandle = null
            valueConnection.targetHandle = null
        }
        setEdges((eds) => {
            valueConnection.label = labelEdge
            return addEdge(valueConnection, eds)
        }, [setEdges])

        setValueConnection({})
        setLabelEdge('')
    };
    const handleCancel = () => {
        setIsModalOpen(false);
    };


    const handleCreatingProcessOk = () => {
        setIsModalProcessOpen(false);
        onAdd(valueNameProcess)
    };
    const handleCreatingProcessCancel = () => {
        setIsModalProcessOpen(false);
        setValueNameProcess('')
    };

    const onReconnectEnd = useCallback((_, edge) => {
        if (!edgeReconnectSuccessful.current) {
            console.log("edge on onReconnectEnd ", edge);
            setEdges((eds) => eds.filter((e) => e.id !== edge.id));
        }

        edgeReconnectSuccessful.current = true;
    }, [])
    const onAdd = useCallback((value) => {
        //generate randomly id to fit mongoose's id structure
        const idRandom = new mongoose.Types.ObjectId();
        const node2 = {
            id: idRandom.toString(),
            data: { label: value.toUpperCase() },
            position: {
                x: Math.random() * 500,
                y: Math.random() * 500,
            },
        }
        setValueNameProcess('')
        nodes.push(node2)
        setNodes(nodes);
    }, [setNodes]);

    return (
        <div style={{ width: '100wh', height: '100vh' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onReconnect={onReconnect}
                onReconnectStart={onReconnectStart}
                onReconnectEnd={onReconnectEnd}
                nodeTypes={nodeTypes}
                onEdgeClick={(e, edge) => {
                    var getCurrentEdge = edge
                    const index = edges.findIndex(edge => edge.id === getCurrentEdge.id)

                    if (index !== -1) {
                        getCurrentEdge.label = labelEdge
                        edges.splice(index, 1)
                        edges.push(getCurrentEdge)
                        localStorage.setItem('initialEdges', JSON.stringify(edges))
                        setEdges(edges)
                    }
                }}
                fitViewOptions={{ padding: 0.5 }}
                attributionPosition="bottom-left"
                fitView>
                <MiniMap />
                <Controls />
                <Background />
                <Panel position="top-right">
                    <button onClick={() => {
                        setIsModalProcessOpen(true)
                    }}>add node</button>
                    <button onClick={() => {
                        setIsModalOpen(true)
                    }}>Create connection</button>
                    <button onClick={() => {
                        localStorage.setItem('initialEdges', JSON.stringify(edges))
                        localStorage.setItem('initialNodes', JSON.stringify(nodes))
                    }}>Save</button>
                </Panel>
            </ReactFlow>
            <Modal title="Create transition" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
                <div>
                    <p>Transitions connect statuses. They represent actions people take to move issues through your workflow. They also appear as drop zones when people move cards across your project's board.</p>
                    <div className='row'>
                        <div className='col-6 d-flex flex-column'>
                            <label htmlFor='fromStatus'>From status</label>
                            <Select options={nodeOptions()} value={valueConnection !== null && Object.keys(valueConnection).length !== 0 ? valueConnection.source : null} id='fromStatus' defaultValue="" onSelect={(value) => {
                                valueConnection.source = value
                                valueConnection.sourceHandle = null
                            }} />
                        </div>
                        <div className='col-6 d-flex flex-column'>
                            <label htmlFor='targetStatus'>To status</label>
                            <Select options={nodeOptions()} value={valueConnection !== null && Object.keys(valueConnection).length !== 0 ? valueConnection.target : null} id='targetStatus' defaultValue="" onSelect={(value) => {
                                valueConnection.target = value
                                valueConnection.targetHandle = null
                            }} />
                        </div>
                    </div>
                    <div>
                        <label htmlFor='name'>Name</label>
                        <Input placeholder='Give your transition a name' value={labelEdge} defaultValue="" onChange={(e) => {
                            setLabelEdge(e.target.value)
                        }} />
                    </div>
                </div>
            </Modal>
            <Modal title="Add new status" open={isModalProcessOpen} onOk={handleCreatingProcessOk} onCancel={handleCreatingProcessCancel}>
                <div>
                    <Input value={valueNameProcess} defaultValue="" onChange={(e) => {
                        setValueNameProcess(e.target.value)
                    }} />
                </div>
            </Modal>
        </div>
    )
}

export default function ProcessWorkflow(props) {
    return (
        <ReactFlowProvider>
            <Tester {...props} />
        </ReactFlowProvider>
    );
}