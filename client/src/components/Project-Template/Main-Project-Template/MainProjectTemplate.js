import React from 'react'
import { NavLink } from 'react-router-dom';
export default function MainProjectTemplate() {
    return (
        <div>
            <h5>Software development</h5>
            <p>Plan, track and release great software. Get up and running quickly with templates that suit the way your team works. Plus, integrations for DevOps teams that want to connect work across their entire toolchain.</p>
            <div className='container'>
                <div className='text-end'>
                    <NavLink onClick={(e) => {
                        localStorage.removeItem('content')
                        localStorage.removeItem('file_info')
                        localStorage.removeItem('key_project')
                        localStorage.removeItem('project_name')
                        localStorage.setItem('delimiter', JSON.stringify(','))
                        localStorage.setItem('project_template', '0')
                        localStorage.removeItem('tab-preview')
                    }} to='/create-project/software-project/templates/imports'>
                        <i className="fa-solid fa-file-import"></i>
                        <span className='ml-1'>Import data to a new project</span>
                    </NavLink>
                    <div>
                        <div className="card" style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'between',
                            width: '100%',
                            alignItems: 'center',
                            marginTop: 15
                        }}>
                            <div style={{ backgroundColor: '#dddd' }}>
                                <img style={{ width: 200, height: '100%' }} src="https://taskschedulerproject.atlassian.net/s/-oo8t1n/b/9/d0630ad8e2b33a2fc7347459a3397d94eb3a0393/_/download/resources/com.atlassian.jira.project-templates-plugin:project-templates-next-icons/icons/kanban.svg" alt="kanban image" />
                            </div>
                            <div className='ml-3 w-100 d-flex justify-content-between align-items-center'>
                                <div style={{ width: '70%' }}>
                                    <h5 className="card-title">Kanban</h5>
                                    <p className="card-text">Visualize and advance your project forward using issues on a powerful board.</p>
                                </div>
                                <div className='mr-4'>
                                    <NavLink to="/create-project/software-project/templates/kaban-template" className="d-flex">
                                        <span className='mr-2'>Use this template</span>
                                        <i style={{ fontSize: 22 }} className="fa-solid fa-angle-right"></i>
                                    </NavLink>
                                </div>
                            </div>
                        </div>

                        <div className="card" style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'between',
                            width: '100%',
                            alignItems: 'center',
                            marginTop: 15
                        }}>
                            <div style={{ backgroundColor: '#dddd' }}>
                                <img style={{ width: 200, height: '100%' }} src="https://taskschedulerproject.atlassian.net/s/-oo8t1n/b/9/d0630ad8e2b33a2fc7347459a3397d94eb3a0393/_/download/resources/com.atlassian.jira.project-templates-plugin:project-templates-next-icons/icons/scrum.svg" alt="scrum image" />
                            </div>
                            <div className='ml-3 w-100 d-flex justify-content-between align-items-center'>
                                <div style={{ width: '70%' }}>
                                    <h5 className="card-title">Scrum</h5>
                                    <p className="card-text">Sprint toward your project goals with a board, backlog, and timeline.</p>
                                </div>
                                <div className='mr-4'>
                                    <NavLink to='/create-project/software-project/templates/scrum-template' className="d-flex">
                                        <span className='mr-2'>Use this template</span>
                                        <i style={{ fontSize: 22 }} className="fa-solid fa-angle-right"></i>
                                    </NavLink>
                                </div>
                            </div>
                        </div>

                        <div className="card" style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'between',
                            width: '100%',
                            alignItems: 'center',
                            marginTop: 15
                        }}>
                            <div style={{ backgroundColor: '#dddd' }}>
                                <img style={{ width: 200, height: '100%' }} src="https://taskschedulerproject.atlassian.net/s/-oo8t1n/b/9/d0630ad8e2b33a2fc7347459a3397d94eb3a0393/_/download/resources/com.atlassian.jira.project-templates-plugin:project-templates-next-icons/icons/cross-team-planning.svg" alt="top-level image" />
                            </div>
                            <div className='ml-3 w-100 d-flex justify-content-between align-items-center'>
                                <div style={{ width: '70%' }}>
                                    <h5 className="card-title">Top-level planning</h5>
                                    <p className="card-text">Use a plan to view the work of multiple teams.  Instantly access a company-managed project and two new teams with their own scrum boards.</p>
                                </div>
                                <div className='mr-4'>
                                    <NavLink className="d-flex">
                                        <span className='mr-2'>Use this template</span>
                                        <i style={{ fontSize: 22 }} className="fa-solid fa-angle-right"></i>
                                    </NavLink>
                                </div>
                            </div>
                        </div>


                        <div className="card" style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'between',
                            width: '100%',
                            alignItems: 'center',
                            marginTop: 15
                        }}>
                            <div style={{ backgroundColor: '#dddd' }}>
                                <img style={{ width: 200, height: '100%' }} src="https://taskschedulerproject.atlassian.net/s/-oo8t1n/b/9/d0630ad8e2b33a2fc7347459a3397d94eb3a0393/_/download/resources/com.atlassian.jira.project-templates-plugin:project-templates-next-icons/icons/bug.svg" alt="bug-tracking image" />
                            </div>
                            <div className='ml-3 w-100 d-flex justify-content-between align-items-center'>
                                <div style={{ width: '70%' }}>
                                    <h5 className="card-title">Bug tracking</h5>
                                    <p className="card-text">Manage a list of development tasks and bugs.</p>
                                </div>
                                <div className='mr-4'>
                                    <NavLink className="d-flex">
                                        <span className='mr-2'>Use this template</span>
                                        <i style={{ fontSize: 22 }} className="fa-solid fa-angle-right"></i>
                                    </NavLink>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
