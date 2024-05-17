import React, { useState } from 'react';
import './SideBar.css'
import '../Modal/InfoModal/InfoModal.css'
import { useDispatch, useSelector } from 'react-redux';
import { drawer_edit_form_action } from '../../redux/actions/DrawerAction';
import TaskForm from '../Forms/TaskForm';
import { NavLink, useParams } from 'react-router-dom';
import { userLoggedoutAction } from '../../redux/actions/UserAction';
import { showNotificationWithIcon } from '../../util/NotificationUtil';
import Notification from '../Notifications/Notification';
const SideBar = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const dispatch = useDispatch()

    const userInfo = useSelector(state => state.user.userInfo)

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };
    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };
    const { id } = useParams()
    return (
        <div className={`page-wrapper ${isSidebarOpen ? 'toggled' : ''}`}>
            <NavLink id="show-sidebar" className="btn btn-sm btn-dark" to="#" onClick={toggleSidebar} style={{ zIndex: 9999 }}>
                <i className="fas fa-bars"></i>
            </NavLink>
            <nav id="sidebar" className="sidebar-wrapper bg-dark">
                <div>
                    <div className="sidebar-content" style={{overflow: 'hidden'}}>
                        <div className="sidebar-brand">
                            <div className='slidebar-infoUser'>
                                <img src={userInfo?.avatar} style={{ borderRadius: '50%' }} alt='avatar of user' />
                                <div className='d-flex flex-column ml-2 justify-content-center'>
                                    <h4 className='m-0 text-light'>
                                        {userInfo?.username}
                                    </h4>
                                    <h6 className='m-0 text-light'>
                                        {userInfo?.email}
                                    </h6>
                                </div>
                            </div>
                            <button className='btn bg-transparent' id="close-sidebar" onKeyDown={() => { }} onClick={closeSidebar}>
                                <i className="fas fa-times text-light" />
                            </button>
                        </div>
                        <div className="sidebar-menu">
                            <ul>
                                <li className="header-menu">
                                    <span>General</span>
                                </li>
                                <li className="sidebar-dropdown font-weight-bold" style={{ fontSize: '17px' }}>
                                    <NavLink href="#" onClick={() => {
                                        if (id) {
                                            dispatch(drawer_edit_form_action(<TaskForm />, "Submit", 720))
                                        } else {
                                            showNotificationWithIcon('error', 'Create Issue', 'Vui long tham gia vao du an truoc khi tao van de')
                                        }
                                    }}>
                                        <i style={{ fontSize: '17px' }} className="fa-solid fa-plus text-light"></i>
                                        <span className='text-light'>Create Issue</span>
                                    </NavLink>
                                </li>
                                <li className="sidebar-dropdown font-weight-bold" style={{ fontSize: '17px' }}>
                                    <NavLink href="#" onClick={() => {
                                        dispatch(drawer_edit_form_action(<Notification />, "Clear All Notifications", 300))
                                    }}>
                                        <i style={{ fontSize: '17px' }} className="fa-solid fa-bell text-light"></i>
                                        <span className='text-light'>Notification</span>
                                    </NavLink>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="sidebar-footer">
                        <NavLink href="#" style={{ width: '100%', backgroundColor: 'lightskyblue' }} onClick={() => {
                            dispatch(userLoggedoutAction())
                        }}>
                            <i className="fa fa-power-off" />
                        </NavLink>
                    </div>
                </div>
            </nav>
        </div>
    );
};

export default SideBar;