import { Modal } from 'antd'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { displayComponentInModal, openModal } from '../redux/actions/ModalAction'

export default function ModalHOC() {
    const visible = useSelector(state => state.isOpenModal.visible)
    const handleOk = useSelector(state => state.isOpenModal.handleOk)
    const component = useSelector(state => state.isOpenModal.component)
    const setWidth = useSelector(state => state.isOpenModal.setWidth)
    const setTitle = useSelector(state => state.isOpenModal.setTitle)
    const dispatch = useDispatch()
    
    const handleCancel = () => {
        dispatch(displayComponentInModal(<div />))   //create default component for modal
        dispatch(openModal(false))  //default it will close modal
    }
    return (
        <Modal
            destroyOnClose="true"
            open={visible}
            width={setWidth}
            title={setTitle}
            onOk={handleOk}
            onCancel={handleCancel}
            centered
        >
            {component}
        </Modal>
    )
}
