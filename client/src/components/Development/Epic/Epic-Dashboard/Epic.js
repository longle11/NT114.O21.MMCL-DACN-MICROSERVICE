import React, { useEffect } from 'react'
import { drawer_edit_form_action } from '../../../../redux/actions/DrawerAction';
import CreateEpic from '../../../Forms/CreateEpic/CreateEpic';
import { Avatar, Breadcrumb, Button, Table } from 'antd';
import Search from 'antd/es/input/Search';
import { useDispatch, useSelector } from 'react-redux';
import { deleteEpic, getEpicList } from '../../../../redux/actions/CategoryAction';
import { NavLink, useParams } from 'react-router-dom';
import { GetProjectAction } from '../../../../redux/actions/ListProjectAction';

export default function Epic() {
    const dispatch = useDispatch()
    const { id } = useParams()
    const epicList = useSelector(state => state.categories.epicList)
    
    const userInfo = useSelector(state => state.user.userInfo)
    const projectInfo = useSelector(state => state.listProject.projectInfo)
    useEffect(() => {
        dispatch(getEpicList(id))
        dispatch(GetProjectAction(id, null, null))
    }, [])
    const columns = [
        {
            title: 'Epic',
            dataIndex: 'epic',
            width: '25%',
            render: (text, record) => {
                return <NavLink to={`/projectDetail/${id}/epics/epic-detail/${record._id.toString()}`}>{record.epic_name}</NavLink>
            }
        },
        {
            title: 'Issues',
            dataIndex: 'issue_list',
            with: '10%',
            render: (text, record) => {
                return <span>{record.issue_list.length} issues</span>
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
            title: 'Summary',
            dataIndex: 'summary',
            width: 'fit-content',
            render: (text, record) => {
                return <span>{record.summary}</span>
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
                            dispatch(deleteEpic(record._id, record.issue_list, record.epic_name, userInfo))
                        }} style={{ padding: '10px', color: 'black', textDecoration: 'none', width: '100%', display: 'block' }}>Delete</a>
                        <a className='release-edit' href='##' onClick={() => {
                            dispatch(drawer_edit_form_action(<CreateEpic currentEpic={
                                {
                                  id: record._id,
                                  project_id: id,
                                  summary: record.summary,
                                  epic_name: record.epic_name,
                                  name_project: projectInfo.name_project
                                }
                              } />, 'Save', '760px'))
                        }} style={{ padding: '10px', color: 'black', textDecoration: 'none', width: '100%', display: 'block' }}>Edit</a>
                    </div>
                </div>
            }
        }
    ]
    return (
        <div >
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
            <h5>Epic</h5>
            {/* Phan chua thanh search va checkbox */}
            {epicList !== null && epicList?.length > 0 ? <div>
                <div>
                    {/* Phan chua thanh search va checkbox */}
                    <div className="search-info-releases">
                        <div className="search-block d-flex justify-content-between">
                            <Search
                                placeholder="input search text"
                                style={{ width: 300 }}
                                onSearch={value => {

                                }}
                            />
                            <Button className='mr-3' onClick={() => {
                                dispatch(drawer_edit_form_action(<CreateEpic currentEpic={
                                    {
                                        id: null,
                                        project_id: id,
                                        summary: '',
                                        epic_name: '',
                                        name_project: projectInfo.name_project
                                    }} />, 'Create', '500px'))
                            }}>Create epic</Button>
                        </div>
                    </div>
                </div>
                <Table className='mt-3' columns={columns} dataSource={epicList} />
            </div> : <div>
                <div className="d-flex flex-column align-items-center">
                    <img alt="new img" style={{ width: '200px' }} src="https://jira-frontend-bifrost.prod-east.frontend.public.atl-paas.net/assets/releases-80px.782fa98d.svg" />
                    <p>Epics help you devided one big task into small tasks. <br /> Add a epic to start creating a big task</p>
                    <button className='btn btn-primary' onClick={() => {
                        dispatch(drawer_edit_form_action(<CreateEpic currentEpic={{ id: null, project_id: id, creator: userInfo.id, epic_name: '', summary: '', name_project: projectInfo.name_project }} />, 'Save', '500px'))
                    }}>Create epic</button>
                </div>
            </div>}
        </div>
    )
}
