import React, { useEffect, useState } from 'react'
import MenuBar from '../components/MenuBar/MenuBar'
import InfoModal from '../components/Modal/InfoModal/InfoModal'
import SideBar from '../components/SideBar/SideBar'
import '../components/MenuBar/MenuBar.css'
import '../components/Dashboard/Dashboard.css'
import '../components/SideBar/SideBar.css'
import '../components/Modal/InfoModal/InfoModal.css'
import DrawerHOC from '../HOC/DrawerHOC'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { userLoggedInAction } from '../redux/actions/UserAction'
import { GetProjectAction } from '../redux/actions/ListProjectAction'
import { Modal } from 'antd'
export default function MainPageTemplate({ Component }) {
    const status = useSelector(state => state.user.status)
    const isLoading = useSelector(state => state.loading.isLoading)
    const dispatch = useDispatch()
    const [isModalOpen, setIsModalOpen] = useState(true);
    const navigate = useNavigate()

    useEffect(() => {
        dispatch(userLoggedInAction())
        //lay ra project hien tai
        if (typeof localStorage.getItem('projectid') === 'string' && localStorage.getItem('projectid').length >= 10) {
            dispatch(GetProjectAction(localStorage.getItem('projectid'), ""))
        }
    }, [])
    const handleLogin = () => {
        setIsModalOpen(false);
        navigate("/login")
    };
    return (
        !isLoading ? (
            status ? (
                <div className='d-flex' style={{ overflow: 'hidden' }}>
                    <DrawerHOC />
                    <SideBar />
                    <MenuBar />
                    <div style={{ width: '100%' }} className='main'>
                        <Component />
                    </div>
                    <InfoModal />
                </div>
            ) : <Modal title="Thông báo" open={isModalOpen} onCancel={handleLogin} onOk={handleLogin} centered>
                <p>Phiên đăng nhập của bạn đã hết hạn, vui lòng đăng nhập lại</p>
            </Modal>
        ) : <></>
    )
}
