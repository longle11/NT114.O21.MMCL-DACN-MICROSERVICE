import { Avatar, Button, Modal, Popconfirm, Table } from 'antd'
import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { DeleteWorkflowAction, GetProcessListAction, GetProjectAction, GetSprintListAction, GetWorkflowListAction, UpdateWorkflowAction } from '../../../../redux/actions/ListProjectAction'
import { NavLink, useNavigate, useParams } from 'react-router-dom'
import { iTagForIssueTypes } from '../../../../util/CommonFeatures'
import WorkflowView from '../Workflow-View/WorkflowView'
import { EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs'
import { showNotificationWithIcon } from '../../../../util/NotificationUtil'
import { delay } from '../../../../util/Delay'
import { displayComponentInModal } from '../../../../redux/actions/ModalAction'
import UpdateProcessesOnDashboard from '../../../Modal/UpdateProcessesOnDashboard/UpdateProcessesOnDashboard'

export default function WorkflowList() {
    const workflowList = useSelector(state => state.listProject.workflowList)
    const navigate = useNavigate()
    const { id } = useParams()
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [workflowId, setWorkflowId] = useState('')
    const projectInfo = useSelector(state => state.listProject.projectInfo)
    const processList = useSelector(state => state.listProject.processList)
    const sprintList = useSelector(state => state.listProject.sprintList)
    const workflowWorking = useRef({})

    const dispatch = useDispatch()
    useEffect(() => {
        dispatch(GetWorkflowListAction(id))
        dispatch(GetProjectAction(id, null, null))
        dispatch(GetProcessListAction(id))
        dispatch(GetSprintListAction(id, null))
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
            align: 'center',
            render: (text, record) => {
                return <span>{record.issue_statuses.map((status, index) => {
                    return <span key={index}>{iTagForIssueTypes(status, null, null)}</span>
                })}</span>
            }
        },
        {
            title: 'Creator',
            dataIndex: 'creator',
            align: 'center',
            render: (text, record) => {
                return <span style={{ with: 'max-content' }}><Avatar src={record.creator.avatar} className='mr-2' />{record.creator.username}</span>
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
                return <span>{dayjs(record.updateAt).format("DD/MM/YYYY")}</span>
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
                                localStorage.setItem('workflowInfo', JSON.stringify(record))
                            }}>Edit</a>
                            <Popconfirm
                                title="Delete an inactive workflow"
                                description="Are you sure to delete this workflow?"
                                onConfirm={() => {
                                    dispatch(DeleteWorkflowAction(record._id, id))
                                }}
                                okText="Yes"
                                cancelText="No"
                            >
                                {record?.isActivated ? <></> : <a className="dropdown-item" href="##">Delete</a>}
                            </Popconfirm>

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
                                        dispatch(displayComponentInModal(<UpdateProcessesOnDashboard workflowList={workflowList} flowArrs={[]} currentWorkflowInactive={null} processListTemp={processList} id={id} projectInfo={projectInfo} sprintList={sprintList} processesWorkflow={record} processList={processList} workflowWorking={workflowWorking}/>, 500, 'Update new processes on dashboard'))
                                        workflowWorking.current = record
                                    } else {
                                        showNotificationWithIcon('success', '', 'There are no duplicate values')
                                    }
                                } else {
                                    var flowArrs = []
                                    getAllWorkflowInActiveMode.forEach(workflow => {
                                        getCurrentWorkflow.issue_statuses.forEach(status => {
                                            if (workflow.issue_statuses.includes(status)) {
                                                if (flowArrs.length === 0 || flowArrs.findIndex(flow => flow === workflow._id) === -1) {
                                                    flowArrs.push(workflow)
                                                    return
                                                }
                                            }
                                        })
                                    })
                                    //if this array has length equal 0, which means it doesn't have those statuses in active
                                    if (flowArrs.length === 0) {
                                        dispatch(UpdateWorkflowAction(getCurrentWorkflow._id, { isActivated: true }))   //if there are no have any statuses => move to active
                                    } else {
                                        const updatedActiveWorkflows = []
                                        //proceed to remove statuses in active of current workflow to apply statuses in inactive workflow
                                        flowArrs = [...new Set(flowArrs)]
                                        //move this flow to active and all flows in active to inactive
                                        flowArrs.forEach((flow, index) => {
                                            //procceed to unmount statuses on active mode 
                                            if (updatedActiveWorkflows.length === 0) {
                                                flow.issue_statuses.forEach(currentStatus => {
                                                    if (!getCurrentWorkflow.issue_statuses.includes(currentStatus)) {

                                                        if (updatedActiveWorkflows.length === 0) {
                                                            updatedActiveWorkflows.push({ workflow_id: flow._id, issue_statuses: [currentStatus] })
                                                        } else {
                                                            const index = updatedActiveWorkflows.findIndex(workflow => workflow.workflow_id === flow._id)
                                                            if (index !== -1) {
                                                                updatedActiveWorkflows[index].issue_statuses.push(currentStatus)
                                                            }
                                                        }
                                                    } else {
                                                        if (updatedActiveWorkflows.length === 0) {
                                                            updatedActiveWorkflows.push({ workflow_id: flow._id, issue_statuses: [] })
                                                        }
                                                    }
                                                })
                                            } else {
                                                flow.issue_statuses.forEach(currentStatus => {
                                                    if (updatedActiveWorkflows.map(currentFlow => currentFlow.workflow_id).includes(flow._id)) {
                                                        if (!getCurrentWorkflow.issue_statuses.includes(currentStatus)) {
                                                            const index = updatedActiveWorkflows.findIndex(workflow => workflow.workflow_id === flow._id)
                                                            if (index !== -1) {
                                                                updatedActiveWorkflows[index].issue_statuses.push(currentStatus)
                                                            }
                                                        }
                                                    } else {
                                                        if (!getCurrentWorkflow.issue_statuses.includes(currentStatus)) {
                                                            updatedActiveWorkflows.push({ workflow_id: flow._id, issue_statuses: [currentStatus] })
                                                        } else {
                                                            updatedActiveWorkflows.push({ workflow_id: flow._id, issue_statuses: [] })
                                                        }
                                                    }
                                                })
                                            }

                                        })
                                        if (updatedActiveWorkflows.length > 0) {
                                            dispatch(displayComponentInModal(<UpdateProcessesOnDashboard workflowList={workflowList} flowArrs={[...updatedActiveWorkflows]} currentWorkflowInactive={getCurrentWorkflow} processListTemp={processList} id={id} projectInfo={projectInfo} sprintList={sprintList} processesWorkflow={record} processList={processList} workflowWorking={workflowWorking}/>, 500, 'Update new processes on dashboard'))
                                        }
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
                    localStorage.setItem('workflowInfo', JSON.stringify(null))
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
        </div>
    )
}
