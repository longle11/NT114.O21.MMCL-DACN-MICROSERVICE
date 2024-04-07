import React, { useEffect, useRef, useState } from 'react'
import { Button, Table, Popconfirm, Avatar, Popover, AutoComplete, Tag } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { GetProjectAction, ListProjectAction } from '../../redux/actions/ListProjectAction';
import { drawer_edit_form_action } from '../../redux/actions/DrawerAction';
import FormEdit from '../Forms/FormEdit';
import { deleteItemCategory, getItemCategory } from '../../redux/actions/EditCategoryAction';
import { getUserKeyword, insertUserIntoProject } from '../../redux/actions/UserAction';
import { NavLink, useNavigate } from 'react-router-dom';
import { showNotificationWithIcon } from '../../util/NotificationUtil';
import { deleteUserInProject } from '../../redux/actions/CreateProjectAction';
export default function ProjectManager() {

    const dispatch = useDispatch()
    const listProject = useSelector(state => state.listProject.listProject)
    const listUser = useSelector(state => state.user.list)
    const navigate = useNavigate()
    useEffect(() => {
        dispatch(ListProjectAction())
        navigate('/manager')
    }, [])

    const [value, setValue] = useState('')

    //lấy ra người dùng hiện tại đang đăng nhập
    const userInfo = useSelector(state => state.user.userInfo)

    //su dung cho debounce search
    const search = useRef(null)

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
            title: 'Delete',
            key: 'delete',
            dataIndex: '_id',
            render: (text, record, index) => {
                return <Button type="primary" onClick={async () => {
                    await dispatch(deleteUserInProject(text, record.projectId))

                    dispatch(ListProjectAction())
                }} icon={<DeleteOutlined />} size='large' />
            }
        }
    ];
    const columns = [
        {
            title: 'ID',
            dataIndex: '_id',
            key: '_id',
        },
        {
            title: 'Project Name',
            dataIndex: 'projectName',
            key: 'projectName',
            render: (text, record, index) => {
                if (record.creator._id === userInfo.id || record.members.findIndex(user => user._id === userInfo.id) !== -1) {
                    return <NavLink to={`/projectDetail/${record._id}`} onClick={() => {
                        console.log(`/projectDetail/${record._id}`);
                        dispatch(GetProjectAction(record._id, ""))
                    }} style={{ textDecoration: 'none' }}>
                        <span>{record.nameProject}</span>
                    </NavLink>
                }

                return <span onClick={() => {
                    showNotificationWithIcon('error', '', 'Ban chua tham gia vao trong du an nay')
                }}>{record.nameProject}</span>
            }
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            render: (text, record, index) => {
                return <Tag key={index} color="magenta">{record.category?.name}</Tag>
            }
        },
        {
            title: 'Creator',
            dataIndex: 'creatorId',
            key: 'creatorId',
            render: (text, record, index) => {
                return <Tag key={index} color="green">{record.creator?.username}</Tag>
            }
        },
        {
            title: 'Members',
            dataIndex: 'members',
            key: 'members',
            render: (text, record, index) => {  //userInfo.id === record.creator._id
                return <>
                    {userInfo.id === record.creator?._id ? (
                        <div>
                            {
                                record.members?.slice(0, 3).map((user, index) => {
                                    return <Popover content={() => {
                                        const pos = record?.members.findIndex(user => user._id === record.creator._id)
                                        if (pos !== -1) {
                                            record?.members.splice(pos, 1)
                                        }
                                        //chèn id của project vào từng giá trị
                                        const newMembers = record?.members.map(value => {
                                            return { ...value, projectId: record._id }
                                        })
                                        return <Table columns={memberColumns} rowKey={index} dataSource={newMembers} />
                                    }} title="Members">
                                        <Avatar key={index} src={<img src={user.avatar} alt="avatar" />} />
                                    </Popover>
                                })
                            }
                            {record.members?.length >= 3 ? <Avatar>...</Avatar> : ''}
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
                                    onSelect={(value, option) => {
                                        setValue(option.label)
                                        dispatch(insertUserIntoProject({
                                            project_id: record?._id,  //id cua project
                                            user_id: value   //id cua username
                                        }))
                                    }}
                                    placeholder="input here"
                                />
                            }} trigger="click">
                                <Avatar style={{ backgroundColor: '#87d068' }}>
                                    <i className="fa fa-plus"></i>
                                </Avatar>
                            </Popover>
                        </div>) : (
                        <div>
                            {record.members?.slice(0, 3).map((user, index) => {
                                return <Avatar key={index} src={<img src={user.avatar} alt="avatar" />} />
                            })}
                            {record.members?.length >= 3 ? <Avatar>...</Avatar> : ''}
                        </div>)
                    }

                </>
            }
        },
        {
            title: 'Action',
            dataIndex: 'action',
            key: 'categoryId',
            render: (text, record, index) => {
                if (userInfo.id === record.creator?._id) {
                    return <div>
                        <Button className='mr-2 text-primary' type="default" icon={<EditOutlined />} size='large' onClick={() => {
                            dispatch(drawer_edit_form_action(<FormEdit />))
                            //gửi item hiện tại lên redux
                            record.creator = 45
                            dispatch(getItemCategory(record))
                        }} />
                        <Popconfirm
                            title="Delete this task"
                            description="Are you sure to delete this task?"
                            okText="Yes"
                            cancelText="No"
                            onConfirm={() => {
                                dispatch(deleteItemCategory(record?._id))
                            }}
                        >
                            <Button className='mr-2' type="primary" icon={<DeleteOutlined />} size='large' />
                        </Popconfirm>
                    </div>
                } else {
                    return <></>
                }
            },
        }
    ];
    return (
        <>
            <div className='container-fluid'>
                <div className="header">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb" style={{ backgroundColor: 'white' }}>
                            <li className="breadcrumb-item">Project</li>
                            <li className="breadcrumb-item active" aria-current="page">
                                Project management
                            </li>
                        </ol>
                    </nav>
                </div>
                <h3>Project management</h3>
                <div className="content">
                    <Table columns={columns} rowKey={"id"} dataSource={listProject} />
                </div>
            </div>
        </>
    )
}
