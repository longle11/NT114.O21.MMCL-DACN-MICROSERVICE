import React from 'react'
import { NavLink } from 'react-router-dom';
export default function MenuBar() {
    return (
        <div className="page-content">
            <div className='d-flex' style={{ height: '100%' }}>
                <nav className='menu'>
                    <div className="sidebar">
                        <div className="logo pt-3 pb-3 justify-content-center">
                            <i className="bx bx-menu menu-icon" />
                            <span className="logo-name text-light">My Project</span>
                        </div>
                        <div className="sidebar-content">
                            <ul className="lists p-0">
                                <li className="list">
                                    <NavLink to={`/projectDetail/${localStorage.getItem('projectid')}`} className="nav-link">
                                        <i className="fa fa-home mr-3"></i>
                                        <span className="link">Dashboard</span>
                                    </NavLink>
                                </li>
                                <li className="list">
                                    <NavLink to="/create" className="nav-link">
                                        <i className="fa fa-plus mr-3"></i>
                                        <span className="link">Create Project</span>
                                    </NavLink>
                                </li>
                                <li className="list">
                                    <NavLink to="/manager" className="nav-link">
                                        <i className="fa fa-cog mr-3"></i>
                                        <span className="link">Project management</span>
                                    </NavLink>
                                </li>
                                <hr />
                                {/* <li className="list">
                                    <a href="#" className="nav-link">
                                        <i className="bx bx-bell icon" />
                                        <span className="link">Notifications</span>
                                    </a>
                                </li>
                                <li className="list">
                                    <a href="#" className="nav-link">
                                        <i className="bx bx-message-rounded icon" />
                                        <span className="link">Messages</span>
                                    </a>
                                </li>
                                <li className="list">
                                    <a href="#" className="nav-link">
                                        <i className="bx bx-pie-chart-alt-2 icon" />
                                        <span className="link">Analytics</span>
                                    </a>
                                </li>
                                <li className="list">
                                    <a href="#" className="nav-link">
                                        <i className="bx bx-heart icon" />
                                        <span className="link">Likes</span>
                                    </a>
                                </li>
                                <li className="list">
                                    <a href="#" className="nav-link">
                                        <i className="bx bx-folder-open icon" />
                                        <span className="link">Files</span>
                                    </a>
                                </li> */}
                            </ul>
                        </div>
                    </div>
                </nav>
            </div>
        </div>
    )
}
