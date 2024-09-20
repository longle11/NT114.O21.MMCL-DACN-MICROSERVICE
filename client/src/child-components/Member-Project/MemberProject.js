import { Avatar, Button, Checkbox, Col, Input, Modal, Popover, Row, Select, Table } from 'antd'
import Search from 'antd/es/input/Search'
import React, { useState } from 'react'
import { GetProjectAction } from '../../redux/actions/ListProjectAction'
import { useDispatch } from 'react-redux'
import { DeleteOutlined } from '@ant-design/icons';
import { userPermissions } from '../../util/CommonFeatures'
import { deleteUserInProject, updateProjectAction } from '../../redux/actions/CreateProjectAction'
import { showNotificationWithIcon } from '../../util/NotificationUtil'
import { UserAddOutlined } from '@ant-design/icons';
import './MemberProject.css'
export default function MemberProject(props) {
    const projectInfo = props.projectInfo
    const userInfo = props.userInfo
    const id = props.id
    const allIssues = props.allIssues
    const typeInterface = props.typeInterface
    
    const epicList = props.epicList
    const versionList = props.versionList
    const dispatch = useDispatch()
    const renderTableMembers = (table) => {
        return <>{table}</>
    }
    const [countEpic, setCountEpic] = useState(0)
    const [countVersion, setCountVersion] = useState(0)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [userEmail, setUserEmail] = useState('')
    const [userRole, setuserRole] = useState(0)


    const handleAddUserToProjectOk = () => {
        setIsModalOpen(false);
        dispatch(updateProjectAction(id, { email: userEmail, user_role: userRole }, null, userInfo.id))
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
            width: 'max-content',
            render: (text, record, index) => {
                return <Avatar src={record.user_info.avatar} size={30} alt={index} />
            }
        },
        {
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
            width: 'max-content',
            render: (text, record, index) => {
                return <span>{record.user_info.username}</span>
            }
        },
        {
            title: 'User role',
            dataIndex: 'user_role',
            key: 'user_role',
            width: 'max-content',
            render: (text, record, index) => {
                var role_of_user = ""
                if (record?.user_role === 0) {
                    role_of_user = "Administrator"
                } else if (record?.user_role === 1) {
                    role_of_user = "Member"
                }
                else if (record?.user_role === 1) {
                    role_of_user = "Viewer"
                }
                return <span>{role_of_user}</span>
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
                        style={{ width: 200, borderRadius: 0 }}
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
                    <Avatar icon={<UserAddOutlined />} style={{ backgroundColor: '#87d068' }} onClick={() => {
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
                    }} className=' ml-2 mr-2 d-flex justify-content-center'>All issues {searchMyIssue === null ? <span>({allIssues?.filter(issue => issue.issue_status !== 4)?.length})</span> : <></>}</Button>
                    <Button type={`${searchMyIssue !== null ? "primary" : "default"}`} onClick={() => {
                        if (searchMyIssue === null) {
                            setSearchMyIssue(userInfo.id)
                        } else {
                            setSearchMyIssue(null)
                        }
                    }}>
                        Only my issues {searchMyIssue !== null ? <span>({allIssues?.filter(issue => ((issue.creator._id === userInfo.id || issue.assignees.map(currentIssue => currentIssue._id).includes(userInfo.id))) && issue.issue_status !== 4).length})</span> : <></>}
                    </Button>
                </div>

                {
                    typeInterface !== "dashboard" ? <div className='ml-1 mr-1'>
                    <Button className="mr-2 ml-2" id="dropdownVersionButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        Versions {countVersion !== 0 ? <span className='ml-1 mr-2' style={{ color: 'blue' }}>({countVersion})</span> : <></>} <i className="fa fa-angle-down ml-2"></i>
                    </Button>
                    <div className="dropdown-menu" aria-labelledby="dropdownVersionButton">
                        {versionList !== null && versionList?.length > 0 ? <Checkbox.Group defaultValue={props.searchIssue.versions} value={props.searchIssue.versions} style={{ width: '100%' }} onChange={(value) => {
                            props.handleSearchIssue([...value], props.searchIssue.epics)
                            setCountVersion(value.length)
                        }}>
                            <Row>
                                <Col span={16} style={{ padding: '5px 10px' }}>
                                    <Checkbox value={null}>Issue without epics</Checkbox>
                                </Col>
                                {versionList?.map(version => {
                                    return <Col span={16} style={{ padding: '5px 10px' }}>
                                        <Checkbox value={version._id}>{version.version_name}</Checkbox>
                                    </Col>
                                })}
                            </Row>
                        </Checkbox.Group> : <p style={{ padding: '5px 20px' }}>Unreleased versions in this project</p>}
                    </div>
                </div> : <></>
                }
                <div className='ml-1'>
                    <Button id="dropdownEpicButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        Epics {countEpic !== 0 ? <span className='ml-1 mr-2' style={{ color: 'blue' }}>({countEpic})</span> : <></>} <i className="fa fa-angle-down ml-2"></i>
                    </Button>
                    <div className="dropdown-menu" aria-labelledby="dropdownEpicButton" style={{ width: 'fit-content' }}>
                        {
                            epicList !== null && epicList?.length > 0 ? <Checkbox.Group defaultValue={props.searchIssue.epics} value={props.searchIssue.epics} style={{ width: '100%' }} onChange={(value) => {
                                console.log("props.searchIssue.versions, [...value] ", props.searchIssue.versions, [...value]);
                                
                                props.handleSearchIssue(props.searchIssue.versions, [...value])
                                setCountEpic(value.length)
                            }}>
                                <Row>
                                    <Col span={16} style={{ padding: '5px 10px' }}>
                                        <Checkbox value={null}>Issue without versions</Checkbox>
                                    </Col>
                                    {epicList?.map(epic => {
                                        return <Col span={16} style={{ padding: '5px 10px' }}>
                                            <Checkbox style={{ width: 'max-content' }} value={epic._id}>{epic.epic_name}</Checkbox>
                                        </Col>
                                    })}
                                </Row>
                            </Checkbox.Group> : <span className='d-flex justify-content-center'>No epics recently</span>
                        }
                    </div>
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
