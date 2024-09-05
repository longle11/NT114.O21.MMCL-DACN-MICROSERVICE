import { Modal } from 'antd'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { displayComponentInModalInfo, openModalInfo } from '../redux/actions/ModalAction'

export default function ModalInfoHOC() {
    const visibleModalInfo = useSelector(state => state.isOpenModal.visibleModalInfo)
    const componentModalInfo = useSelector(state => state.isOpenModal.componentModalInfo)
    const dispatch = useDispatch()
    const handleCancel = () => {
        dispatch(displayComponentInModalInfo(<div />))   //create default component for modal
        dispatch(openModalInfo(false))  //default it will close modal
    }
    return (
        <Modal
            destroyOnClose="true"
            open={visibleModalInfo}
            footer={null}
            width={1024}
            onCancel={handleCancel}
            centered
            closable={false}
        >
            {componentModalInfo}
        </Modal>
    )
}
