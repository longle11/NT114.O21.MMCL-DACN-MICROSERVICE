import React from 'react'
import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
export default function MenuBar() {
    const listProject = useSelector(state => state.listProject.listProject)
    const userInfo = useSelector(state => state.user.userInfo)
    const renderCurrentProject = () => {
        const index = listProject.findIndex(project => localStorage.getItem('projectid')?.length >= 10 && project._id.toString() === localStorage.getItem('projectid'))
        if (index !== -1) {
            //xem user hiện tại có phải là người tạo dự án hay không
            var isProjectOwner = userInfo.id === listProject[index]?.creator?._id.toString()
            const listMembers = listProject[index]?.members.map(member => member._id.toString())
            var isProjectMembers = listMembers.includes(userInfo.id)
            if (isProjectMembers || isProjectOwner) {
                return <li className="list">
                    <NavLink to={`/projectDetail/${localStorage.getItem('projectid')}`} className="nav-link">
                        <i className="fa fa-home mr-3"></i>
                        <span className="link">Dashboard</span>
                    </NavLink>
                </li>

            }
        }
        const projectCreated = localStorage.getItem('projectid').length >= 10 ? "" : "none"
        return <li className="list" style={{ pointerEvents: projectCreated }}>
            <NavLink to={`/projectDetail/`} className="nav-link">
                <i className="fa fa-home mr-3"></i>
                <span className="link">Dashboard</span>
            </NavLink>
        </li>
    }
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
                                {renderCurrentProject()}
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
