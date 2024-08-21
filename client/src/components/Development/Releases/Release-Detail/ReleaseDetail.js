import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getVersionById } from '../../../../redux/actions/CategoryAction'
import { useParams } from 'react-router-dom'
import { Avatar, Progress, Table, Tag } from 'antd'
import { GetProcessListAction } from '../../../../redux/actions/ListProjectAction'
import { getIssuesBacklog } from '../../../../redux/actions/IssueAction'
import { iTagForIssueTypes, iTagForPriorities } from '../../../../util/CommonFeatures'
import { UserOutlined } from '@ant-design/icons';
import { drawer_edit_form_action } from '../../../../redux/actions/DrawerAction'
import CreateVersion from '../../../Forms/CreateVersion/CreateVersion'
export default function ReleaseDetail() {
    const versionInfo = useSelector(state => state.categories.versionInfo)
    const { versionId, id } = useParams()
    const processList = useSelector(state => state.listProject.processList)
    const issuesBacklog = useSelector(state => state.issue.issuesBacklog)
    const dispatch = useDispatch()
    useEffect(() => {
        dispatch(getVersionById(versionId))
        dispatch(GetProcessListAction(id))
        dispatch(getIssuesBacklog(id))
    }, [])
    const [dataSource, setDataSource] = useState([])
    const columns = [
        {
            title: 'Issue',
            dataIndex: 'issue',
            key: 'issue',
            render: (text, record) => {
                return <div className='d-flex align-items-center'>
                    <span>{iTagForPriorities(record.issue_priority)}</span>
                    <span className='ml-2'>{iTagForIssueTypes(record.issue_status)}</span>
                    {/* <span>WD-{record._id.toString()}</span> */}
                    <span className='ml-2'>{record.summary}</span>
                </div>
            }
        },
        {
            title: 'Assignees',
            dataIndex: 'assignees',
            key: 'assignees',
            render: (text, record) => {
                if (record.assignees.length === 0) {
                    return <span><Avatar icon={<UserOutlined />} /> <span className='ml-2'>Unassignee</span></span>
                }
            }
        },
        {
            title: 'Status',
            dataIndex: 'issue_status',
            key: 'issue_status',
            render: (text, record) => {
                return <Tag color={record.issue_type.tag_color}>{record.issue_type.name_process}</Tag>
            }
        },
    ];
    return (
        <div>
            <div className='version-header'>
                <p>Project / website development / Release</p>
            </div>
            <div className='version-title'>
                <div className='version-title-header d-flex align-items-center justify-content-between'>
                    <div>
                        <div>
                            <h4 style={{ display: 'inline' }}>{versionInfo?.version_name}</h4>
                            <Tag color={versionInfo.tag_color}><span>UNRELEASED</span></Tag>
                        </div>
                        <div className='d-flex'>
                            <span className='mr-3'><i className="fa fa-calendar-alt mr-2"></i><span>Start: {versionInfo.start_date}</span></span>
                            <span>Release: {versionInfo?.end_date}</span>
                        </div>
                    </div>
                    <div>
                        <button className='btn btn-transparent'>Give feedback</button>
                        <button className='btn btn-dark'>Release notes</button>
                        <button className='btn btn-primary'>Release</button>
                        <button className='btn btn-secondary' onClick={() => {
                            dispatch(drawer_edit_form_action(<CreateVersion currentVersion={
                                {
                                    version_id: versionInfo._id.toString(),
                                    project_id: id,
                                    version_name: versionInfo.version_name,
                                    description: versionInfo.description,
                                    start_date: versionInfo.start_date,
                                    end_date: versionInfo.end_date,
                                }
                        } />, 'Save', '760px'))
                        }}>Edit version</button>
                    </div>
                </div>
                <div className='version-title-summary'>
                    <p>Summary: {versionInfo?.description}</p>
                </div>
                <div className='mb-4'>
                    <span className='mb-2'>66 days left</span>
                    <Progress
                        percent={20}
                        percentPosition={{
                            align: 'center',
                            type: 'inner',
                        }}
                        size={['100%', 10]}
                        style={{widht: '100%'}}
                        strokeColor="#B7EB8F"
                    />
                </div>
            </div>
            <div className='version-info'>
                <div>
                    <nav>
                        <div className="nav nav-tabs" id="nav-tab" role="tablist">
                            <button
                                className="nav-link active"
                                id="nav-version-tab"
                                data-toggle="tab"
                                data-target="#nav-version"
                                type="button"
                                role="tab"
                                aria-controls="nav-version"
                                aria-selected="true"
                                onClick={() => {
                                    setDataSource(issuesBacklog?.filter(issue => issue.fix_version?._id.toString() === versionInfo?._id.toString()))
                                }}>
                                <Avatar size={15}><span style={{ fontSize: 13, display: 'flex' }}>{issuesBacklog?.filter(issue => issue.fix_version?._id?.toString() === versionInfo?._id?.toString()).length}</span></Avatar> issues in version
                            </button>
                            {processList?.map(process => {
                                return <button
                                    className="nav-link"
                                    id={`nav-version-${process._id.toString()}-tab`}
                                    data-toggle="tab"
                                    data-target={`#nav-version-${process._id.toString()}`}
                                    type="button" role="tab"
                                    aria-controls={`nav-version-${process._id.toString()}`}
                                    aria-selected="false"
                                    onClick={() => {
                                        setDataSource(issuesBacklog?.filter(issue => issue.fix_version?._id.toString() === versionInfo?._id.toString() && issue.issue_type?._id?.toString() === process?._id?.toString()))
                                    }}>
                                    <Avatar size={15} style={{ backgroundColor: process.tag_color }}>
                                        <span style={{ fontSize: 13, display: 'flex' }}>
                                            {issuesBacklog?.filter(issue => issue.fix_version?._id?.toString() === versionInfo?._id?.toString() && issue.issue_type?._id?.toString() === process?._id?.toString()).length}
                                        </span>
                                    </Avatar> issues in {process.name_process.toLowerCase()}
                                </button>
                            })}
                        </div>
                    </nav>
                    <div className="tab-content" id="nav-tabContent">
                        <div className="tab-pane fade show active" id="nav-version" role="tabpanel" aria-labelledby="nav-version-tab">
                            <Table dataSource={dataSource} columns={columns} />
                        </div>
                        {processList?.map(process => {
                            return <div className="tab-pane fade" id={`nav-version-${process._id.toString()}`} role="tabpanel" aria-labelledby={`nav-version-${process._id.toString()}-tab`}>
                                <Table dataSource={dataSource} columns={columns} />
                            </div>
                        })}
                    </div>
                </div>

            </div>
        </div>
    )
}
