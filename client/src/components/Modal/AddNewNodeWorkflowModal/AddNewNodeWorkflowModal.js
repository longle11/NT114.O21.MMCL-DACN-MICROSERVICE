import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { handleClickOk, openModal } from '../../../redux/actions/ModalAction'
import { Input } from 'antd'
import mongoose from 'mongoose'
import { showNotificationWithIcon } from '../../../util/NotificationUtil'

export default function AddNewNodeWorkflowModal(props) {
    const setNodes = props.setNodes
    const nodes = props.nodes
    const dispatch = useDispatch()
    const [valueNameProcess, setValueNameProcess] = useState('')
    useEffect(() => {
        dispatch(handleClickOk(handleOk))
    }, [valueNameProcess])
    //create randomly color for new process
    function generateColor() {
        const randomColor = Math.floor(Math.random() * 16777215).toString(16);
        return '#' + randomColor
    }
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

        dispatch(openModal(false))
    }, []);
    const handleOk = () => {
        if (!nodes.map(node => node.data.label.toLowerCase()).includes(valueNameProcess.toLowerCase())) {
            onAdd(valueNameProcess)
        } else {
            showNotificationWithIcon('error', '', 'This name is already existed, please entering the different name')
        }
    }
    return (
        <div>
            <Input value={valueNameProcess} defaultValue="" onChange={(e) => {
                setValueNameProcess(e.target.value)
            }} placeholder='Enter name for new node' />
            <small>Try a name that's easy to understand e.g. To do</small>
        </div>
    )
}
