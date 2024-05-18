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
import PropTypes from 'prop-types';
import { io } from 'socket.io-client'
import domainName from '../util/Config'

export default function MainPageTemplate({ Component }) {
    const status = useSelector(state => state.user.status)
    const isLoading = useSelector(state => state.loading.isLoading)
    const dispatch = useDispatch()
    const [isModalOpen, setIsModalOpen] = useState(true);
    const navigate = useNavigate()

    useEffect(() => {
        // const socket = io(`${domainName}/api/projectmanagement`)
        const socket = io("http://projectmanagement-srv:4003")
        console.log("New result ", socket);

        dispatch(userLoggedInAction())
        //lay ra project hien tai
        if (localStorage.getItem('projectid') !== null && typeof localStorage.getItem('projectid') === 'string' && localStorage.getItem('projectid').length >= 10) {
            dispatch(GetProjectAction(localStorage.getItem('projectid'), ""))
        }
        // eslint-disable-next-line
    }, [])
    const handleLogin = () => {
        setIsModalOpen(false);
        navigate("/login")
    };
    const content = () => {

        if (!isLoading) {
            if (status) {
                return <div className='d-flex' style={{ overflow: 'hidden' }}>
                    <DrawerHOC />
                    <SideBar />
                    <MenuBar />
                    <div style={{ width: '100%' }} className='main'>
                        <Component />
                    </div>
                    <InfoModal />
                </div>
            } else {
                return <Modal title="Thông báo" open={isModalOpen} onCancel={handleLogin} onOk={handleLogin} centered>
                    <p>Your login session has expired, please log in again</p>
                </Modal>
            }
        }
        return null
    }
    return <>{content()}</>
}
MainPageTemplate.propTypes = {
    Component: PropTypes.elementType.isRequired
};