import { Avatar, Button, Input, Modal, Popover, Select, Table } from 'antd'
import Search from 'antd/es/input/Search'
import React, { useEffect, useState } from 'react'
import { GetProjectAction } from '../../redux/actions/ListProjectAction'
import { useDispatch } from 'react-redux'
import { DeleteOutlined } from '@ant-design/icons';
import { userPermissions } from '../../util/CommonFeatures'
import { addUserToProject, deleteUserInProject } from '../../redux/actions/CreateProjectAction'
import { showNotificationWithIcon } from '../../util/NotificationUtil'
import { getIssuesBacklog } from '../../redux/actions/IssueAction'

export default function MemberProject(props) {
    const projectInfo = props.projectInfo
    const userInfo = props.userInfo
    const id = props.id
    const allIssues = props.allIssues
    const dispatch = useDispatch()
    const renderTableMembers = (table) => {
        return <>{table}</>
    }
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [userEmail, setUserEmail] = useState('')
    const [userRole, setuserRole] = useState(0)

    const handleAddUserToProjectOk = () => {
        setIsModalOpen(false);
        dispatch(addUserToProject(userEmail, userRole, id))
        setUserEmail('')
        setuserRole(0)
    };
    const [searchMyIssue, setSearchMyIssue] = useState(null)

    const handleAddUserToProjectCancel = () => {
        setIsModalOpen(false);
    };
    const memberColumns = [
        {
            title: 'Avatar',
            dataIndex: 'avatar',
            key: 'avatar',
            render: (text, record, index) => {
                return <Avatar src={record.user_info.avatar} size={30} alt={index} />
            }
        },
        {
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
            render: (text, record, index) => {
                return <span>{record.user_info.username}</span>
            }
        },
        {
            title: 'Action',
            key: 'action',
            dataIndex: '_id',
            render: (text, record, index) => {
                if (projectInfo?.creator._id.toString().toString() === userInfo.id) {
                    return text !== userInfo.id ? (
                        <Button type="primary" onClick={() => {
                            dispatch(deleteUserInProject(text, projectInfo?._id))

                            dispatch(GetProjectAction(projectInfo?._id, ""))
                        }} icon={<DeleteOutlined />} size='large' />
                    ) : <></>
                }
                return <></>
            }
        }
    ];

    const renderAvatarMembers = (value, table) => {
        return <Popover key={value.user_info._id} content={renderTableMembers(table)} title="Members">
            <Avatar src={value.user_info.avatar} key={value.user_info._id} />
        </Popover>
    }
    return (
        <div>
            <div className="info" style={{ display: 'flex' }}>
                <div className="search-block">
                    <Search
                        placeholder="Search"
                        style={{ width: 200 }}
                        onSearch={value => {
                            dispatch(GetProjectAction(projectInfo?._id, value))
                        }}
                    />
                </div>
                <div className="avatar-group" style={{ display: 'flex' }}>
                    <Avatar.Group>
                        {projectInfo?.members?.map((value, index) => {
                            const table = <Table columns={memberColumns} rowKey={value._id} dataSource={projectInfo?.members} />
                            return renderAvatarMembers(value, table)
                        })}
                    </Avatar.Group>
                    <Avatar style={{ backgroundColor: '#87d068' }} onClick={() => {
                        setIsModalOpen(true)
                    }}>
                        <i className="fa fa-plus"></i>
                    </Avatar>
                </div>
                <div className="options-group" style={{ display: 'flex' }}>
                    <Button type={`${searchMyIssue === null ? "primary" : "default"}`} onClick={() => {
                        if (searchMyIssue !== null) {
                            setSearchMyIssue(null)
                        }
                    }} className=' ml-2 mr-2 d-flex justify-content-center'>All issues {searchMyIssue === null ? <span>({allIssues?.length})</span> : <></>}</Button>
                    <Button type={`${searchMyIssue !== null ? "primary" : "default"}`} onClick={() => {
                        if (searchMyIssue === null) {
                            setSearchMyIssue(userInfo.id)
                        } else {
                            setSearchMyIssue(null)
                        }
                    }}>
                        Only my issues {searchMyIssue !== null ? <span>({allIssues?.filter(issue => (issue.creator._id === userInfo.id || issue.assignees.map(currentIssue => currentIssue._id).includes(userInfo.id))).length})</span> : <></>}
                    </Button>
                </div>
            </div>
            <Modal destroyOnClose="true" title={`Add new user to project ${projectInfo?.name_project}`} open={isModalOpen} onOk={handleAddUserToProjectOk} onCancel={handleAddUserToProjectCancel}>
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
