import React, { useEffect, useRef, useState } from 'react'
import DrawerHOC from '../../HOC/DrawerHOC'
import { NavLink, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AutoComplete, Avatar, Button, Modal, Popover, Select, Table } from 'antd';
import { getInfoIssue } from '../../redux/actions/IssueAction';
import { getUserKeyword, insertUserIntoProject } from '../../redux/actions/UserAction';
import { GetProcessListAction, GetProjectAction } from '../../redux/actions/ListProjectAction';
import { deleteUserInProject } from '../../redux/actions/CreateProjectAction';
import { DeleteOutlined } from '@ant-design/icons';
import Search from 'antd/es/input/Search';
import { iTagForIssueTypes, iTagForPriorities } from '../../util/CommonFeatures';
export default function Dashboard() {
    const dispatch = useDispatch()

    //sử dụng hiển thị tất cả issue hoặc chỉ các issue liên quan tới user
    const [type, setType] = useState(0)
    const { id } = useParams()

    const projectInfo = useSelector(state => state.listProject.projectInfo)
    const [valueDashboard, setValueDashboard] = useState('')
    const listUser = useSelector(state => state.user.list)
    const userInfo = useSelector(state => state.user.userInfo)
    const processList = useSelector(state => state.listProject.processList)
    const [currentProcess, setCurrentProcess] = useState(null)
    //su dung cho debounce search
    const search = useRef(null)

    const [open, setOpen] = useState(false);

    const showModal = () => {
        setOpen(true);
    };

    const handleOk = () => {

    };

    const handleCancel = () => {
        console.log('Clicked cancel button');
        setOpen(false);
    };

    useEffect(() => {
        dispatch(GetProcessListAction(id))
        console.log("chay vo tan a");
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
    const renderTableMembers = (table) => {
        return <>{table}</>
    }
    const renderAvatarMembers = (value, table) => {
        return <Popover key={value._id} content={renderTableMembers(table)} title="Members">
            <Avatar src={value.avatar} key={value._id} />
        </Popover>
    }

    const renderProcessListOptions = (currentProcessId) => {
        var processListOptions = []
        processList.filter(process => {
            if (process._id.toString() !== currentProcessId) {
                const processOption = {
                    label: <span style={{ backgroundColor: process.tag_color, width: '100%', height: '100%', display: 'block' }}>{process.name_process}</span>,
                    value: process._id.toString()
                }
                processListOptions.push(processOption)
                return true
            }
            return false
        })
        return processListOptions
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
                return (<li key={value._id} className="list-group-item" data-toggle="modal" data-target="#infoModal" style={{ cursor: 'pointer' }} onClick={() => {
                    dispatch(getInfoIssue(value._id))
                }} onKeyDown={() => { }}>
                    <p>
                        {value.shortSummary}
                    </p>
                    <div className="block" style={{ display: 'flex' }}>
                        <div className="block-left">
                            {iTagForIssueTypes(value.issueType)}
                            {iTagForPriorities(value.priority)}
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

    const renderMembersAndFeatureAdd = () => {
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
            value={valueDashboard}
            onChange={(value) => {
                setValueDashboard(value)
            }}
            defaultValue=''
            options={listUser?.reduce((newListUser, user) => {
                if (user._id !== userInfo.id) {
                    return [...newListUser, { label: user.username, value: user._id }]
                }
                return newListUser
            }, [])}
            onSelect={(value, option) => {
                setValueDashboard(option.label)
                dispatch(insertUserIntoProject({
                    project_id: projectInfo?._id,  //id cua project
                    user_id: value   //id cua username
                }))

                dispatch(GetProjectAction(projectInfo?._id, ""))
            }}
            placeholder="input here"
        />
    }

    // const addNewProcess = () => {
    //     const newListProcesses = [...listProcesses, { nameProcess: "hihi" }];
    //     console.log("listProcesses ", newListProcesses);
    //     setListProcesses(newListProcesses);
    // }
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
                        return renderAvatarMembers(value, table)
                    })}

                    <Popover placement="right" title="Add User" content={renderMembersAndFeatureAdd()} trigger="click">
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
                <Button onClick={() => {
                    // addNewProcess()
                }}>Add process {processList.length}</Button>
            </div>
            <div className="content" style={{ overflowX: 'scroll', width: '100%', display: '-webkit-box', padding: '15px 20px', scrollbarWidth: 'none', backgroundColor: 'white' }}>
                {processList?.map(process => (<div className="card" style={{ width: '18rem', height: '25rem', fontWeight: 'bold', scrollbarWidth: 'none' }}>
                    <div className='d-flex justify-content-between align-items-center' style={{ backgroundColor: process.tag_color, color: 'white', padding: '3px 10px' }}>
                        <div className="card-header">
                            {process.name_process} {countEleStatus(0, type)}
                        </div>
                        <div className='dropdown'>
                            <button style={{ height: '30px' }} className='btn btn-light p-0 pl-3 pr-3' type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <i className="fa-sharp fa-solid fa-bars"></i>
                            </button>
                            <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                <button className="dropdown-item">Set column limit</button>
                                <button className="dropdown-item" onClick={() => {
                                    setCurrentProcess(process)
                                    showModal()
                                }}>Delete</button>
                            </div>
                        </div>
                    </div>
                    <ul className="list-group list-group-flush">
                        {renderIssue(0, type)}
                    </ul>
                </div>))}
            </div>
            <Modal
                open={open}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <div className='d-flex'>
                    <i className="glyphicon glyphicon-alert"></i>
                    <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Move work from <span>{currentProcess?.name_process}</span> column</span>
                </div>
                <p>Select a new home for any work with the <span>{currentProcess?.name_process}</span> status, including work in the backlog.</p>
                <div className='d-flex justify-content-between align-items-center'>
                    <div className='d-flex flex-column'>
                        <label htmlFor='currentProcess'>This status will be deleted:</label>
                        <div style={{ textDecoration: 'line-through', backgroundColor: currentProcess?.tag_color, display: 'inline' }}>{currentProcess?.name_process}</div>
                    </div>
                    <i className="fa fa-long-arrow-alt-right"></i>
                    <div className='d-flex flex-column'>
                        <label htmlFor='newProcess?'>Move existing issues to:</label>
                        <Select
                            showSearch
                            optionFilterProp="label"
                            options={renderProcessListOptions(currentProcess?._id.toString())}
                            defaultValue={renderProcessListOptions(currentProcess?._id.toString())[0]?.value}
                        />
                    </div>
                </div>
            </Modal>
        </>
    )
}
