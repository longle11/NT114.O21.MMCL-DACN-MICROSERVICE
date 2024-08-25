import React, { useState } from 'react';
import './SideBar.css'
import '../Modal/InfoModal/InfoModal.css'
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    DesktopOutlined,
} from '@ant-design/icons';
import { Menu } from 'antd';
import { getIssuesBacklog } from '../../redux/actions/IssueAction';
import { GetProcessListAction } from '../../redux/actions/ListProjectAction';
const SideBar = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const userInfo = useSelector(state => state.user.userInfo)
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };
    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };
    const absolutePath = `/projectDetail/${userInfo.project_working.toString()}`
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
        if (key === 'sub11') {
            dispatch(GetProcessListAction(userInfo.project_working.toString()))
            return navigate(`${absolutePath}/board`)
        }
        else if (key === 'sub12') {
            dispatch(getIssuesBacklog(userInfo.project_working.toString()))                    
            return navigate(`${absolutePath}/backlog`)
        }
        else if (key === 'sub12') {
            return navigate(`${absolutePath}/active-sprints`)
        }
        else if (key === 'sub13') {
            return navigate(`${absolutePath}/issues`)
        }
        else if (key === 'sub15') {
            return navigate(`${absolutePath}/list`)
        }
        else if (key === 'sub16') {
            return navigate(`${absolutePath}/issues/issue-detail`)
        }
        else if (key === 'sub17') {
            return navigate(`${absolutePath}/workflows`)
        }
        else if (key === 'sub2') {
            return navigate(`${absolutePath}/reports`)
        }
        else if (key === 'sub3') {
            return navigate(`${absolutePath}/components`)
        }
        else if (key === 'sub21') {
            return navigate(`${absolutePath}/code`)
        }
        else if (key === 'sub22') {
            return navigate(`${absolutePath}/releases`)
        }
        else if (key === 'sub23') {
            return navigate(`${absolutePath}/epics`)
        }
        else if (key === 'sub31') {
            return navigate(`${absolutePath}/settings/access`)
        }
    }
    const items = [
        getItem('PLANNING', '1', <i className="fa fa-tasks" aria-hidden="true"></i>, [
            getItem('WD board', 'sub1', <i className="fa-solid fa-table-columns"></i>, [
                getItem('Board', 'sub11'),
                getItem('Backlog', 'sub12'),
                getItem('Active sprints', 'sub13'),
                getItem('Reports', 'sub14'),
                getItem('List', 'sub15'),
                getItem('Issues', 'sub16'),
                getItem('Workflows', 'sub17'),
            ]),
            getItem('Issues', 'sub2', <i className="fa-solid fa-circle-exclamation"></i>),
            getItem('Components', 'sub3')
        ]),
        getItem('Development', '2', <DesktopOutlined />, [
            getItem('Code', 'sub21'),
            getItem('Releases', 'sub22'),
            getItem('Epics', 'sub23')
        ]),
        getItem('Settings', '3', <DesktopOutlined />, [
            getItem('Add user', 'sub31')
         
        ]),
    ];
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
                                <div></div>
                                <div className='d-flex flex-column ml-2 justify-content-center'>
                                    <h4 className='m-0 text-light'>
                                        Du an ngu dan
                                    </h4>
                                    <h6 className='m-0 text-light'>
                                        Cong nghe phan mem
                                    </h6>
                                </div>
                            </div>
                            <button className='btn bg-transparent' id="close-sidebar" onKeyDown={() => { }} onClick={closeSidebar}>
                                <i className="fas fa-times text-light" />
                            </button>
                        </div>
                        <div className="sidebar-menu">
                            {/* <ul>
                                <li className="header-menu">
                                    <span style={{color: 'white'}}>Planning</span>
                                </li>
                                <li className="sidebar-dropdown font-weight-bold" style={{ fontSize: '17px' }}>
                                    <NavLink href="#" onClick={() => {
                                        // if (id) {
                                        //     dispatch(drawer_edit_form_action(<TaskForm />, "Submit", 720, '30px'))
                                        // } else {
                                        //     showNotificationWithIcon('error', 'Create Issue', 'Vui long tham gia vao du an truoc khi tao van de')
                                        // }
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
                            </ul> */}
                            {
                                userInfo.project_working !== null ? <Menu
                                    defaultSelectedKeys={['1']}
                                    mode="inline"
                                    items={items}
                                    onClick={(e) => {
                                        handleOnClickItem(e)
                                    }}
                                /> : <></>
                            }
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