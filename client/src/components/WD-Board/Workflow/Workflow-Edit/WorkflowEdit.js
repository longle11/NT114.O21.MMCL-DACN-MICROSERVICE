import React, { useCallback, useRef, useState } from 'react'
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
import './WorkflowEdit.css'
import { DnDProvider, useDnD } from './DNDContext';
import '@xyflow/react/dist/style.css';
import { Input, Modal, Select } from 'antd';
import CustomNode from '../Custom-Worklow-Node/CustomNode';
import WorkflowSideBar from './WorkflowSideBar';
import { showNotificationWithIcon } from '../../../../util/NotificationUtil';
import { useDispatch } from 'react-redux';
import { createWorkflowAction } from '../../../../redux/actions/CreateProjectAction';
import { useParams } from 'react-router-dom';
const nodeTypes = {
    custom: CustomNode,
};
function WorflowEditView(props) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isModalProcessOpen, setIsModalProcessOpen] = useState(false)
    const [valueConnection, setValueConnection] = useState({})
    const [valueNameProcess, setValueNameProcess] = useState('')
    const [nodes, setNodes, onNodesChange] = useNodesState(JSON.parse(localStorage.getItem('nodes')));
    const [edges, setEdges, onEdgesChange] = useEdgesState(JSON.parse(localStorage.getItem('edges')));
    const [labelEdge, setLabelEdge] = useState('')
    const edgeReconnectSuccessful = useRef(true);
    const { id } = useParams()
    const dispatch = useDispatch()

    const onConnect = useCallback((params) => {
        setIsModalOpen(true)
        setValueConnection(params)
    });
    const deleteNodeById = (id) => {
        setNodes(nds => nds.filter(node => node.id !== id));
    };

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
        setNodes(nodes => {
            return [
                ...nodes,
                {
                    id: idRandom.toString(),
                    data: { label: value.toUpperCase() },
                    position: {
                        x: Math.random() * 500,
                        y: Math.random() * 500,
                    },
                }
            ]
        })
        setValueNameProcess('')
    }, []);

    //drop existed processes
    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);


    const [type] = useDnD();
    const { screenToFlowPosition } = useReactFlow();
    const onDrop = useCallback(
        (event) => {
            event.preventDefault();
            if (!type) {
                return;
            }
            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });
            const newNode = {
                id: (new mongoose.Types.ObjectId()).toString(),
                type,
                position,
                data: { label: `${type.toUpperCase()}` },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [screenToFlowPosition, type],
    );

    return (
        <div style={{ width: '100wh', height: '90%' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onReconnect={onReconnect}
                onReconnectStart={onReconnectStart}
                onReconnectEnd={onReconnectEnd}
                onNodeClick={(e, node) => {
                    deleteNodeById(node.id)
                }}
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
                maxZoom={1.5}
                minZoom={1}
                onDrop={onDrop}
                onDragOver={onDragOver}
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
                        const nodesCopy = nodes.map(node => node.data.label)
                        for (let node_name1 of nodesCopy) {
                            let index = 0
                            for (let node_name2 of nodesCopy) {
                                if (node_name1 === node_name2) {
                                    index++
                                }
                            }
                            if (index > 1) {
                                showNotificationWithIcon('error', '', 'Please deleting all nodes which have the same name')
                                return;
                            }
                        }
                        localStorage.setItem('edges', JSON.stringify(edges))
                        localStorage.setItem('nodes', JSON.stringify(nodes))
                        const customNode = JSON.parse(localStorage.getItem('nodes')).map((node) => {
                            return {
                                id: node.id,
                                type: node?.type,
                                data: {
                                    label: node.data?.label
                                },
                                position: {
                                    x: node.position.x,
                                    y: node.position.y,
                                }
                            }
                        })
                        const customEdge = JSON.parse(localStorage.getItem('edges')).map(edge => {
                            return {
                                id: edge.id,
                                label: edge.label,
                                source: edge.source,
                                target: edge.target
                            }
                        })
                        dispatch(createWorkflowAction({
                            project_id: id,
                            name_workflow: "new workflow",
                            issue_statuses: [0, 2],
                            nodes: customNode,
                            edges: customEdge,
                        }))
                    }}>Save</button>
                    <WorkflowSideBar />

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

export default function WorkflowEdit(props) {
    return (
        <ReactFlowProvider>
            <DnDProvider>
                <WorflowEditView {...props} />
            </DnDProvider>
        </ReactFlowProvider>
    );
}