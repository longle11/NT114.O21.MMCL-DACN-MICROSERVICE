import { Button, Tag, Avatar, Drawer, Space } from 'antd'
import Search from 'antd/es/input/Search'
import React from 'react'
import { UserOutlined } from '@ant-design/icons';
import './Backlog.css'
import { useDispatch, useSelector } from 'react-redux';
import { drawer_edit_form_action } from '../../../redux/actions/DrawerAction';
import CreateIssue from '../../Forms/CreateIssue/CreateIssue';
export default function Backlog() {
    const dispatch = useDispatch()
    const visible = useSelector(state => state.isOpenDrawer.visible)
    return (
        <div>
            <span>Projects / Website Developments / WD Board</span>
            <div className='d-flex justify-content-between'>
                <h4>Backlog</h4>
                <div>
                    <button className='btn btn-primary'>Share</button>
                    <button className='btn btn-danger'>Setting</button>
                </div>
            </div>
            <div className="search-info-backlogs d-flex">
                <div className="search-block">
                    <Search
                        placeholder="input search text"
                        style={{ width: 300 }}
                        onSearch={value => {

                        }}
                    />
                </div>
                <div className="avatar-group d-flex">
                    {/* {projectInfo?.members?.map((value, index) => {
                        const table = <Table columns={memberColumns} rowKey={value._id} dataSource={projectInfo?.members} />
                        return renderAvatarMembers(value, table)
                    })} */}
                </div>
                <Button type="primary" onClick={() => {
                    // setType(0)
                }} className=' ml-2 mr-3'>All issues</Button>
                <Button onClick={() => {
                    // setType(1)
                }}>Only my issues</Button>
            </div>
            <div style={{ margin: '0 40px' }}>
                <div className='d-flex'>
                    <div>
                        <button className='btn btn-primary' id="dropdownVersionButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">VERSIONS</button>
                        <div className="dropdown-menu" aria-labelledby="dropdownVersionButton">
                            <div className='d-flex justify-content-between align-items-center'>
                                <h6 className='m-0'>Versions</h6>
                                <span><i className="fa-regular fa-plus mr-1"></i>Create version</span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <button className='btn btn-primary' id="dropdownEpicButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">EPICS</button>
                        <div className="dropdown-menu" aria-labelledby="dropdownEpicButton">
                            <div className='d-flex justify-content-between align-items-center'>
                                <h6 className='m-0'>Epics</h6>
                                <span onClick={(e) => {
                                    e.preventDefault()
                                    dispatch(drawer_edit_form_action(<CreateIssue />, "Create", 720, '30px'))
                                }}><i className="fa-regular fa-plus mr-1" ></i>Create epic</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='main-info-backlog' style={{ minHeight: '200px' }}>
                    <div>
                        <h6>Backlog <span>7 issues</span></h6>
                        <ul style={{ listStyle: 'none', padding: 0, border: '1px solid #ddd' }}>
                            <li style={{ borderBottom: '1px solid #ddd', padding: '5px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div className='content-issue-backlog'>
                                    <i className="fa-solid fa-bookmark mr-2" style={{ color: '#65ba43', fontSize: '20px' }} ></i>
                                    <span>Development payment gateway for paypak</span>
                                </div>
                                <div className='attach-issue-backlog d-flex align-items-center  '>
                                    {/* specify which components does issue belong to? */}
                                    <Tag color="gold">MVP1</Tag>
                                    {/* specify which epics does issue belong to? */}
                                    <Tag className='ml-2' color="magenta">Payment gateway</Tag>
                                    {/* Assigness */}
                                    <div className='ml-2'>
                                        <Avatar icon={<UserOutlined />} />
                                    </div>
                                    {/* issue id */}
                                    <span className='ml-2'>WD-2735</span>
                                    {/* priority backlog */}
                                    <i className="fa-solid fa-arrow-up ml-2" style={{ color: '#e97f33', fontSize: '20px' }} />
                                </div>
                            </li>
                            <li style={{ borderBottom: 'none', padding: '5px 0', paddingLeft: '10px' }}>abcdef</li>
                        </ul>
                        <button className='btn btn-transparent btn-create-issue' style={{ fontSize: '14px', color: '#ddd' }}>
                            <i className="fa-regular fa-plus mr-2"></i>
                            Create issue
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
