import { Avatar, Button, Input, Modal, Select, Table } from 'antd'
import Search from 'antd/es/input/Search'
import React, { useEffect, useState } from 'react'
import { userPermissions } from '../../../util/CommonFeatures'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { GetProjectAction } from '../../../redux/actions/ListProjectAction'
import { showNotificationWithIcon } from '../../../util/NotificationUtil'
import { addUserToProject, updateProjectAction } from '../../../redux/actions/CreateProjectAction'

export default function AddUser() {
    const projectInfo = useSelector(state => state.listProject.projectInfo)
    const userInfo = useSelector(state => state.user.userInfo)
    const { id } = useParams()
    const [userEmail, setUserEmail] = useState('')
    const [userRole, setuserRole] = useState(0)
    const dispatch = useDispatch()
    useEffect(() => {
        dispatch(GetProjectAction(id))
    }, [])
    const [isModalOpen, setIsModalOpen] = useState(false);
    const handleOk = () => {
        setIsModalOpen(false);
        dispatch(addUserToProject(userEmail, userRole, id))
        setUserEmail('')
        setuserRole(0)
    };
    const handleCancel = () => {
        setIsModalOpen(false);
    };
    const columns = [
        {
            title: 'Name',
            dataIndex: 'username',
            key: 'username',
            render: (text, record) => {
                return <span><Avatar src={record.user_info.avatar} className='mr-2' /><span>{record.user_info.username}</span></span>
            }
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            render: (text, record) => {
                return <span>{record.user_info.email}</span>
            }
        },
        {
            title: 'Role',
            dataIndex: 'user_role',
            render: (text, record) => {
                const findIndexUserRole = projectInfo.members.findIndex(user => user.user_info._id.toString() === userInfo.id)
                if(record.user_info?._id?.toString() === projectInfo?.creator?._id?.toString()) {
                    return <Input style={{width: 'fit-content'}} defaultValue={userPermissions[record.user_role].label} disabled/>
                }else {
                    return <Select
                    mode="multiple"
                    defaultValue={userPermissions[record.user_role].label}
                    style={{
                        flex: 1,
                    }}
                    disabled={projectInfo.members[findIndexUserRole]?.user_role !== 0}
                    options={userPermissions}
                />
                }
            }
        },
        {
            title: 'Action',
            dataIndex: 'action',
            render: (text, record) => {
                const findIndexUserRole = projectInfo.members.findIndex(user => user.user_info._id.toString() === userInfo.id)
                if(record.user_info?._id?.toString() === projectInfo?.creator?._id?.toString()) {
                    return <></>
                }else {
                    return <Button type='primary' disabled={projectInfo.members[findIndexUserRole]?.user_role !== 0} onClick={() => {
                        dispatch(updateProjectAction(id, {user_info: record.user_info._id.toString()}, null))
                    }}>Delete</Button>
                }
            }
        },
    ]
    return (
        <div style={{ padding: '0 20px' }}>
            <p>Projects / My Kanban Project / Project settings</p>
            <div className='d-flex justify-content-between'>
                <h4>Access</h4>
                <Button type="primary" onClick={() => {
                    setIsModalOpen(true)
                }}>Add User</Button>
            </div>
            <div>
                <Search placeholder='Search users' style={{ width: '20%' }} />
                <Select
                    mode="multiple"
                    defaultValue={userPermissions[0].label}
                    style={{
                        flex: 1,
                    }}
                    options={userPermissions}
                />
            </div>
            <Table columns={columns} dataSource={projectInfo?.members} />
            <Modal destroyOnClose="true" title={`Add new user to project ${projectInfo?.name_project}`} open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
                <div>
                    <label htmlFor='email'>Email</label>
                    <Input name='email' placeholder="e.g., longle@company.com" onChange={(e) => {
                        if (e.target.value.trim() === "") {
                            showNotificationWithIcon('error', '', 'Email can not be left blank')
                        } else {
                            setUserEmail(e.target.value)
                        }
                    }} />
                </div>
                <div className='d-flex flex-column mt-2'>
                    <label htmlFor='role'>Role</label>
                    <Select
                        name="role"
                        defaultValue={userPermissions[userRole].label}
                        style={{
                            width: 'max-content',
                        }}
                        onChange={(value) => {
                            setuserRole(value)
                        }}
                        options={userPermissions}
                    />
                </div>
            </Modal>
        </div>
    )
}
