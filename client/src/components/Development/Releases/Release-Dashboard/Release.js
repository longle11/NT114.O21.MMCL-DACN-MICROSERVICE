import Search from 'antd/es/input/Search'
import React, { useEffect } from 'react'
import { Breadcrumb, Button, Progress, Table, Tag } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { drawer_edit_form_action } from '../../../../redux/actions/DrawerAction';
import CreateVersion from '../../../Forms/CreateVersion/CreateVersion';
import { NavLink, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { getVersionList } from '../../../../redux/actions/CategoryAction';
export default function Release() {
    const dispatch = useDispatch()
    const { id } = useParams()
    const versionList = useSelector(state => state.categories.versionList)
    const projectInfo = useSelector(state => state.listProject.projectInfo)
    useEffect(() => {
        dispatch(getVersionList(id))
    }, [])
    const columns = [
        {
            title: 'Version',
            dataIndex: 'version',
            width: '10%',
            render: (text, record) => {
                return <NavLink to={`/projectDetail/${id}/versions/version-detail/${record._id.toString()}`}>{record.version_name}</NavLink>
            }
        },
        {
            title: 'Status',
            dataIndex: 'status',
            sorter: (a, b) => a.status - b.status,
            with: '10%',
            render: (text, record) => {
                return <Tag color={record.tag_color}>Unrelease</Tag>
            }
        },
        {
            title: 'Progress',
            dataIndex: 'progress',
            width: '20%',
            render: (text, record) => {
                if (record.issue_list.length === 0) {
                    return <span>0 issues</span>
                }
                return <Progress
                    percent={0}
                    percentPosition={{
                        align: 'center',
                        type: 'inner',
                    }}
                    size={[200, 20]}
                    strokeColor="#E6F4FF"
                />
            }
        },
        {
            title: 'Start date',
            dataIndex: 'startDate',
            width: '15%',
            render: (text, record) => {
                return <Tag color="#2db7f5">{record.start_date}</Tag>
            }
        },
        {
            title: 'Release date',
            dataIndex: 'end_date',
            width: '15%',
            render: (text, record) => {
                return <Tag color="#87d068">{record.end_date}</Tag>
            }
        },
        {
            title: 'Description',
            dataIndex: 'description',
            width: '30%',
            render: (text, record) => {
                return <span>{record.description}</span>
            }
        },
    ];

    return (
        <div>
            <div>
                <Breadcrumb
                    style={{ marginBottom: 10 }}
                    items={[
                        {
                            title: <a href="/">Projects</a>,
                        },
                        {
                            title: <a href={`/projectDetail/${id}/board`}>{projectInfo?.name_project}</a>,
                        }
                    ]}
                />
                <div className='d-flex justify-content-between'>
                    <h5>Release</h5>
                    <div className='mr-3'> 
                        <Button onClick={() => {
                            dispatch(drawer_edit_form_action(<CreateVersion currentVersion={
                                {
                                    id: null,
                                    project_id: id,
                                    description: '',
                                    version_name: '',
                                    start_date: dayjs(new Date()).format('DD/MM/YYYY'),
                                    end_date: dayjs(new Date()).format('DD/MM/YYYY'),
                                    version_id: null
                                }} />, 'Create', '500px'))
                        }}>Create version</Button>
                    </div>
                </div>
            </div>
            {versionList !== null && versionList?.length > 0 ? <div>
                <div>
                    {/* Phan chua thanh search va checkbox */}
                    <div className="search-info-releases d-flex">
                        <div className="search-block">
                            <Search
                                placeholder="input search text"
                                style={{ width: 300 }}
                                onSearch={value => {

                                }}
                            />
                        </div>
                    </div>
                </div>
                <Table className='mt-3' columns={columns} dataSource={versionList} />
            </div> : <div className="d-flex flex-column align-items-center" style={{ height: '70vh' }}>
                <img alt="new img" style={{ width: '200px' }} src="https://jira-frontend-bifrost.prod-east.frontend.public.atl-paas.net/assets/releases-80px.782fa98d.svg" />
                <p>Versions help you package and schedule project deliveries. <br /> Add a vision to start collecting and releasing your work</p>
                <button className='btn btn-primary' onClick={() => {
                    dispatch(drawer_edit_form_action(<CreateVersion currentVersion={
                        {
                            id: null,
                            project_id: id,
                            description: '',
                            version_name: '',
                            start_date: dayjs(new Date()).format('DD/MM/YYYY'),
                            end_date: dayjs(new Date()).format('DD/MM/YYYY'),
                            version_id: null
                        }} />, 'Create', '500px'))
                }}>Create version</button>
            </div>}

        </div>
    )
}
