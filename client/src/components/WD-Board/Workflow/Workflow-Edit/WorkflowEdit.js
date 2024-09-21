import React, { useCallback, useEffect, useRef, useState } from 'react'
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
import { Button } from 'antd';
import CustomNode from '../Custom-Worklow-Node/CustomNode';
import CustomNodeProcess from '../Custom-Worklow-Node/CustomNodeProcess';
import WorkflowSideBar from './WorkflowSideBar';
import { showNotificationWithIcon } from '../../../../util/NotificationUtil';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { GetProcessListAction, GetProjectAction, GetWorkflowListAction } from '../../../../redux/actions/ListProjectAction';
import { issueTypeWithoutOptions } from '../../../../util/CommonFeatures';
import { DELETE_NODE_IN_WORKFLOW } from '../../../../redux/constants/constant';
import { displayComponentInModal } from '../../../../redux/actions/ModalAction';
import AddNewNodeWorkflowModal from '../../../Modal/AddNewNodeWorkflowModal/AddNewNodeWorkflowModal';
import ModalHOC from '../../../../HOC/ModalHOC';
import CreateOrUpdateWorkflowModal from '../../../Modal/CreateOrUpdateWorkflowModal/CreateOrUpdateWorkflowModal';
import CreateConnectionWorkflowModal from '../../../Modal/CreateConnectionWorkflowModal/CreateConnectionWorkflowModal';
const nodeTypes = {
    custom: CustomNode,
    customNodeProcess: CustomNodeProcess,
};
function WorflowEditView() {
    const navigate = useNavigate()
    const dispatch = useDispatch()

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
    const [labelEdge, setLabelEdge] = useState('')
    
    const edgeReconnectSuccessful = useRef(true);
    const processList = useSelector(state => state.listProject.processList)
    const projectInfo = useSelector(state => state.listProject.projectInfo)

    const workflowList = useSelector(state => state.listProject.workflowList)
    const userInfo = useSelector(state => state.user.userInfo)
    const { id, workflowId } = useParams()
    //state for creating new workflow information

    useEffect(() => {
        if (id) {
            dispatch(GetProcessListAction(id))
            dispatch(GetProjectAction(id, null, null))
            dispatch(GetWorkflowListAction(id))
        }
    }, [])

    const onConnect = useCallback((params) => {
        dispatch(displayComponentInModal(<CreateConnectionWorkflowModal nodes={nodes} params={params} setLabelEdge={setLabelEdge} labelEdge={labelEdge} setEdges={setEdges} addEdge={addEdge}/>, "500px", "Create connection"))
    });
    const deleteNodeById = (id) => {
        dispatch({
            type: DELETE_NODE_IN_WORKFLOW,
            handleClickDeleteNode: () => {
                setNodes(nds => nds.filter(node => node.id !== id));
            }
        })

    };

    const onReconnectStart = useCallback(() => {
        edgeReconnectSuccessful.current = false;
    }, []);
    const onReconnect = useCallback((oldEdge, newConnection) => {
        edgeReconnectSuccessful.current = true;
        setEdges((els) => reconnectEdge(oldEdge, newConnection, els));
    }, []);


    

    const renderCurrentStatuesWithoutNameForUpdating = () => {
        if (workflowId) {
            const getWorkflow = workflowList?.filter(workflow => workflow._id === workflowId)
            if (getWorkflow?.length !== 0) {
                const arrs = getWorkflow[0].issue_statuses.map(indexStatus => {
                    return <span>{issueTypeWithoutOptions[indexStatus]?.label}</span>
                })

                return <span className='d-flex align-items-center'>{arrs}</span>
            }
        }
        return <span className='d-flex align-items-center'> {issueTypeWithoutOptions.map(status => <span>{status.label}</span>)}</span>
    }


   

    const onReconnectEnd = useCallback((_, edge) => {
        if (!edgeReconnectSuccessful.current) {
            setEdges((eds) => eds.filter((e) => e.id !== edge.id));
        }

        edgeReconnectSuccessful.current = true;
    }, [])


    //drop existed processes
    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);


    const [type] = useDnD();
    const { screenToFlowPosition } = useReactFlow();

    
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
                        localStorage.removeItem('nodes')
                        localStorage.removeItem('edges')
                    }}><i className="fa fa-times" style={{ fontSize: '40px' }}></i></button>
                </div>

                <div className='d-flex flex-column'>
                    <p className='d-flex m-0 align-items-center'>
                        <span style={{ fontWeight: 'bold', marginRight: '4px' }}>Workflow for </span>
                        {renderCurrentStatuesWithoutNameForUpdating()}
                    </p>
                    <span>
                        Project Name:
                        <NavLink className="ml-1" to={`/projectDetail/${id}/board`}>{projectInfo?.name_project}</NavLink>
                    </span>
                </div>
                <WorkflowSideBar />

                <div>
                    <Button type='primary' className='ml-2 mr-2' style={{ height: 'fit-content' }} onClick={() => {
                        console.log("click trong nay");
                        
                        dispatch(displayComponentInModal(<AddNewNodeWorkflowModal nodes={nodes} setNodes={setNodes}/>, "500px", "Add new node"))
                    }}>Add new node</Button>
                    <Button danger className='mr-2' style={{ height: 'fit-content' }} onClick={() => {
                          dispatch(displayComponentInModal(<CreateConnectionWorkflowModal nodes={nodes} params={null} setLabelEdge={setLabelEdge} labelEdge={labelEdge} setEdges={setEdges} addEdge={addEdge}/>, "500px", "Create connection"))
                    }}>Add connection</Button>
                </div>
                <div>
                    {nodes?.length === 1 || edges?.length === 0 ? <Button className='mr-2' disabled style={{ height: 'fit-content' }}>{workflowId ? "Update Workflow" : "Create new workflow"}</Button> : <Button className='btn btn-light mr-2' style={{ height: 'fit-content' }} onClick={() => {
                        dispatch(displayComponentInModal(<CreateOrUpdateWorkflowModal id={id} workflowId={workflowId} workflowList={workflowList} nodes={nodes} edges={edges} userInfo={userInfo}/>, 500, JSON.parse(localStorage.getItem('workflowInfo')) === null ? "Create workflow" : "Upadte workflow"))
                    }}>{workflowId ? "Update Workflow" : "Create new workflow"}</Button>}
                    <Button className='btn btn-dark' style={{ height: 'fit-content' }} onClick={() => {
                        navigate(`/projectDetail/${id}/workflows`)

                        localStorage.removeItem('nodes')
                        localStorage.removeItem('edges')
                    }}>Close</Button>
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
        </div>
    )
}

export default function WorkflowEdit(props) {
    return (
        <ReactFlowProvider>
            <ModalHOC />
            <DnDProvider>
                <WorflowEditView {...props} />
            </DnDProvider>
        </ReactFlowProvider>
    );
}