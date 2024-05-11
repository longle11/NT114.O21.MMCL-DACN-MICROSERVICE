import React, { useEffect, useRef, useState } from 'react'
import DrawerHOC from '../../HOC/DrawerHOC'
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AutoComplete, Avatar, Button, Popover, Table } from 'antd';
import { getInfoIssue } from '../../redux/actions/IssueAction';
import { showNotificationWithIcon } from '../../util/NotificationUtil';
import { getUserKeyword, insertUserIntoProject } from '../../redux/actions/UserAction';
import { GetProjectAction } from '../../redux/actions/ListProjectAction';
import { deleteUserInProject } from '../../redux/actions/CreateProjectAction';
import { DeleteOutlined } from '@ant-design/icons';
import Search from 'antd/es/input/Search';
export default function Dashboard() {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    //sử dụng hiển thị tất cả issue hoặc chỉ các issue liên quan tới user
    const [type, setType] = useState(0)

    const projectInfo = useSelector(state => state.listProject.projectInfo)
    const [value, setValue] = useState('')
    const listUser = useSelector(state => state.user.list)
    const userInfo = useSelector(state => state.user.userInfo)
    //su dung cho debounce search
    const search = useRef(null)

    useEffect(() => {
        if (typeof localStorage.getItem('projectid') === 'string' && localStorage.getItem('projectid').length >= 8) {
            localStorage.setItem('projectid', projectInfo?._id)
        } else {
            localStorage.setItem('projectid', null)
            showNotificationWithIcon('error', 'Vui lòng tham gia vào dự án trước')
            navigate('/manager')
        }
    }, [])

    //su dung cho truong hien thi member
    const memberColumns = [
        {
            title: 'Avatar',
            dataIndex: 'avatar',
            key: 'avatar',
            render: (text, record, index) => {
                return <Avatar src={text} size={30} alt={index} />
            }
        },
        {
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
            render: (text, record, index) => {
                return <span>{text}</span>
            }
        },
        {
            title: 'Action',
            key: 'action',
            dataIndex: '_id',
            render: (text, record, index) => {
                if (projectInfo?.creator.toString() === userInfo.id) {
                    return text !== userInfo.id ? (
                        <Button type="primary" onClick={async () => {
                            await dispatch(deleteUserInProject(text, projectInfo?._id))

                            dispatch(GetProjectAction(projectInfo?._id, ""))
                        }} icon={<DeleteOutlined />} size='large' />
                    ) : <></>
                }
                return <></>
            }
        }
    ];

    const renderIssueType = (type) => {
        //0 la story
        if (type === 0) {
            return <i className="fa-solid fa-bookmark mr-2" style={{ color: '#65ba43', fontSize: '20px' }} ></i>
        }
        //1 la task
        if (type === 1) {
            return <i className="fa-solid fa-square-check mr-2" style={{ color: '#4fade6', fontSize: '20px' }} ></i>
        }
        //2 la bug
        if (type === 2) {
            return <i className="fa-solid fa-circle-exclamation mr-2" style={{ color: '#cd1317', fontSize: '20px' }} ></i>
        }
    }

    const renderPriority = (priority) => {
        if (priority === 0) {
            return <i className="fa-solid fa-arrow-up" style={{ color: '#cd1317', fontSize: '20px' }} />
        }
        if (priority === 1) {
            return <i className="fa-solid fa-arrow-up" style={{ color: '#e9494a', fontSize: '20px' }} />
        }
        if (priority === 2) {
            return <i className="fa-solid fa-arrow-up" style={{ color: '#e97f33', fontSize: '20px' }} />
        }
        if (priority === 3) {
            return <i className="fa-solid fa-arrow-down" style={{ color: '#2d8738', fontSize: '20px' }} />
        }
        if (priority === 4) {
            return <i className="fa-solid fa-arrow-down" style={{ color: '#57a55a', fontSize: '20px' }} />
        }
    }

    const countEleStatus = (position, type) => {
        if (type === 1) {
            return projectInfo?.issues?.filter(issue => {
                return (issue.assignees.findIndex(value => value._id === userInfo.id) !== -1) || (issue.creator._id === userInfo.id)
            }).filter(value => value.issueStatus === position).length
        }
        return projectInfo?.issues?.filter(value => value.issueStatus === position).length
    }

    //type là loại được chọn để hiển thị (tất cả vấn đề / các vấn đề thuộc user)
    const renderIssue = (position, type) => {
        let listIssues = projectInfo?.issues
        if (type === 1) {
            listIssues = listIssues?.filter(issue => {
                return (issue.assignees.findIndex(value => value._id === userInfo.id) !== -1) || (issue.creator._id === userInfo.id)
            })
        }
        return listIssues?.filter(issue => {
            return issue.issueStatus === position
        })
            .sort((issue1, issue2) => issue1.priority - issue2.priority)
            .map((value, index) => {
                return (<li key={value._id} className="list-group-item" data-toggle="modal" data-target="#infoModal" style={{ cursor: 'pointer' }}>
                    <div onClick={() => {
                        dispatch(getInfoIssue(value._id))
                    }} onKeyDown={() => {}} tabIndex={-42}>
                        {value.shortSummary}
                    </div>
                    <div className="block" style={{ display: 'flex' }}>
                        <div className="block-left">
                            {renderIssueType(value.issueType)}
                            {renderPriority(value.priority)}
                        </div>
                        <div className="block-right" style={{ display: 'flex', alignItems: 'center' }}>
                            <div className="avatar-group">
                                {/* them avatar cua cac assignees */}
                                {
                                    value?.assignees?.map((user, index) => {
                                        if (index === 3) {
                                            return <Avatar key={value._id} size={40}>...</Avatar>
                                        } else if (index <= 2) {
                                            return <Avatar size={30} key={value._id} src={user.avatar} />
                                        }
                                        return null
                                    })
                                }
                            </div>
                        </div>
                    </div>
                </li>)
            })
    }

    return (
        <>
            <DrawerHOC />
            <div className="header">
                <nav aria-label="breadcrumb">
                    <ol className="breadcrumb" style={{ backgroundColor: 'white' }}>
                        <li className="breadcrumb-item">Project</li>
                        <li className="breadcrumb-item active" aria-current="page">
                            Dashboard
                        </li>
                    </ol>
                </nav>
            </div>
            <div className='title'>
                <h3>Dashboard</h3>
                <NavLink to="https://github.com/longle11/NT114.O21.MMCL-DACN-MICROSERVICE" target="_blank" style={{ textDecoration: 'none' }}>
                    <button className="btn btn-light btn-git">
                        <i className="fab fa-github mr-2"></i>
                        <div>Github Repo</div>
                    </button>
                </NavLink>
            </div>
            <div className="info" style={{ display: 'flex' }}>
                <div className="search-block">
                    <Search
                        placeholder="input search text"
                        style={{ width: 300 }}
                        onSearch={value => {
                            dispatch(GetProjectAction(projectInfo?._id, value))
                        }}
                    />
                </div>
                <div className="avatar-group" style={{ display: 'flex' }}>
                    {projectInfo?.members?.map((value, index) => {
                        const table = <Table columns={memberColumns} rowKey={value._id} dataSource={projectInfo?.members} />
                        return <Popover key={value._id} content={() => {
                            return <>{table}</>
                        }} title="Members">
                            <Avatar src={value.avatar} key={value._id} />
                        </Popover>
                    })}

                    <Popover placement="right" title="Add User" content={() => {
                        return <AutoComplete
                            style={{ width: '100%' }}
                            onSearch={(value) => {
                                //kiem tra gia tri co khac null khong, khac thi xoa
                                if (search.current) {
                                    clearTimeout(search.current)
                                }
                                search.current = setTimeout(() => {
                                    dispatch(getUserKeyword(value))
                                }, 500)
                            }}
                            value={value}
                            onChange={(value) => {
                                setValue(value)
                            }}
                            defaultValue=''
                            options={listUser?.reduce((newListUser, user) => {
                                if (user._id !== userInfo.id) {
                                    return [...newListUser, { label: user.username, value: user._id }]
                                }
                                return newListUser
                            }, [])}
                            onSelect={async (value, option) => {
                                setValue(option.label)
                                await dispatch(insertUserIntoProject({
                                    project_id: projectInfo?._id,  //id cua project
                                    user_id: value   //id cua username
                                }))

                                await dispatch(GetProjectAction(projectInfo?._id, ""))
                            }}
                            placeholder="input here"
                        />
                    }} trigger="click">
                        <Avatar style={{ backgroundColor: '#87d068' }}>
                            <i className="fa fa-plus"></i>
                        </Avatar>
                    </Popover>
                </div>
                <Button type="primary" onClick={() => {
                    setType(0)
                }} className=' ml-2 mr-3'>All issues</Button>
                <Button onClick={() => {
                    setType(1)
                }}>Only my issues</Button>
            </div>
            <div className="content" style={{ display: 'flex' }}>
                <div className="card" style={{ width: '20rem', height: '30rem', overflow: 'auto', scrollbarWidth: 'none', fontWeight: 'bold' }}>
                    <div className="card-header">
                        BACKLOG {countEleStatus(0, type)}
                    </div>
                    <ul className="list-group list-group-flush">
                        {renderIssue(0, type)}
                    </ul>
                </div>
                <div className="card" style={{ width: '20rem', height: '30rem', overflow: 'auto', scrollbarWidth: 'none', fontWeight: 'bold' }}>
                    <div className="card-header">
                        SELECTED FOR DEVELOPMENT {countEleStatus(1, type)}
                    </div>
                    <ul className="list-group list-group-flush">
                        {renderIssue(1, type)}
                    </ul>
                </div>
                <div className="card" style={{ width: '20rem', height: '30rem', overflow: 'auto', scrollbarWidth: 'none', fontWeight: 'bold' }}>
                    <div className="card-header">
                        IN PROGRESS {countEleStatus(2, type)}
                    </div>
                    <ul className="list-group list-group-flush">
                        {renderIssue(2, type)}
                    </ul>
                </div>
                <div className="card" style={{ width: '20rem', height: '30rem', overflow: 'auto', scrollbarWidth: 'none', fontWeight: 'bold' }}>
                    <div className="card-header">
                        DONE {countEleStatus(3, type)}
                    </div>
                    <ul className="list-group list-group-flush">
                        {renderIssue(3, type)}
                    </ul>
                </div>
            </div>
        </>
    )
}
