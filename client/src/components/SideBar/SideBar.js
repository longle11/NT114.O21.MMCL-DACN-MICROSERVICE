import React, { useState } from 'react';
import './SideBar.css'
import '../Modal/InfoModal/InfoModal.css'
import { useDispatch, useSelector } from 'react-redux';
import { drawer_edit_form_action } from '../../redux/actions/DrawerAction';
import TaskForm from '../Forms/TaskForm';
import { Navigate, NavLink, useNavigate, useParams } from 'react-router-dom';
import { userLoggedoutAction } from '../../redux/actions/UserAction';
import { showNotificationWithIcon } from '../../util/NotificationUtil';
import Notification from '../Notifications/Notification';
import {
    AppstoreOutlined,
    ContainerOutlined,
    DesktopOutlined,
    MailOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    PieChartOutlined,
} from '@ant-design/icons';
import { Menu } from 'antd';
const SideBar = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const userInfo = useSelector(state => state.user.userInfo)
    const visible = useSelector(state => state.isOpenDrawer.visible)
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };
    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };
    function getItem(label, key, icon, children, type) {
        return {
            key,
            icon,
            children,
            label,
            type,
        };
    }

    const handleOnClickItem = (e) => {
        const key = e.key
        if(key === 'sub11') {
            console.log("vao day");
            return navigate("/roadmap")
        }
        else if (key === 'sub12') {
            return navigate("/backlog")
        }
        else if (key === 'sub12') {
            return navigate("/active-sprints")
        }
        else if (key === 'sub13') {
            return navigate("/issues")
        }
        else if (key === 'sub2') {
            return navigate("/reports")
        }
        else if (key === 'sub3') {
            return navigate("/components")
        }
        else if (key === 'sub21') {
            return navigate("/code")
        }
        else if (key === 'sub22') {
            return navigate("/releases")
        }
    }
    const items = [
        getItem('PLANNING', '1', <i className="fa fa-tasks" aria-hidden="true"></i>, [
            getItem('WD board', 'sub1', <i className="fa-solid fa-table-columns"></i>, [
                getItem('Roadmap', 'sub11'),
                getItem('Backlog', 'sub12'),
                getItem('Active sprints', 'sub13'),
                getItem('Reports', 'sub14')
            ]),
            getItem('Issues', 'sub2', <i className="fa-solid fa-circle-exclamation"></i>),
            getItem('Components', 'sub3')
        ]),
        getItem('Development', '2', <DesktopOutlined />, [
            getItem('Code', 'sub21'),
            getItem('Releases', 'sub22')
        ]),
    ];
    const { id } = useParams()
    return (
        <div className={`page-wrapper ${isSidebarOpen ? 'toggled' : ''}`}>
            <NavLink id="show-sidebar" className="btn btn-sm btn-dark" to="#" onClick={toggleSidebar} style={{ zIndex: 9999 }}>
                <i className="fas fa-bars"></i>
            </NavLink>
            <nav id="sidebar" className="sidebar-wrapper bg-dark">
                <div>
                    <div className="sidebar-content" style={{ overflow: 'hidden' }}>
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
                                    <span style={{color: 'white'}}>Planning</span>
                                </li>
                                <li className="sidebar-dropdown font-weight-bold" style={{ fontSize: '17px' }}>
                                    <NavLink href="#" onClick={() => {
                                        if (id) {
                                            dispatch(drawer_edit_form_action(<TaskForm />, "Submit", 720, '30px'))
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
                                        dispatch(drawer_edit_form_action(<Notification />, "Clear All Notifications", 300, '0px'))
                                    }}>
                                        <i style={{ fontSize: '17px' }} className="fa-solid fa-bell text-light"></i>
                                        <span className='text-light'>Notification</span>
                                    </NavLink>
                                </li>
                            </ul>
                            <Menu
                                defaultSelectedKeys={['1']}
                                mode="inline"
                                items={items}
                                onClick={(e) => {
                                    handleOnClickItem(e)
                                }}
                            />
                        </div>
                    </div>
                    {/* <div className="sidebar-footer">
                        <NavLink href="#" style={{ width: '100%', backgroundColor: 'lightskyblue' }} onClick={() => {
                            dispatch(userLoggedoutAction())
                        }}>
                            <i className="fa fa-power-off" />
                        </NavLink>
                    </div> */}
                </div>
            </nav>
        </div>
    );
};

export default SideBar;