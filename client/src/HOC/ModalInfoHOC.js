import { Modal } from 'antd'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { displayComponentInModalInfo, openModalInfo } from '../redux/actions/ModalAction'

export default function ModalInfoHOC() {
    const visibleModalInfo = useSelector(state => state.isOpenModal.visibleModalInfo)
    const componentModalInfo = useSelector(state => state.isOpenModal.componentModalInfo)
    const setWidthInfo = useSelector(state => state.isOpenModal.setWidthInfo)
    const dispatch = useDispatch()
    const handleCancel = () => {
        dispatch(displayComponentInModalInfo(<div />))   //create default component for modal
        dispatch(openModalInfo(false))  //default it will close modal
    }
    const [loading, setLoading] = React.useState(true);
    // const showLoading = () => {
    //     setOpen(true);
    //     setLoading(true);
    
    //     // Simple loading mock. You should add cleanup logic in real world.
    //     setTimeout(() => {
    //       setLoading(false);
    //     }, 2000);
    //   };
    return (
        <Modal
            destroyOnClose="true"
            open={visibleModalInfo}
            footer={null}
            width={setWidthInfo}
            onCancel={handleCancel}
            centered
            // loading={loading}
            closable={false}
        >
            {componentModalInfo}
        </Modal>
    )
}
