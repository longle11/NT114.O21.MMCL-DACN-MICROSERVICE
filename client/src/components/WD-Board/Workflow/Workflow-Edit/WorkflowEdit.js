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
    useReactFlow,
    ReactFlowProvider,
    MarkerType,
} from '@xyflow/react';
import { ReactFlow } from '@xyflow/react';
import './WorkflowEdit.css'
import { DnDProvider, useDnD } from './DNDContext';
import '@xyflow/react/dist/style.css';
import { Input, Modal, Select } from 'antd';
import CustomNode from '../Custom-Worklow-Node/CustomNode';
import CustomNodeProcess from '../Custom-Worklow-Node/CustomNodeProcess';
import WorkflowSideBar from './WorkflowSideBar';
import { showNotificationWithIcon } from '../../../../util/NotificationUtil';
import { useDispatch, useSelector } from 'react-redux';
import { createWorkflowAction } from '../../../../redux/actions/CreateProjectAction';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { GetProcessListAction, GetProjectAction } from '../../../../redux/actions/ListProjectAction';
import { issueTypeOptions, issueTypeWithoutOptions } from '../../../../util/CommonFeatures';
const nodeTypes = {
    custom: CustomNode,
    customNodeProcess: CustomNodeProcess,
};
function WorflowEditView(props) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const navigate = useNavigate()
    const [isModalCreatingWorkflowlOpen, setModalCreatingWorkflowOpen] = useState(false)
    const [isModalProcessOpen, setIsModalProcessOpen] = useState(false)
    const [valueConnection, setValueConnection] = useState({})
    const [valueNameProcess, setValueNameProcess] = useState('')
    const [nodes, setNodes, onNodesChange] = useNodesState(JSON.parse(localStorage.getItem('nodes')));
    const [edges, setEdges, onEdgesChange] = useEdgesState(JSON.parse(localStorage.getItem('edges')));
    const [labelEdge, setLabelEdge] = useState('')
    const edgeReconnectSuccessful = useRef(true);
    const processList = useSelector(state => state.listProject.processList)
    const projectInfo = useSelector(state => state.listProject.projectInfo)
    const userInfo = useSelector(state => state.user.userInfo)
    const { id } = useParams()
    //state for creating new workflow information
    const [workflowName, setWorkflowName] = useState('')
    const [statuses, setStatuses] = useState(issueTypeOptions)


    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(GetProcessListAction(id))
        dispatch(GetProjectAction(id))
    }, [])

    const onConnect = useCallback((params) => {
        setIsModalOpen(true)
        setValueConnection(params)
    });
    const deleteNodeById = (id) => {
        setNodes(nds => nds.filter(node => node.id !== id));
    };

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
        if (valueConnection.source === valueConnection.target) {
            showNotificationWithIcon('error', '', 'Source and Target can not duplicate')
        } else {
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
                valueConnection.type = 'smoothstep'
                valueConnection.markerEnd = {
                    type: MarkerType.ArrowClosed,
                    width: 10,
                    height: 10,
                    color: '#A0522D',
                }
                valueConnection.style = {
                    strokeWidth: 1,
                    stroke: '#A0522D',
                }
                return addEdge(valueConnection, eds)
            }, [setEdges])

            setValueConnection({})
            setLabelEdge('')
        }
    };
    const handleCancel = () => {
        setIsModalOpen(false);
    };


    const handleCreatingProcessOk = () => {
        if (!nodes.map(node => node.data.label.toLowerCase()).includes(valueNameProcess.toLowerCase())) {
            setIsModalProcessOpen(false);
            onAdd(valueNameProcess)
        } else {
            showNotificationWithIcon('error', '', 'This name is already existed, please entering the different name')
        }
    };
    const handleCreatingProcessCancel = () => {
        setIsModalProcessOpen(false);
        setValueNameProcess('')
    };

    const handleCreatingWorkflowCancel = () => {
        setModalCreatingWorkflowOpen(false);
    };
    const handleCreatingWorkflowOk = () => {
        //handle creating workflow and storing in database
        const nodesCopy = nodes.map(node => node.data.label)
        for (let node_name1 of nodesCopy) {
            var nameNode = ''
            let index = 0
            for (let node_name2 of nodesCopy) {
                if (node_name1 === node_name2) {
                    index++
                    if (index > 1) {
                        nameNode = node_name1
                        break
                    }
                }
            }
            if (index > 1) {
                showNotificationWithIcon('error', '', `Please deleting node ${nameNode} which have the same name and try again`)
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
                    label: node.data?.label,
                    color: node.data?.color
                },
                position: {
                    x: node.position.x,
                    y: node.position.y,
                },
            }
        })
        const customEdge = JSON.parse(localStorage.getItem('edges')).map(edge => {
            return {
                id: edge.id,
                label: edge.label,
                source: edge.source,
                target: edge.target,
                type: 'smoothstep',
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
        })

        localStorage.removeItem('edges')
        localStorage.removeItem('nodes')

        if (nodes.length !== 1 && edges.length !== 0) {
            if (statuses.length === 0) {
                showNotificationWithIcon('error', '', 'Status field must have at least one status')
            } else if (workflowName.trim() === "") {
                showNotificationWithIcon('error', '', 'Name workflow can not be left blank')
            }
            else {
                dispatch(createWorkflowAction({
                    project_id: id,
                    name_workflow: workflowName,
                    issue_statuses: statuses?.map(status => parseInt(status)),
                    creator: userInfo.id,
                    nodes: customNode,
                    edges: customEdge,
                }, navigate))

                setStatuses([])
                setWorkflowName('')
                setModalCreatingWorkflowOpen(false);
            }

        } else {
            showNotificationWithIcon('error', '', 'Create failed. You need more than one node and one edge to start')
        }

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
                    type: 'customNodeProcess',
                    data: { label: value.toUpperCase(), color: generateColor() },
                    position: {
                        x: Math.random() * 500,
                        y: Math.random() * 500,
                    }
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

    //create randomly color for new process
    function generateColor() {
        const randomColor = Math.floor(Math.random() * 16777215).toString(16);
        return '#' + randomColor
    }
    const onDrop = useCallback(
        (event) => {
            try {
                event.preventDefault();
                if (!type) return null
                if (processList === null && processList.length === 0) return null
                const index = processList.map(process => process.name_process.toLowerCase()).findIndex(name => name === type.toLowerCase())
                if (index !== -1) {
                    const position = screenToFlowPosition({
                        x: event.clientX,
                        y: event.clientY,
                    });
                    const newNode = {
                        id: processList[index]._id,
                        position,
                        type: 'customNodeProcess',
                        data: { label: `${type.toUpperCase()}`, color: processList[index].tag_color }

                    };
                    if (nodes?.map(node => node.id).includes(newNode.id)) {

                        return
                    } else {
                        setNodes((nds) => {
                            if (nds.map(node => node.id).includes(newNode.id)) {
                                showNotificationWithIcon('error', '', 'This node seems existed, please try again')
                                return nds
                            } else {
                                return nds.concat(newNode)
                            }
                        });
                        return
                    }
                } else {
                    return null
                }
            } catch (error) {

            }
        },
        [screenToFlowPosition, type],
    );

    return (
        <div style={{ width: '100wh', height: '100vh' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#dddd', height: '10%', padding: '0 20px' }}>
                <div>
                    <button className='btn btn-transparent' onClick={() => {
                        navigate(`/projectDetail/${id}/workflows`)
                    }}><i className="fa fa-times" style={{ fontSize: '40px' }}></i></button>
                </div>

                <div className='d-flex flex-column'>
                    <p className='d-flex m-0 align-items-center'><span style={{fontWeight: 'bold', marginRight: '4px'}}>Workflow for</span> {issueTypeWithoutOptions.map(status => <span style={{fontSize: '10px !important'}}>{status.label}</span>)}</p>
                    <NavLink to={`/projectDetail/${id}/board`}>{projectInfo.name_project}</NavLink>
                </div>
                <WorkflowSideBar />

                <div>
                    <button className='btn btn-primary ml-2 mr-2' style={{ height: 'fit-content' }} onClick={() => {
                        setIsModalProcessOpen(true)
                    }}>Add new node</button>
                    <button className='btn btn-primary mr-2' style={{ height: 'fit-content' }} onClick={() => {
                        setIsModalOpen(true)
                    }}>Add connection</button>
                </div>
                <div>
                    {nodes?.length === 1 || edges?.length === 0 ? <button className='btn btn-light mr-2' disabled style={{ height: 'fit-content' }}>Update Workflow</button> : <button className='btn btn-light mr-2' style={{ height: 'fit-content' }} onClick={() => {
                        setModalCreatingWorkflowOpen(true)
                    }}>Update Workflow</button>}
                    <button className='btn btn-dark' style={{ height: 'fit-content' }} onClick={() => {
                        navigate(`/projectDetail/${id}/workflows`)
                    }}>Close</button>
                </div>
            </div>
            <div style={{ width: '100wh', height: '90vh' }}>
                <ReactFlow style={{ width: '100%', height: '100%' }}
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
                </ReactFlow>
            </div>
            <Modal title="Create connection" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
                <div>
                    <p>Connections connect statuses. They represent actions people take to move issues through your workflow. They also appear as drop zones when people move cards across your project's board.</p>
                    <div className='row'>
                        <div className='col-6 d-flex flex-column'>
                            <label htmlFor='fromStatus'>From status</label>
                            <Select defaultValue={null} value={valueConnection !== null && Object.keys(valueConnection).length !== 0 ? valueConnection.source : null}  options={nodeOptions()} id='fromStatus' onSelect={(value) => {
                                valueConnection.source = value
                                valueConnection.sourceHandle = null
                            }} />
                        </div>
                        <div className='col-6 d-flex flex-column'>
                            <label htmlFor='targetStatus'>To status</label>
                            <Select defaultValue={null} value={valueConnection !== null && Object.keys(valueConnection).length !== 0 ? valueConnection.target : null} options={nodeOptions()} id='targetStatus' onSelect={(value) => {
                                valueConnection.target = value
                                valueConnection.targetHandle = null
                            }} />
                        </div>
                    </div>
                    <div>
                        <label htmlFor='name'>Name</label>
                        <Input placeholder='Give your connection a name' value={labelEdge} defaultValue="" onChange={(e) => {
                            setLabelEdge(e.target.value)
                        }} />
                        <small>Try a name that's easy to understand e.g. todo</small>
                    </div>
                </div>
            </Modal>
            <Modal title="Add new status" open={isModalProcessOpen} onOk={handleCreatingProcessOk} onCancel={handleCreatingProcessCancel}>
                <div>
                    <Input value={valueNameProcess} defaultValue="" onChange={(e) => {
                        setValueNameProcess(e.target.value)
                    }} placeholder='Enter name for new node' />
                    <small>Try a name that's easy to understand e.g. To do</small>
                </div>
            </Modal>

            <Modal destroyOnClose="true" title="Create workflow" open={isModalCreatingWorkflowlOpen} onOk={handleCreatingWorkflowOk} onCancel={handleCreatingWorkflowCancel}>
                <p>Changes to this workflow will apply to the issue statuses selected.</p>
                <label>Enter a new name for your workflow <span className='text-danger'>*</span></label>
                <Input onChange={(e) => {
                    setWorkflowName(e.target.value)
                }} />
                <label className='mt-2'>Select the issue statuses you want to copy this workflow to: <span className='text-danger'>*</span></label>
                <Select
                    mode="multiple"
                    placeholder="Please select"
                    defaultValue={issueTypeOptions}
                    options={issueTypeOptions}
                    onChange={(value) => {
                        setStatuses(value)
                    }}
                    style={{
                        width: '100%',
                    }}
                />
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