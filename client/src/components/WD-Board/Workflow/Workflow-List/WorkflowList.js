import { Button, Modal, Table } from 'antd'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { GetWorkflowListAction } from '../../../../redux/actions/ListProjectAction'
import { NavLink, useNavigate, useParams } from 'react-router-dom'
import { iTagForIssueTypes } from '../../../../util/CommonFeatures'
import WorkflowView from '../Workflow-View/WorkflowView'
import { delay } from '../../../../util/Delay'

export default function WorkflowList() {
    const workflowList = useSelector(state => state.listProject.workflowList)
    const navigate = useNavigate()
    const { id } = useParams()
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [workflowId, setWorkflowId] = useState('')
    const dispatch = useDispatch()
    useEffect(() => {
        dispatch(GetWorkflowListAction(id))
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
                return <span>{record.project_id}</span>
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

            }
        },
        {
            title: 'Create At',
            dataIndex: 'createAt',
            render: (text, record) => {

            }
        },
        {
            title: 'Update At',
            dataIndex: 'updateAt',
            render: (text, record) => {

            }
        },
    ];
    return (
        <div>
            <div className='d-flex justify-content-between'>
                <h5>Workflows</h5>
                <Button type="primary" onClick={() => {
                    localStorage.setItem('nodes', JSON.stringify([{
                        id: '0',
                        type: 'custom',
                        data: {},
                        position: { x: 250, y: 0 },
                    },]))
                    localStorage.setItem('edges', JSON.stringify([]))
                    navigate(`/projectDetail/${id}/workflows/create-workflow`)

                }}>Add Workflow</Button>
            </div>
            <Table columns={columns} dataSource={workflowList} size="small" />

            <Modal destroyOnClose={true} title={`Workflow diagram ${workflowId}`} width={1000} open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
                <WorkflowView />
            </Modal>
        </div>
    )
}
