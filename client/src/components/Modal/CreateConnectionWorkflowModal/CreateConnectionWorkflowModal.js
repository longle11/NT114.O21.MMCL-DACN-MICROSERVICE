import React, { useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { handleClickOk, openModal } from '../../../redux/actions/ModalAction'
import { Input, Select } from 'antd'
import { showNotificationWithIcon } from '../../../util/NotificationUtil'
import { MarkerType } from '@xyflow/react'

export default function CreateConnectionWorkflowModal(props) {
    const nodes = props.nodes
    const setLabelEdge = props.setLabelEdge
    const labelEdge = props.labelEdge
    const setEdges = props.setEdges
    const addEdge = props.addEdge
    const params = props.params
    const labelName = useRef('')
    const [valueConnection, setValueConnection] = useState(params !== null ? params : {})
    
    const dispatch = useDispatch()
    useEffect(() => {
        dispatch(handleClickOk(handleOk))
        if(params) {
            setValueConnection(params)
        }
    }, [valueConnection, params])

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
            //default if valueConnection is null, that means user doesn't choose any status => default is both default selection
            if (Object.keys(valueConnection).length === 0) {
                valueConnection.source = nodeOptions()[0].id
                valueConnection.target = nodeOptions()[0].id
                valueConnection.sourceHandle = null
                valueConnection.targetHandle = null
            }
            setEdges((eds) => {
                valueConnection.label = labelName.current
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
            labelName.current = ''
            setValueConnection({})
            setLabelEdge('')
            dispatch(openModal(false))
        }
    }
    return (
        <div>
            <p>Connections connect statuses. They represent actions people take to move issues through your workflow. They also appear as drop zones when people move cards across your project's board.</p>
            <div className='row'>
                <div className='col-6 d-flex flex-column'>
                    <label htmlFor='fromStatus'>From status</label>
                    <Select defaultValue={valueConnection !== null && Object.keys(valueConnection).length !== 0 ? valueConnection.source : null} options={nodeOptions()} id='fromStatus' onSelect={(value) => {
                        valueConnection.source = value
                        valueConnection.sourceHandle = null
                    }} />
                </div>
                <div className='col-6 d-flex flex-column'>
                    <label htmlFor='targetStatus'>To status</label>
                    <Select defaultValue={valueConnection !== null && Object.keys(valueConnection).length !== 0 ? valueConnection.target : null} options={nodeOptions()} id='targetStatus' onSelect={(value) => {
                        valueConnection.target = value
                        valueConnection.targetHandle = null
                    }} />
                </div>
            </div>
            <div>
                <label htmlFor='name'>Name</label>
                <Input placeholder='Give your connection a name' defaultValue={labelEdge} onChange={(e) => {
                    labelName.current = e.target.value
                    setLabelEdge(e.target.value)
                }} />
                <small>Try a name that's easy to understand e.g. todo</small>
            </div>
        </div>
    )
}
