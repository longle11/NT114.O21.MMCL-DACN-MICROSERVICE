import React, { useEffect } from 'react'
import InfoModal from '../components/Modal/InfoModal/InfoModal'
import SideBar from '../components/SideBar/SideBar'
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

export default function MainPageTemplate({ Component }) {
    const isLoading = useSelector(state => state.loading.isLoading)
    const userInfo = useSelector(state => state.user.userInfo)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    useEffect(() => {
        dispatch(userLoggedInAction())
    }, [])
    const handleLogin = () => {
        return navigate("/login")
    }
    const content = () => {
        if (!isLoading) {
            console.log(userInfo);
            if (userInfo !== null) {
                return <div>
                    <MenuBarHeader />
                    <div style={{ overflow: 'hidden', display: 'flex' }}>
                        <DrawerHOC />
                        {userInfo.project_working !== null ? <SideBar /> : <></>}
                        {/* <MenuBar /> */}
                        <div style={{ width: '100%', padding: 0 }} className='main'>
                            <Component />
                        </div>
                        <InfoModal />
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