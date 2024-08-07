import Axios from 'axios'
import React from 'react'
import { NavLink } from 'react-router-dom'
import domainName from '../../util/Config'
import { Avatar } from 'antd'
import { useSelector } from 'react-redux'
import Search from 'antd/es/input/Search'

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
    const userInfo = useSelector(state => state.user.userInfo)
    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <NavLink className="navbar-brand" style={{ fontWeight: "bolder" }} to="#">TaskScheduler</NavLink>
            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon" />
            </button>
            <div className="collapse navbar-collapse" id="navbarSupportedContent">
                <ul className="navbar-nav mr-auto">
                    <li className="nav-item dropdown mr-2">
                        <NavLink className="nav-link dropdown-toggle" to="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            Your Work
                        </NavLink>
                        <div className="dropdown-menu" style={{ padding: '15px' }} aria-labelledby="navbarDropdown">
                            <p style={{ fontSize: '12px', fontWeight: 'bold' }}>WORKED ON</p>
                            {localStorage.getItem('projectid').toString().length >= 10 ? (
                                renderCurrentProject()
                            ) : <p>No project recently</p>}
                            <div className="dropdown-divider" />
                            <a className="dropdown-item" style={{ cursor: "pointer", padding: '0 15px 0 0', fontSize: '13px' }} href="#">View all projects</a>
                            <a className="dropdown-item" style={{ cursor: "pointer", padding: '0 15px 0 0', fontSize: '13px' }} href="#">Create your project</a>
                        </div>
                    </li>
                    <li className="nav-item dropdown mr-2">
                        <NavLink className="nav-link dropdown-toggle" to="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            Projects
                        </NavLink>
                        <div className="dropdown-menu" aria-labelledby="navbarDropdown">
                            <a className="dropdown-item" href="#">Action</a>
                            <a className="dropdown-item" href="#">Another action</a>
                            <div className="dropdown-divider" />
                            <a className="dropdown-item" href="#">Something else here</a>
                        </div>
                    </li>
                    <li className='nav-item mr-5'>
                        <button className="btn btn-primary">Create</button>
                    </li>
                </ul>
                <div className='d-flex align-items-center'>
                    <Search
                        placeholder="input search text"
                        allowClear
                        enterButton="Search"
                        size="large"
                        className='mr-5'
                    />
                    <i className="fa fa-bell mr-2" style={{ fontSize: "20px" }} aria-hidden="true"></i>
                    <i className="fa fa-cog" style={{ fontSize: "20px" }} aria-hidden="true"></i>
                </div>
                <li className="nav-item dropdown mr-2">
                    <Avatar className='ml-4' src={userInfo?.avatar} alt="avatar" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"/>
                    <div className="dropdown-menu" style={{ right: '0', left: 'auto' }} aria-labelledby="navbarDropdown">
                        <div>
                            <p style={{fontSize: '14px', marginBottom: '10px', fontWeight: '600', color: "#5E6C84", marginLeft: '15px'}}>ACCOUNT</p>
                            <div className='d-flex align-items-center' style={{margin: '0 15px'}}>
                                <Avatar className='m-0 mr-2' src={userInfo?.avatar} size={40} alt="avatar" />
                                <div className='d-flex flex-column'>
                                    <span style={{fontSize: '14px', fontWeight: '600'}}>{userInfo?.username}</span>
                                    <span style={{fontSize: '12px'}} >{userInfo?.email}</span>
                                </div>
                            </div>
                            <div className="dropdown-item" style={{ marginTop: '10px', padding: '10px 15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <NavLink style={{ cursor: "pointer", fontSize: '13px', color: 'black', textDecoration: 'none'}} to={`/profile/${userInfo?.id}`} >Manage your account</NavLink>
                                <i className="fa fa-info-circle" aria-hidden="true"></i>
                            </div>
                        </div>
                    </div>
                </li>
            </div>
        </nav>

    )
}
