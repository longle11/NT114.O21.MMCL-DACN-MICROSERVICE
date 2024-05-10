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
                            <span className="logo-name text-light">Jira Project</span>
                        </div>
                        <div className="sidebar-content">
                            <ul className="lists p-0">
                                <li className="list" style={{ pointerEvents: localStorage.getItem('projectid')?.length >= 10 ? "auto" : "none" }}>
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
                            </ul>
                        </div>
                    </div>
                </nav>
            </div>
        </div>
    )
}
