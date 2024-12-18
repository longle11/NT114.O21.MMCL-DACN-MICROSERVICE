import Search from 'antd/es/input/Search'
import React, { useEffect } from 'react'
import { Breadcrumb, Button, Progress, Table, Tag } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { drawer_edit_form_action } from '../../../../redux/actions/DrawerAction';
import CreateVersion from '../../../Forms/CreateVersion/CreateVersion';
import { NavLink, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import './Release.css'
import { deleteVersion, getVersionList } from '../../../../redux/actions/CategoryAction';
import { GetProcessListAction } from '../../../../redux/actions/ListProjectAction';
import { getValueOfObjectFieldInIssue } from '../../../../util/IssueFilter';
export default function Release() {
    const dispatch = useDispatch()
    const { id } = useParams()
    const versionList = useSelector(state => state.categories.versionList)
    const processList = useSelector(state => state.listProject.processList)
    const projectInfo = useSelector(state => state.listProject.projectInfo)
    const userInfo = useSelector(state => state.user.userInfo)
    useEffect(() => {
        dispatch(getVersionList(id))
        dispatch(GetProcessListAction(id))
    }, [])

    const calculatePercentageForProgress = (record) => {
        return Math.round((record.issue_list?.filter(issue => {
            const index = processList.findIndex(process => process._id.toString() === getValueOfObjectFieldInIssue(issue, 'issue_type')?.toString())
            if (index !== -1 && processList[index]?.type_process === 'done') return true
            return false
        })?.length / record.issue_list?.length) * 100)
    }
    const columns = [
        {
            title: 'Version',
            dataIndex: 'version',
            width: 'max-content',
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
                if (record.version_status === 0) {
                    return <Tag color={record.tag_color}><span style={{ color: '#000', fontWeight: 'bold' }}>Unrelease</span></Tag>
                } else {
                    return <Tag color={record.tag_color}><span style={{ color: '#000', fontWeight: 'bold' }}>Release <i className="fa fa-check ml-2 text-success"></i></span></Tag>

                }
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
                    percent={calculatePercentageForProgress(record)}
                    percentPosition={{
                        align: 'center',
                        type: 'inner',
                    }}
                    size={[200, 10]}
                    strokeColor="lightblue"
                />
            }
        },
        {
            title: 'Start date',
            dataIndex: 'startDate',
            width: '15%',
            render: (text, record) => {
                if (!record.start_date) return <></>
                return <Tag color="#2db7f5">{dayjs(record.start_date).format("DD/MM/YYYY")}</Tag>
            }
        },
        {
            title: 'Release date',
            dataIndex: 'end_date',
            width: '15%',
            render: (text, record) => {
                if (!record.end_date) return <></>
                return <Tag color="#87d068">{dayjs(record.end_date).format("DD/MM/YYYY")}</Tag>
            }
        },
        {
            title: 'Description',
            dataIndex: 'description',
            width: 'max-content',
            render: (text, record) => {
                return <span>{record.description}</span>
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
                            dispatch(deleteVersion(record._id, record.issue_list, record.version_name, userInfo))
                        }} style={{ padding: '10px', color: 'black', textDecoration: 'none', width: '100%', display: 'block' }}>Delete</a>
                        <a className='release-edit' href='##' onClick={() => {
                            dispatch(drawer_edit_form_action(<CreateVersion currentVersion={
                                {
                                    id: record._id,
                                    project_id: id,
                                    description: record.description,
                                    version_name: record.version_name,
                                    start_date: dayjs(record.start_date).format('DD/MM/YYYY'),
                                    end_date: dayjs(record.end_date).format('DD/MM/YYYY'),
                                    version_id: null
                                }} />, 'Create', '500px'))
                        }} style={{ padding: '10px', color: 'black', textDecoration: 'none', width: '100%', display: 'block' }}>Edit</a>
                    </div>
                </div>
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
                <h5>Release</h5>
            </div>
            {versionList !== null && versionList?.length > 0 ? <div>
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
