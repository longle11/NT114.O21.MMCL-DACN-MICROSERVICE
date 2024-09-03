import React, { useEffect } from 'react'
import InfoModal from '../components/Modal/InfoModal/InfoModal'
import '../components/MenuBar/MenuBar.css'
import '../components/Dashboard/Dashboard.css'
import '../components/SideBar/SideBar.css'
import '../components/Modal/InfoModal/InfoModal.css'
import DrawerHOC from '../HOC/DrawerHOC'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types';
import MenuBarHeader from '../components/Header/MenuBarHeader'
import { userLoggedInAction } from '../redux/actions/UserAction'
import { Layout } from 'antd'
import MenuBar from '../components/MenuBar/MenuBar'
import { ListProjectAction } from '../redux/actions/ListProjectAction'
import ModalHOC from '../HOC/ModalHOC'
export default function MainPageTemplate({ Component }) {
    const isLoading = useSelector(state => state.loading.isLoading)
    const userInfo = useSelector(state => state.user.userInfo)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    useEffect(() => {
        dispatch(userLoggedInAction())
        dispatch(ListProjectAction())
    }, [])

    const handleLogin = () => {
        return navigate("/login")
    }
    const content = () => {
        if (!isLoading) {
            if (userInfo !== null) {
                return <div>
                    <MenuBarHeader />
                    <div style={{ display: 'flex', width: '100%' }}>
                        <Layout
                            style={{
                                minHeight: '100vh',
                                backgroundColor: '#ffff',
                                overflowY: 'auto'
                            }}
                        >
                            { userInfo.project_working !== null ? <MenuBar /> : <></> }
                            <DrawerHOC />
                            <ModalHOC />
                            {/* <MenuBar /> */}
                            <div style={{ width: '100%', padding: '0 10px', marginBottom: '20px',  height: '90vh', overflowX: 'hidden' }} className='main'>
                                <Component />
                            </div>
                            <InfoModal />
                        </Layout>
                    </div>
                </div>
            }
            // else {
            //     return <Modal title="Notification" open="true" onCancel={handleLogin} onOk={handleLogin} centered>
            //         <p>Your login session has expired, please log in again</p>
            //     </Modal>
            // }
        }
        return null
    }
    return <>{content()}</>
}
MainPageTemplate.propTypes = {
    Component: PropTypes.elementType.isRequired
};