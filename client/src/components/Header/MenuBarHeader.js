import Axios from 'axios'
import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import domainName from '../../util/Config'
import { Avatar, Input, Modal } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import Search from 'antd/es/input/Search'
import { SHOW_MODAL_INPUT_TOKEN } from '../../redux/constants/constant'

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
    const showModalInputToken = useSelector(state => state.user.showModalInputToken)
    const [currentPassowrd, setCurrentPassowrd] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const dispatch = useDispatch()
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
                        <div className="dropdown-menu" aria-labelledby="navbarDropdown" style={{minWidth: '150px', width: '200px'}}>
                            <div style={{padding: '5px 15px'}}>
                            <p style={{ fontSize: '12px', fontWeight: 'bold' }}>WORKED ON</p>
                            {localStorage.getItem('projectid').toString().length >= 10 ? (
                                renderCurrentProject()
                            ) : <p style={{ fontSize: '15px' }}>No project recently</p>}
                            </div>
                            <div className="dropdown-divider" />
                            <a className="dropdown-item" style={{ cursor: "pointer", padding: '5px 10px', fontSize: '13px' }} href="#">View all projects</a>
                            <a className="dropdown-item" style={{ cursor: "pointer", padding: '5px 10px', fontSize: '13px' }} href="#">Create your project</a>
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
                    <Avatar className='ml-4' src={userInfo?.avatar} alt="avatar" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" />
                    <div className="dropdown-menu" style={{ right: '0', left: 'auto' }} aria-labelledby="navbarDropdown">
                        <div>
                            <p style={{ fontSize: '14px', marginBottom: '10px', fontWeight: '600', color: "#5E6C84", marginLeft: '15px' }}>ACCOUNT</p>
                            <div className='d-flex align-items-center' style={{ margin: '0 15px' }}>
                                <Avatar className='m-0 mr-2' src={userInfo?.avatar} size={40} alt="avatar" />
                                <div className='d-flex flex-column'>
                                    <span style={{ fontSize: '14px', fontWeight: '600' }}>{userInfo?.username}</span>
                                    <span style={{ fontSize: '12px' }} >{userInfo?.email}</span>
                                </div>
                            </div>
                            <div className="dropdown-item" style={{ marginTop: '10px', padding: '10px 15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <NavLink style={{ cursor: "pointer", fontSize: '13px', color: 'black', textDecoration: 'none' }} to={`/profile/${userInfo?.id}`} >Manage your account</NavLink>
                                <i className="fa fa-info-circle" aria-hidden="true"></i>
                            </div>
                            <div className="dropdown-item" style={{ marginTop: '10px', padding: '10px 15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} onClick={() => {
                                dispatch({
                                    type: SHOW_MODAL_INPUT_TOKEN,
                                    status: true
                                })
                            }}>
                                <NavLink style={{ cursor: "pointer", fontSize: '13px', color: 'black', textDecoration: 'none' }} to="#">Change your password</NavLink>
                                <i className="fa fa-key" aria-hidden="true"></i>
                            </div>
                            <div className="dropdown-item" style={{ marginTop: '10px', padding: '10px 15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <NavLink style={{ cursor: "pointer", fontSize: '13px', color: 'black', textDecoration: 'none' }} to={`/profile/${userInfo?.id}`} >Logout</NavLink>
                                <i className="fa fa-info-circle" aria-hidden="true"></i>
                            </div>
                        </div>
                    </div>
                </li>
            </div>
            <Modal title="Change your password" open={showModalInputToken} onOk={() => {

            }} onCancel={() => {
                dispatch({
                    type: SHOW_MODAL_INPUT_TOKEN,
                    status: false
                })
            }}>
                <div className="form-group mt-4">
                    <label htmlFor="currentPassowrd">Current password <span className='text-danger'>*</span></label>
                    <Input.Password value={currentPassowrd} onChange={(e) => {
                        setCurrentPassowrd(e.target.value)
                    }} id="currentPassowrd" placeholder="Enter current password"/>
                    <label htmlFor="newPassowrd" className='mt-2'>New password <span className='text-danger'>*</span></label>
                    <Input.Password value={newPassword} onChange={(e) => {
                        setNewPassword(e.target.value)
                    }} id="newPassowrd" placeholder="Enter new password" />
                    {
                        currentPassowrd.trim() === '' && newPassword.trim() === '' ? 
                            <button className="btn btn-dark mt-3" disabled>Save changes</button> :
                            <button className='btn btn-primary mt-3' onClick={() => {
                                dispatch({
                                    type: SHOW_MODAL_INPUT_TOKEN,
                                    status: false
                                })
                            }}>Save changes</button>
                    }
                </div>
            </Modal>
        </nav>

    )
}
