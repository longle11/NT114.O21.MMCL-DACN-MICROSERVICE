import Axios from 'axios'
import React from 'react'
import { NavLink } from 'react-router-dom'
import domainName from '../../util/Config'

export default function MenuBarHeader() {
    const renderCurrentProject = async () => {
        const currentProject = await Axios.get(`${domainName}/api/projectmanagement/${localStorage.getItem('projectid')}`)
        return (
            <div className="card">
                <div className="card-body d-flex flex-column">
                    <h5 className='card-title'>{currentProject.data.data.nameProject}</h5>
                    <h6 className='card-subtitle'>{currentProject.data.data.category}</h6>
                </div>
            </div>
        )
    }
    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <NavLink className="navbar-brand" to="#">Jira</NavLink>
            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon" />
            </button>
            <div className="collapse navbar-collapse" id="navbarSupportedContent">
                <ul className="navbar-nav mr-auto">
                    <li className="nav-item dropdown">
                        <NavLink className="nav-link dropdown-toggle" to="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            Projects
                        </NavLink>
                        <div className="dropdown-menu" style={{ padding: '15px' }} aria-labelledby="navbarDropdown">
                            <p style={{ fontSize: '12px', fontWeight: 'bold' }}>WORKED ON</p>
                            {localStorage.getItem('projectid').toString().length >= 10 ? (
                                renderCurrentProject()
                            ) : <p>No project recently</p>}
                            <div className="dropdown-divider" />
                            <a className="dropdown-item" style={{ cursor: "pointer", padding: '0 15px 0 0', fontSize: '13px' }} to="#">View all projects</a>
                            <a className="dropdown-item" style={{ cursor: "pointer", padding: '0 15px 0 0', fontSize: '13px' }} to="#">Create your project</a>
                        </div>
                    </li>
                    <li className="nav-item dropdown">
                        <NavLink className="nav-link dropdown-toggle" to="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            Dropdown
                        </NavLink>
                        <div className="dropdown-menu" aria-labelledby="navbarDropdown">
                            <NavLink className="dropdown-item" to="#">Action</NavLink>
                            <NavLink className="dropdown-item" to="#">Another action</NavLink>
                            <div className="dropdown-divider" />
                            <NavLink className="dropdown-item" to="#">Something else here</NavLink>
                        </div>
                    </li>
                    <li className="nav-item">
                        <NavLink className="nav-link disabled" to="#" tabIndex={-1} aria-disabled="true">Disabled</NavLink>
                    </li>
                </ul>
                <form className="form-inline my-2 my-lg-0">
                    <input className="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search" />
                    <button className="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>
                </form>
            </div>
        </nav>

    )
}
