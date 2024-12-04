import { Modal } from 'antd'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { displayChildComponentInModal, openChildModal } from '../redux/actions/ModalAction'

export default function ChildModalHOC() {
    const childVisible = useSelector(state => state.isOpenModal.childVisible)
    const childHandleOk = useSelector(state => state.isOpenModal.childHandleOk)
    const childComponent = useSelector(state => state.isOpenModal.childComponent)
    const childSetWidth = useSelector(state => state.isOpenModal.childSetWidth)
    const childSetTitle = useSelector(state => state.isOpenModal.childSetTitle)
    const dispatch = useDispatch()
    
    const handleCancel = () => {
        dispatch(displayChildComponentInModal(<div />))   //create default component for modal
        dispatch(openChildModal(false))  //default it will close modal
    }
    return (
        <Modal
            destroyOnClose="true"
            open={childVisible}
            width={childSetWidth}
            title={childSetTitle}
            onOk={childHandleOk}
            onCancel={handleCancel}
            centered
        >
            {childComponent}
        </Modal>
    )
}
