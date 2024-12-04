import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { NavLink, useParams } from 'react-router-dom'
import { GetProjectAction } from '../../../../redux/actions/ListProjectAction'
import { Avatar, Breadcrumb, Button, Table, Tag } from 'antd'
import { drawer_edit_form_action } from '../../../../redux/actions/DrawerAction'
import CreateComponent from '../../../Forms/CreateComponent/CreateComponent'
import { getComponentList } from '../../../../redux/actions/CategoryAction'
import { UserOutlined } from '@ant-design/icons'
import Search from 'antd/es/transfer/search'
export default function ComponentList() {
    const dispatch = useDispatch()
    const { id } = useParams()
    const componentList = useSelector(state => state.categories.componentList)
    const userInfo = useSelector(state => state.user.userInfo)
    const projectInfo = useSelector(state => state.listProject.projectInfo)

    useEffect(() => {
        dispatch(getComponentList(id))
        dispatch(GetProjectAction(id, null, null))
    }, [])
    const columns = [
        {
            title: 'Component',
            dataIndex: 'component',
            width: '25%',
            render: (text, record) => {
                return <NavLink to={`/projectDetail/${id}/issues/issue-detail?typeview=listview&&componentid=${record._id.toString()}`}>{record.component_name}</NavLink>
            }
        },
        {
            title: 'Creator',
            dataIndex: 'creator',
            width: '15%',
            render: (text, record) => {
                if (record.creator === null) {
                    return null
                }
                return <span><Avatar src={record.creator.avatar} className='mr-2' />{record.creator.username}</span>
            }
        },
        {
            title: 'Description',
            dataIndex: 'description',
            width: 'fit-content',
            render: (text, record) => {
                return <span>{record.description}</span>
            }
        },
        {
            title: 'Component Lead',
            dataIndex: 'component_lead',
            width: 'fit-content',
            render: (text, record) => {
                return <span>{!record.component_lead ? <span><Avatar icon={<UserOutlined />}></Avatar> Unassignee</span> : <span><Avatar src={record.component_lead?.avatar}></Avatar> {record.component_lead?.username}</span>}</span>
            }
        },
        {
            title: 'Issues',
            dataIndex: 'issue_list',
            width: 'fit-content',
            render: (text, record) => {
                return <span>{record.issue_list?.length} issues</span>
            }
        },
        {
            title: '',
            dataIndex: '',
            width: '',
            render: (text, record) => {
                return <div className="btn-group">
                    <Button data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><i className="fa fa-ellipsis-h"></i></Button>
                    <div className="dropdown-menu" style={{ width: 'max-content' }}>
                        <a className='release-edit' href='##' onClick={() => {
                            // dispatch(deleteEpic(record._id, record.issue_list, record.epic_name, userInfo))
                        }} style={{ padding: '10px', color: 'black', textDecoration: 'none', width: '100%', display: 'block' }}>Delete</a>
                        <a className='release-edit' href='##' onClick={() => {
                            dispatch(drawer_edit_form_action(<CreateComponent currentComponent={
                                {
                                    id: record._id,
                                    project_id: id,
                                    description: record.description,
                                    creator: userInfo?.id,
                                    component_name: record.component_name,
                                    component_lead: record.component_lead
                                }
                            } />, 'Save', '760px'))
                        }} style={{ padding: '10px', color: 'black', textDecoration: 'none', width: '100%', display: 'block' }}>Edit</a>
                    </div>
                </div>
            }
        }
    ]
    return (
        <div>
            <Breadcrumb
                style={{ marginBottom: 10 }}
                items={[
                    {
                        title: <a href="/manager">Projects</a>,
                    },
                    {
                        title: <a href={`/projectDetail/${id}/board`}>{projectInfo?.name_project}</a>,
                    }
                ]}
            />
            <h5>Components</h5>
            {componentList !== null && componentList?.length > 0 ? <div>
                <div>
                    {/* Phan chua thanh search va checkbox */}
                    <div className="search-info-releases">
                        <div className="search-block d-flex" style={{ width: 500 }}>
                            <Search
                                placeholder="input search text"
                            />
                            <Button className='mr-3 ml-2' onClick={() => {
                                dispatch(drawer_edit_form_action(<CreateComponent currentComponent={
                                    {
                                        id: null,
                                        project_id: id,
                                        description: '',
                                        creator: userInfo?.id,
                                        component_name: '',
                                        component_lead: null
                                    }} />, 'Create', '500px'))
                            }}>Create component</Button>
                        </div>
                    </div>
                </div>
                <Table className='mt-3' columns={columns} dataSource={componentList} />
            </div> : <div style={{ height: '80vh' }}>
                <div className="d-flex flex-column align-items-center justify-content-center">
                    <img alt="new img" style={{ width: '200px' }} src="https://jira-frontend-bifrost.prod-east.frontend.public.atl-paas.net/assets/components.37259031.svg" />
                    <p className='mt-2'>This project doesn't have any components, yet</p>
                    <span className='mb-2'>Components are subsections of a project. Use them to group issues within a project into smaller parts.</span>
                    <button className='btn btn-primary' onClick={() => {
                        dispatch(drawer_edit_form_action(<CreateComponent currentComponent={{
                            id: null,
                            project_id: id,
                            creator: userInfo.id,
                            description: '',
                            component_lead: null,
                            component_name: ''
                        }} />, 'Save', '500px'))
                    }}>Create component</button>
                </div>
            </div>}
        </div>
    )
}
