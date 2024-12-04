import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { handleClickOk, openModal } from '../../../redux/actions/ModalAction'
import { Input, Select } from 'antd'
import { issueTypeOptions } from '../../../util/CommonFeatures'
import { showNotificationWithIcon } from '../../../util/NotificationUtil'
import { MarkerType } from '@xyflow/react'
import { UpdateWorkflowAction } from '../../../redux/actions/ListProjectAction'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { createWorkflowAction } from '../../../redux/actions/CreateProjectAction'

export default function CreateOrUpdateWorkflowModal(props) {
    const workflowId = props.workflowId
    const workflowList = props.workflowList
    const nodes = props.nodes
    const edges = props.edges
    const projectInfo = props.projectInfo
    const userInfo = props.userInfo
    const [workflowName, setWorkflowName] = useState(JSON.parse(localStorage.getItem('workflowInfo')) !== null ? JSON.parse(localStorage.getItem('workflowInfo'))?.name_workflow : '')
    const [statuses, setStatuses] = useState(JSON.parse(localStorage.getItem('workflowInfo')) !== null ? JSON.parse(localStorage.getItem('workflowInfo'))?.issue_statuses : [0, 1, 2, 4])
    const id = props.id
    const dispatch = useDispatch()
    const navigate = useNavigate()
    useEffect(() => {
        dispatch(handleClickOk(handleOk))
    }, [workflowName, statuses])
    const handleOk = () => {
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

        // localStorage.removeItem('edges')
        // localStorage.removeItem('nodes')
        // localStorage.removeItem('workflowInfo')

        if (nodes.length !== 1 && edges.length !== 0) {
            if (statuses.length === 0) {
                showNotificationWithIcon('error', '', 'Status field must have at least one status')
            } else if (workflowName.trim() === "") {
                showNotificationWithIcon('error', '', 'Name workflow can not be left blank')
            }
            else {
                //if id is existed, for updating else for creating
                if (workflowId) {
                    dispatch(UpdateWorkflowAction(workflowId, {
                        project_id: id,
                        name_workflow: workflowName,
                        issue_statuses: statuses?.map(status => parseInt(status)),
                        nodes: customNode,
                        edges: customEdge,
                        updateAt: dayjs().toISOString()
                    }, navigate))
                } else {
                    dispatch(createWorkflowAction({
                        project_id: id,
                        name_workflow: workflowName,
                        issue_statuses: statuses?.map(status => parseInt(status)),
                        creator: userInfo.id,
                        nodes: customNode,
                        edges: customEdge,
                        createAt: dayjs().toISOString()
                    }, navigate))
                }

                setStatuses([])
                setWorkflowName('')
            }
            dispatch(openModal(false))
        } else {
            showNotificationWithIcon('error', '', 'Create failed. You need more than one node and one edge to start')
        }
    }
    const renderCurrentNameWorkflowForUpdating = () => {
        if (workflowId) {
            const getWorkflow = workflowList?.filter(workflow => workflow._id === workflowId)
            if (getWorkflow?.length !== 0) {
                return getWorkflow[0].name_workflow
            }
        }
        return null
    }
    return (
        <div>
             <p>Changes to this workflow will apply to the issue statuses selected.</p>
                <label>Enter a new name for your workflow <span className='text-danger'>*</span></label>
                <Input defaultValue={renderCurrentNameWorkflowForUpdating()} onChange={(e) => {
                    setWorkflowName(e.target.value)
                }} />
                <label className='mt-2'>Select the issue statuses you want to copy this workflow to: <span className='text-danger'>*</span></label>
                <Select
                    mode="multiple"
                    placeholder="Please select"
                    defaultValue={statuses}
                    options={issueTypeOptions(projectInfo?.issue_types_default)?.filter(option => option.value !== 3)}
                    onChange={(value) => {
                        setStatuses(value)
                    }}
                    onDeselect={(value) => {
                        const index = statuses?.findIndex(status => status === value) 
                        if(index !== -1) {
                            statuses.splice(index, 1)
                        }
                        setStatuses(statuses)
                    }}
                    style={{
                        width: '100%',
                    }}
                />
        </div>
    )
}
