import { Avatar, Button, Checkbox, Col, Input, Modal, Popover, Row, Select, Switch, Table } from 'antd'
import Search from 'antd/es/input/Search'
import React, { useState } from 'react'
import { GetProjectAction } from '../../redux/actions/ListProjectAction'
import { useDispatch } from 'react-redux'
import { DeleteOutlined } from '@ant-design/icons';
import { issueTypeOptions, userPermissions } from '../../util/CommonFeatures'
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
    const processList = props.processList

    const epicList = props.epicList
    const versionList = props.versionList
    const dispatch = useDispatch()
    const renderTableMembers = (table) => {
        return <>{table}</>
    }
    const [countEpic, setCountEpic] = useState(0)
    const [countStatus, setCountStatus] = useState(0)
    const [countType, setCountType] = useState(0)
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
                    <Button type={`${props.searchMyIssue === null ? "primary" : "default"}`} onClick={() => {
                        if (props.searchMyIssue !== null) {
                            props.setSearchMyIssue(null)
                        }
                    }} className=' ml-2 mr-2 d-flex justify-content-center'>All issues {props.searchMyIssue === null ? (allIssues?.length > 0 ? <span>({allIssues?.length})</span> : <></>) : <></>}</Button>
                    <Button type={`${props.searchMyIssue !== null ? "primary" : "default"}`} onClick={() => {
                        if (props.searchMyIssue === null) {
                            props.setSearchMyIssue(userInfo.id)
                        } else {
                            props.setSearchMyIssue(null)
                        }
                    }}>
                        Only my issues {props.searchMyIssue !== null ? (allIssues?.length > 0 ? <span>({allIssues?.filter(issue => ((issue.creator?._id === userInfo.id || issue?.assignees?.map(currentIssue => currentIssue._id).includes(userInfo.id))))?.length})</span> : <></>) : <></>}
                    </Button>
                </div>
                {
                    !typeInterface?.includes("dashboard") ? <div className='ml-1 mr-1'>
                        <Button className="mr-2 ml-2" id="dropdownVersionButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            Versions {countVersion !== 0 ? <span className='ml-1 mr-2' style={{ color: 'blue' }}>({countVersion})</span> : <></>} <i className="fa fa-angle-down ml-2"></i>
                        </Button>
                        <div className="dropdown-menu" aria-labelledby="dropdownVersionButton" style={{ width: 'min-content' }}>
                            {versionList !== null && versionList?.length > 0 ? <Checkbox.Group defaultValue={props.searchIssue.versions} value={props.searchIssue.versions} style={{ width: '100%' }} onChange={(value) => {
                                props.handleSearchIssue([...value], props.searchIssue.epics, props.searchIssue.types, props.searchIssue.statuses)
                                setCountVersion(value.length)
                            }}>
                                <Row style={{ width: '100%' }}>
                                    <Col span={16} style={{ padding: '5px 10px' }}>
                                        <Checkbox style={{ width: 'max-content' }} value={null}>Issue without versions</Checkbox>
                                    </Col>
                                    {versionList?.map(version => {
                                        return <Col span={16} style={{ padding: '5px 10px' }}>
                                            <Checkbox value={version._id}>{version.version_name}</Checkbox>
                                        </Col>
                                    })}
                                </Row>
                            </Checkbox.Group> : <p style={{ padding: '5px 20px' }}>Unreleased versions in this project</p>}
                            {
                                typeInterface === 'backlog' ? <div>
                                    <hr />
                                    <div className='d-flex align-items-center' style={{ padding: '5px 20px' }}>
                                        <Switch onChange={() => {
                                            props.setOnChangeVersion(!props.onChangeVersion)
                                        }} value={props.onChangeVersion} />
                                        <span className='ml-3' style={{ width: 'max-content' }}>Show version panel</span>
                                    </div>
                                </div> : <></>
                            }
                        </div>
                    </div> : <></>
                }
                {
                    !typeInterface.includes('kanban') ? <div className='ml-1'>
                        <Button id="dropdownEpicButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            Epics {countEpic !== 0 ? <span className='ml-1 mr-2' style={{ color: 'blue' }}>({countEpic})</span> : <></>} <i className="fa fa-angle-down ml-2"></i>
                        </Button>
                        <div className="dropdown-menu" aria-labelledby="dropdownEpicButton" style={{ width: 'min-content', padding: '5px 10px' }}>
                            {
                                epicList !== null && epicList?.length > 0 ? <Checkbox.Group defaultValue={props.searchIssue.epics} value={props.searchIssue.epics} style={{ width: '100%' }} onChange={(value) => {
                                    if (props.setSearchDashboard) {
                                        props.setSearchDashboard(true)
                                    }
                                    props.handleSearchIssue(props.searchIssue.versions, [...value], props.searchIssue.types, props.searchIssue.statuses)
                                    setCountEpic(value.length)
                                }}>
                                    <Row>
                                        <Col span={16} style={{ padding: '5px 10px' }}>
                                            <Checkbox value={null}>Issue without epics</Checkbox>
                                        </Col>
                                        {epicList?.map(epic => {
                                            return <Col span={16} style={{ padding: '5px 10px' }}>
                                                <Checkbox style={{ width: 'max-content' }} value={epic._id}>{epic.epic_name}</Checkbox>
                                            </Col>
                                        })}
                                    </Row>
                                </Checkbox.Group> : <span className='d-flex justify-content-center'>No epics recently</span>
                            }
                            {
                                typeInterface === 'backlog' ? <div>
                                    <hr />
                                    <div className='d-flex align-items-center' style={{ padding: '0 10px' }}>
                                        <Switch onChange={() => {
                                            props.setOnChangeEpic(!props.onChangeEpic)
                                        }} value={props.onChangeEpic} />
                                        <span className='ml-3' style={{ width: 'max-content' }}>Show epic panel</span>
                                    </div>
                                </div> : <></>
                            }
                        </div>
                    </div> : <></>
                }

                <div className='ml-1'>
                    <Button id="dropdownTypeButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        Issue Status {countStatus !== 0 ? <span className='ml-1 mr-2' style={{ color: 'blue' }}>({countStatus})</span> : <></>} <i className="fa fa-angle-down ml-2"></i>
                    </Button>
                    <div className="dropdown-menu" aria-labelledby="dropdownTypeButton" style={{ width: 'min-content' }}>
                        {
                            <Checkbox.Group defaultValue={props.searchIssue.statuses} value={props.searchIssue.statuses} style={{ width: '100%' }} onChange={(value) => {
                                if (props.setSearchDashboard) {
                                    props.setSearchDashboard(true)
                                }
                                props.handleSearchIssue(props.searchIssue.versions, props.searchIssue.epics, props.searchIssue.types, [...value])
                                setCountStatus(value.length)
                            }}>
                                <Row>
                                    {issueTypeOptions(projectInfo?.issue_types_default)?.filter(status => status.value !== 3)?.map(status => {
                                        return <Col span={16} style={{ padding: '5px 10px' }}>
                                            <Checkbox style={{ width: 'max-content' }} value={status.value}>{status.label}</Checkbox>
                                        </Col>
                                    })}
                                </Row>
                            </Checkbox.Group>
                        }
                    </div>
                </div>


                <div className='ml-1'>
                    <Button id="dropdownTypeButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        Issue Type {countType !== 0 ? <span className='ml-1 mr-2' style={{ color: 'blue' }}>({countType})</span> : <></>} <i className="fa fa-angle-down ml-2"></i>
                    </Button>
                    <div className="dropdown-menu" aria-labelledby="dropdownTypeButton" style={{ width: 'min-content' }}>
                        {
                            <Checkbox.Group defaultValue={props.searchIssue.types} value={props.searchIssue.types} style={{ width: '100%' }} onChange={(value) => {
                                if (!props.searchDashboard) {
                                    if (props.setSearchDashboard) {
                                        props.setSearchDashboard(true)
                                    }
                                }
                                props.handleSearchIssue(props.searchIssue.versions, props.searchIssue.epics, [...value], props.searchIssue.statuses)
                                setCountType(value.length)
                            }}>
                                <Row>
                                    {processList?.map(type => {
                                        return <Col span={16} style={{ padding: '5px 10px' }}>
                                            <Checkbox style={{ width: 'max-content' }} value={type._id}>{type.name_process}</Checkbox>
                                        </Col>
                                    })}
                                </Row>
                            </Checkbox.Group>
                        }
                    </div>
                </div>

                <Button className='ml-2' onClick={() => {
                    props.handleSearchIssue([], [], [], [])
                    if (props.setSearchDashboard) {
                        props.setSearchDashboard(false)
                    }
                    setCountEpic(0)
                    setCountStatus(0)
                    setCountVersion(0)
                    setCountType(0)
                }}>Clear search</Button>
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
