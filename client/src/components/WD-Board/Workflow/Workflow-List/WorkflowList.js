import { Avatar, Button, Modal, Table } from 'antd'
import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { CreateProcessACtion, DeleteWorkflowAction, GetProcessListAction, GetProjectAction, GetWorkflowListAction, UpdateWorkflowAction } from '../../../../redux/actions/ListProjectAction'
import { NavLink, useNavigate, useParams } from 'react-router-dom'
import { iTagForIssueTypes } from '../../../../util/CommonFeatures'
import WorkflowView from '../Workflow-View/WorkflowView'
import { EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs'
import { showNotificationWithIcon } from '../../../../util/NotificationUtil'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'

export default function WorkflowList() {
    const workflowList = useSelector(state => state.listProject.workflowList)
    const navigate = useNavigate()
    const { id } = useParams()
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalCreatingProcessOpen, setIsModalOpenCreatingProcess] = useState(false);
    const [virtualProcessesDashboard, setVirtualProcessesDashboard] = useState({})
    const [processesWorkflow, setProcessesWorkflow] = useState({})
    const [workflowId, setWorkflowId] = useState('')
    const projectInfo = useSelector(state => state.listProject.projectInfo)
    const processList = useSelector(state => state.listProject.processList)
    const newProcesses = useRef([])
    const workflowWorking = useRef({})
    const dispatch = useDispatch()
    useEffect(() => {
        dispatch(GetWorkflowListAction(id))
        dispatch(GetProjectAction(id))
        dispatch(GetProcessListAction(id))
    }, [])
    const handleOk = () => {
        setIsModalOpen(false);
        localStorage.removeItem('nodes')
        localStorage.removeItem('edges')
        setWorkflowId('')
    };
    const handleCancel = () => {
        setIsModalOpen(false);
        localStorage.removeItem('nodes')
        localStorage.removeItem('edges')
        setWorkflowId('')
    };

    const handleCreatingProcessOk = () => {
        setIsModalOpenCreatingProcess(false);

        //proceed create all new processes 
        newProcesses.current.forEach((data) => {
            dispatch(CreateProcessACtion(data))
        })
        //move workflow from inactive to active
        dispatch(UpdateWorkflowAction(workflowWorking.current._id, { isActivated: true }))

        workflowWorking.current = null
        newProcesses.current = null
    };
    const handleCreatingProcessCancel = () => {
        setIsModalOpenCreatingProcess(false);
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name_workflow',
            render: (text, record) => {
                return <NavLink onClick={() => {
                    setIsModalOpen(true);
                    localStorage.setItem('nodes', JSON.stringify(record.nodes))
                    localStorage.setItem('edges', JSON.stringify(record.edges))
                    setWorkflowId(record._id)
                }}>{record.name_workflow}</NavLink>
            }
        },
        {
            title: 'Project',
            dataIndex: 'project_id',
            render: (text, record) => {
                return <span>{projectInfo.name_project}</span>
            }
        },
        {
            title: 'Issue Statuses',
            dataIndex: 'issue_statuses',
            render: (text, record) => {
                return <span>{record.issue_statuses.map((status, index) => {
                    return <span key={index}>{iTagForIssueTypes(status)}</span>
                })}</span>
            }
        },
        {
            title: 'Creator',
            dataIndex: 'creator',
            render: (text, record) => {
                return <span><Avatar src={record.creator.avatar} className='mr-2' />{record.creator.username}</span>
            }
        },
        {
            title: 'Create At',
            dataIndex: 'createAt',
            render: (text, record) => {
                return <span>{dayjs(record.createAt).format("DD/MM/YYYY")}</span>
            }
        },
        {
            title: 'Update At',
            dataIndex: 'updateAt',
            render: (text, record) => {

            }
        },
        {
            title: 'Action',
            dataIndex: 'action',
            key: '_id',
            width: '10%',
            render: (text, record, index) => {
                return <div>
                    <div className="dropdown">
                        <Button className='mr-2 text-primary' type="default" icon={<EditOutlined />} size='large' id={`dropdownMenu${index}`} data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" />
                        <div className="dropdown-menu" aria-labelledby={`dropdownMenu${index}`}>
                            <a className="dropdown-item" href={`/projectDetail/${id}/workflows/edit/${record._id}`} onClick={() => {
                                localStorage.setItem('nodes', JSON.stringify(record.nodes))
                                localStorage.setItem('edges', JSON.stringify(record.edges))
                            }}>Edit</a>
                            {record?.isActivated ? <></> : <a className="dropdown-item" href="##" onClick={() => {
                                dispatch(DeleteWorkflowAction(record._id))
                            }}>Delete</a>}
                            {record.isActivated ? <a className="dropdown-item" href="##" onClick={() => {
                                //handle event when user clicks to move to inactive
                                dispatch(UpdateWorkflowAction(record._id, { isActivated: false }))
                            }}>Move to inactive</a> : <a className="dropdown-item" onClick={() => {
                                //handle event when user clicks to move to active
                                const getCurrentWorkflow = record
                                const getAllWorkflowInActiveMode = workflowList.filter(workflow => workflow.isActivated)
                                if (getAllWorkflowInActiveMode.length === 0) {
                                    //check whether the number of new processes creating in workflow should insert into dashboard or not
                                    if (record.nodes.findIndex(processNode => !processList.includes(processNode.id) === -1)) {
                                        //if it is the default workflow, we will eliminate those statuses in activated workflow
                                        setProcessesWorkflow(record)
                                        setIsModalOpenCreatingProcess(true)
                                        setVirtualProcessesDashboard(processList)
                                        workflowWorking.current = record
                                    } else {
                                        showNotificationWithIcon('success', '', 'khong co thang trung')
                                    }
                                } else {
                                    const flowArrs = []
                                    getAllWorkflowInActiveMode.forEach(workflow => {
                                        getCurrentWorkflow.issue_statuses.forEach(status => {
                                            if (workflow.issue_statuses.includes(status)) {
                                                if (flowArrs.length === 0 || flowArrs.findIndex(flow => flow === workflow) === -1) {
                                                    flowArrs.push(workflow)
                                                    return
                                                }
                                            }
                                        })
                                    })
                                    //if this array has length equal 0, which means it doesn't have those statuses in inactive
                                    if (flowArrs.length === 0) {
                                        dispatch(UpdateWorkflowAction(getCurrentWorkflow._id, { isActivated: true }))
                                    } else {
                                        //move this flow to active and all flows in active to inactive
                                        flowArrs.forEach((flow, index) => {
                                            dispatch(UpdateWorkflowAction(flow._id, { isActivated: false }))
                                        })

                                        dispatch(UpdateWorkflowAction(getCurrentWorkflow._id, { isActivated: true }))
                                    }
                                }
                            }} href="##">Move to active</a>}
                        </div>
                    </div>
                </div>
            },
        },
    ];
    return (
        <div style={{ padding: '0 20px' }}>
            <div className='d-flex justify-content-between mt-3'>
                <h5>Workflows</h5>
                <Button type="primary" onClick={() => {
                    localStorage.setItem('nodes', JSON.stringify([{
                        id: '0',
                        type: 'custom',
                        data: { label: 'Start' },
                        position: { x: 250, y: 0 },
                    },]))
                    localStorage.setItem('edges', JSON.stringify([]))
                    navigate(`/projectDetail/${id}/workflows/create-workflow`)
                }}>Add Workflow</Button>
            </div>
            <div>
                <ul className="nav nav-tabs" id="myTab" role="tablist">
                    <li className="nav-item">
                        <a className="nav-link active" id="active-tab" data-toggle="tab" href="#active" role="tab" aria-controls="active" aria-selected="true">Active</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" id="inactive-tab" data-toggle="tab" href="#inactive" role="tab" aria-controls="inactive" aria-selected="false">Inactive</a>
                    </li>
                </ul>
                <div className="tab-content" id="myTabContent">
                    <div className="tab-pane fade show active" id="active" role="tabpanel" aria-labelledby="active-tab">
                        {/* display all workflows which are activated in project */}
                        <Table columns={columns} dataSource={workflowList?.filter(workflow => workflow.isActivated)} size="small" />
                    </div>
                    <div className="tab-pane fade" id="inactive" role="tabpanel" aria-labelledby="inactive-tab">
                        {/* display all workflows which are inactivated in project */}

                        <Table columns={columns} dataSource={workflowList?.filter(workflow => !workflow.isActivated)} size="small" />
                    </div>
                </div>
            </div>
            <Modal destroyOnClose={true} title={`Workflow diagram ${workflowId}`} width={1000} open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
                <WorkflowView />
            </Modal>
            <Modal destroyOnClose={true} title={`Create process`} width={1000} open={isModalCreatingProcessOpen} onOk={handleCreatingProcessOk} onCancel={handleCreatingProcessCancel}>
                <span className='text-danger'>If you want to display processes in workflow to dashboard.<br /> Please drag the processes from workflow and drop into dashboard</span>
                {/* Display processes in current dashboard */}
                <DragDropContext onDragEnd={(result) => {
                    const source = result.source
                    const dest = result.destination
                    if (dest === null) {
                        return
                    }
                    if (source.droppableId !== dest.droppableId && dest.droppableId.includes('processes-0')) {
                        const getCurrentProcessInWorkflow = processesWorkflow.nodes[source.index]
                        if (virtualProcessesDashboard.map(process => process._id.toString()).includes(getCurrentProcessInWorkflow.id.toString())) {
                            showNotificationWithIcon('error', '', 'gia tri nay da ton tai roi')
                        } else {
                            const newProcess = {
                                _id: getCurrentProcessInWorkflow.id,
                                name_process: getCurrentProcessInWorkflow.data.label,
                                project_id: id
                            }
                            virtualProcessesDashboard.push(newProcess)
                            newProcesses.current.push(newProcess)

                            setVirtualProcessesDashboard(virtualProcessesDashboard)
                        }
                    }
                }}>
                    <div>
                        <label htmlFor='processesDashboard'>Processes are displayed in dashboard</label>
                        <div>
                            <Droppable droppableId='processes-0' direction='horizontal'>
                                {(provided) => {
                                    return <div ref={provided.innerRef} {...provided.droppableProps} name="processesDashboard" style={{ padding: '5px 10px', border: '1px solid black', height: 'max-content', display: 'flex' }}>
                                        {virtualProcessesDashboard?.map((process, index) => {
                                            return <Draggable key={`process-0-${process._id.toString()}`} draggableId={`process-0-${process._id.toString()}`} index={index}>
                                                {(provided) => {
                                                    return <div ref={provided.innerRef} {...provided.dragHandleProps} {...provided.draggableProps}>
                                                        <div style={{ padding: '6px 20px', border: '1px solid #dddd', marginRight: '10px' }}>{process.name_process}</div>
                                                    </div>
                                                }}
                                            </Draggable>
                                        })}
                                        {provided.placeholder}
                                    </div>
                                }}
                            </Droppable>
                        </div>
                    </div>
                    {/* Display processes in current workflow */}
                    <div>
                        <label htmlFor='processesWorkflow'>Processes are displayed in workflow</label>
                        <Droppable droppableId='processes-1' direction='horizontal'>
                            {(provided) => {
                                return <div ref={provided.innerRef} {...provided.droppableProps} name="processesWorkflow" style={{ padding: '5px 10px', border: '1px solid black', height: 'max-content', display: 'flex' }}>
                                    {processesWorkflow?.nodes?.map((process, index) => {
                                        return <Draggable key={`process-1-${process.id.toString()}`} draggableId={`process-1-${process.id.toString()}`} index={index}>
                                            {(provided) => {
                                                if (process.id.toString() === '0') return <div key={process.id.toString()} ref={provided.innerRef} {...provided.dragHandleProps} {...provided.draggableProps}></div>
                                                return <div key={process.id.toString()} ref={provided.innerRef} {...provided.dragHandleProps} {...provided.draggableProps}>
                                                    <div style={{ padding: '6px 20px', border: '1px solid #dddd', marginRight: '10px' }}>{process.data.label}</div>
                                                </div>
                                            }}
                                        </Draggable>
                                    })}
                                    {provided.placeholder}
                                </div>
                            }}
                        </Droppable>
                    </div>
                </DragDropContext>
            </Modal>
        </div>
    )
}
