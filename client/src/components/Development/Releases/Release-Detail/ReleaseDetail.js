import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getVersionById, getVersionList, updateVersion } from '../../../../redux/actions/CategoryAction'
import { NavLink, useParams } from 'react-router-dom'
import { Avatar, Breadcrumb, Button, Progress, Table, Tag } from 'antd'
import { GetProcessListAction, GetProjectAction } from '../../../../redux/actions/ListProjectAction'
import { getIssuesInProject, updateInfoIssue } from '../../../../redux/actions/IssueAction'
import { iTagForIssueTypes, iTagForPriorities } from '../../../../util/CommonFeatures'
import { UserOutlined } from '@ant-design/icons';
import { drawer_edit_form_action } from '../../../../redux/actions/DrawerAction'
import CreateVersion from '../../../Forms/CreateVersion/CreateVersion'
import { calculateTaskRemainingTime } from '../../../../validations/TimeValidation'
import dayjs from 'dayjs'
import { displayComponentInModal } from '../../../../redux/actions/ModalAction'
import SelectIssuesModal from '../../../Modal/SelectIssuesModal/SelectIssuesModal'
import ReleaseVersionModal from '../../../Modal/ReleaseVersionModal/ReleaseVersionModal'
import { getValueOfArrayObjectFieldInIssue, getValueOfNumberFieldInIssue, getValueOfObjectFieldInIssue, getValueOfStringFieldInIssue } from '../../../../util/IssueFilter'
import { showNotificationWithIcon } from '../../../../util/NotificationUtil'
export default function ReleaseDetail() {
    const versionInfo = useSelector(state => state.categories.versionInfo)
    const { versionId, id } = useParams()
    const processList = useSelector(state => state.listProject.processList)
    const versionList = useSelector(state => state.categories.versionList)
    const projectInfo = useSelector(state => state.listProject.projectInfo)
    const issuesInProject = useSelector(state => state.issue.issuesInProject)
    const userInfo = useSelector(state => state.user.userInfo)

    const dispatch = useDispatch()
    useEffect(() => {
        dispatch(getVersionById(versionId))
        dispatch(GetProcessListAction(id))
        dispatch(getIssuesInProject(id))
        dispatch(getVersionList(id))
        dispatch(GetProjectAction(id, null, null))
    }, [])

    useEffect(() => {
        setDataSource(issuesInProject?.filter(issue => getValueOfObjectFieldInIssue(issue, "fix_version")?._id?.toString() === versionInfo?._id?.toString() && getValueOfNumberFieldInIssue(issue, "issue_status") !== 4 && getValueOfNumberFieldInIssue(issue, "issue_status") !== 4))
    }, [issuesInProject])

    const [dataSource, setDataSource] = useState([])
    const columns = [
        {
            title: 'Ordinal number',
            dataIndex: 'ordinal_number',
            key: 'ordinal_number',
            width: '150px',
            render: (text, record) => {
              return <NavLink to={`/projectDetail/${projectInfo?._id}/issues/issue-detail/${record._id}?typeview=detailview`}>{projectInfo?.key_name}-{record.ordinal_number}</NavLink>
            }
          },
        {
            title: 'Issue',
            dataIndex: 'issue',
            width: 'fit-content',
            key: 'issue',
            render: (text, record) => {
                return <div className='d-flex align-items-center'>
                    <span>{iTagForPriorities(getValueOfNumberFieldInIssue(record, "issue_priority"), null, null)}</span>
                    <span className='ml-2'>{iTagForIssueTypes(getValueOfNumberFieldInIssue(record, "issue_status"), null, null, projectInfo?.issue_types_default)}</span>
                    {/* <span>WD-{record._id.toString()}</span> */}
                    <span className='ml-2' style={{ width: 'fit-content' }}>{getValueOfStringFieldInIssue(record, "summary")}</span>
                </div>
            }
        },
        {
            title: 'Assignees',
            dataIndex: 'assignees',
            key: 'assignees',
            width: 'fit-content',
            render: (text, record) => {
                if (getValueOfArrayObjectFieldInIssue(record, "assignees").length === 0) {
                    return <span><Avatar icon={<UserOutlined />} /> <span className='ml-2'>Unassignee</span></span>
                }
            }
        },
        {
            title: 'Status',
            dataIndex: 'issue_status',
            key: 'issue_status',
            width: 'fit-content',
            render: (text, record) => {
                return <Tag color={getValueOfObjectFieldInIssue(record, "issue_type").tag_color}>{getValueOfObjectFieldInIssue(record, "issue_type").name_process}</Tag>
            }
        },
        {
            title: '',
            dataIndex: 'action',
            key: 'action',
            width: '100px',
            render: (text, record) => {
                return <div className="btn-group">
                    <Button data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><i className="fa fa-ellipsis-h"></i></Button>
                    <div className="dropdown-menu" style={{ width: 'max-content' }}>
                        <a href='##' onClick={() => {
                            dispatch(updateInfoIssue(record._id, record.project_id._id, { fix_version: null }, versionInfo.name_version, "None", userInfo.id, "updated", "version", projectInfo, userInfo))
                        }} style={{ padding: '10px', backgroundColor: '#ddd', color: '#000', textDecoration: 'none' }}>Remove from version</a>
                    </div>
                </div>


            }
        },
    ];
    const calculatePercentageForProgress = () => {
        return Math.round((versionInfo.issue_list?.filter(issue => {
            return getValueOfObjectFieldInIssue(issue, "issue_type") === processList[processList.length - 1]?._id
        })?.length / versionInfo.issue_list?.length) * 100)
    }

    const renderButtonRelease = (versionInfo) => {
        if (versionInfo.version_status === 0) { //if status is unReleased that move to released
            return <Button onClick={() => {
                if(versionInfo.start_date && versionInfo.end_date) {
                    dispatch(displayComponentInModal(<ReleaseVersionModal
                        userInfo={userInfo}
                        versionList={versionList}
                        processList={processList}
                        versionInfo={versionInfo}
                        projectInfo={projectInfo}
                    />))
                } else {
                    showNotificationWithIcon('error', '', 'Please set start date and end date before releasing')
                }
            }} className="mr-2">Release <i className="fa fa-check ml-2 text-success"></i></Button>
        } else if (versionInfo.version_status === 1) {
            return <Button onClick={() => { //if status is released that move to unreleased
                dispatch(updateVersion(versionInfo._id, { version_status: 0 }, versionInfo.project_id))
            }} className="mr-2">Unrelease</Button>
        }
    }
    const renderAddIssue = (processInfo) => {
        return <div style={{ height: 250, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h6>Nothing to see here</h6>
            <p>No issues have been added yet.</p>
            <Button onClick={() => {
                dispatch(displayComponentInModal(<SelectIssuesModal
                    projectInfo={projectInfo}
                    issuesInProject={issuesInProject.filter(issue => getValueOfNumberFieldInIssue(issue, "issue_status") !== 4)}
                    versionInfo={versionInfo}
                    epicInfo={null}
                    userInfo={userInfo}
                    processInfo={processInfo} />))
            }} type='primary'><i className="fa-solid fa-plus mr-2"></i>Add issues</Button>
        </div>
    }
    return (
        <div>
            <div className='version-header'>
                <Breadcrumb
                    style={{ marginBottom: 10 }}
                    items={[
                        {
                            title: <a href="/manager">Projects</a>,
                        },
                        {
                            title: <a href={`/projectDetail/${id}/board`}>{projectInfo?.name_project}</a>,
                        },
                        {
                            title: <a href={`/projectDetail/${id}/releases`}>Release</a>
                        }
                    ]}
                />
            </div>
            <div className='version-title'>
                <div className='version-title-header d-flex align-items-center justify-content-between'>
                    <div>
                        <div className='d-flex align-items-center'>
                            <h4 style={{ display: 'inline', margin: 0, marginRight: 5 }}>{versionInfo?.version_name}</h4>
                            <Tag color={versionInfo.tag_color}>{versionInfo.version_status === 0 ? <span className='text-muted font-weight-bold'>Unreleased</span> : <span className='text-muted font-weight-bold'>Released <i className="fa fa-check ml-2 text-success"></i></span>}</Tag>
                        </div>
                        <div className='d-flex'>
                            <span className='mr-3'><i className="fa fa-calendar-alt mr-2"></i><span><span className='font-weight-bold'>Start:</span> {versionInfo.start_date ? dayjs(versionInfo.start_date).format("DD/MM/YYYY hh:mm A") : "None"}</span></span>
                            <span><span className='font-weight-bold'>Release:</span> {versionInfo?.end_date ? dayjs(versionInfo?.end_date).format("DD/MM/YYYY hh:mm A") : "None"}</span>
                        </div>
                    </div>
                    <div>
                        <Button className="mr-2"><i className="fa-solid fa-comment mr-2"></i> Give feedback</Button>
                        <Button className="mr-2">Release notes</Button>
                        {renderButtonRelease(versionInfo)}

                        <Button onClick={() => {
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
                        }}>Edit version</Button>
                    </div>
                </div>
                <div className='version-title-summary'>
                    <p><span className='font-weight-bold'>Description:</span> {versionInfo?.description ? versionInfo.description : "No description added yet"}</p>
                </div>
                {
                    versionInfo?.start_date && versionInfo?.end_date ? <div className='mb-4'>
                        <span className='mb-2'>{calculateTaskRemainingTime(dayjs(versionInfo?.start_date), dayjs(versionInfo?.end_date))} remaining</span>
                        <Progress
                            percent={calculatePercentageForProgress()}
                            percentPosition={{
                                align: 'center',
                                type: 'inner',
                            }}
                            size={['100%', 10]}
                            style={{ widht: '100%' }}
                            strokeColor="#B7EB8F"
                        />
                    </div> : <></>
                }

            </div>
            <div className='version-info'>
                <div>
                    <nav>
                        <div className="nav nav-tabs" id="nav-tab" role="tablist">
                            <Button
                                className="nav-link active p-0 pr-2 pl-2"
                                id="nav-version-tab"
                                data-toggle="tab"
                                data-target="#nav-version"
                                role="tab"
                                aria-controls="nav-version"
                                aria-selected="true"
                                onClick={() => {
                                    setDataSource(issuesInProject?.filter(issue => getValueOfObjectFieldInIssue(issue, "fix_version")?._id?.toString() === versionInfo?._id?.toString() && getValueOfNumberFieldInIssue(issue, "issue_status") !== 4))
                                }}>
                                <div className='d-flex align-items-center'>
                                    <Avatar size={25} style={{ justifyContent: 'center' }}>
                                        {issuesInProject?.filter(issue => getValueOfObjectFieldInIssue(issue, "fix_version")?._id?.toString() === versionInfo?._id?.toString() && getValueOfNumberFieldInIssue(issue, "issue_status") !== 4 && getValueOfNumberFieldInIssue(issue, "issue_status") !== 4).length}
                                    </Avatar>
                                    <span className='ml-2'>issues in version</span>
                                </div>
                            </Button>
                            {processList?.map(process => {
                                return <Button
                                    className="nav-link p-0 pr-2 pl-2"
                                    id={`nav-version-${process._id.toString()}-tab`}
                                    data-toggle="tab"
                                    data-target={`#nav-version-${process._id.toString()}`}
                                    role="tab"
                                    aria-controls={`nav-version-${process._id.toString()}`}
                                    aria-selected="false"
                                    onClick={() => {
                                        setDataSource(issuesInProject?.filter(issue => getValueOfObjectFieldInIssue(issue, "fix_version")?._id?.toString() === versionInfo?._id?.toString() && getValueOfNumberFieldInIssue(issue, "issue_status") !== 4 && getValueOfObjectFieldInIssue(issue, "issue_type")?._id?.toString() === process?._id?.toString()))
                                    }}>
                                    <div className='d-flex align-items-center'>
                                        <Avatar size={25} style={{ backgroundColor: process.tag_color, justifyContent: 'center' }}>
                                            {issuesInProject?.filter(issue => getValueOfObjectFieldInIssue(issue, "fix_version")?._id?.toString() === versionInfo?._id?.toString() && getValueOfNumberFieldInIssue(issue, "issue_status") !== 4 && getValueOfObjectFieldInIssue(issue, "issue_type")?._id?.toString() === process?._id?.toString()).length}
                                        </Avatar>
                                        <span className='ml-2'>issues in {process.name_process.toLowerCase()}</span>
                                    </div>
                                </Button>
                            })}
                        </div>
                    </nav>
                    <div className="tab-content" id="nav-tabContent">
                        <div className="tab-pane fade show active" id="nav-version" role="tabpanel" aria-labelledby="nav-version-tab">
                            <Table
                                dataSource={dataSource}
                                columns={columns}
                                scroll={{
                                    y: 400
                                }}
                                locale={{
                                    emptyText: (renderAddIssue({}))
                                }}
                                footer={() => {
                                    if (dataSource.length !== 0) {
                                        return <Button className='mt-3' onClick={() => {
                                            dispatch(displayComponentInModal(<SelectIssuesModal
                                                projectInfo={projectInfo}
                                                issuesInProject={issuesInProject.filter(issue => getValueOfNumberFieldInIssue(issue, "issue_status") !== 4)}
                                                versionInfo={versionInfo}
                                                userInfo={userInfo}
                                                epicInfo={null}
                                                processInfo={processList[0]} />))
                                        }} type='primary'><i className="fa-solid fa-plus mr-2"></i>Add issues</Button>
                                    }
                                    return null
                                }} />
                        </div>
                        {processList?.map(process => {
                            return <div className="tab-pane fade" id={`nav-version-${process._id.toString()}`} role="tabpanel" aria-labelledby={`nav-version-${process._id.toString()}-tab`}>
                                <Table
                                    scroll={{
                                        y: 400
                                    }}
                                    dataSource={dataSource}
                                    footer={() => {
                                        if (dataSource.length !== 0) {
                                            return <Button className='mt-3' onClick={() => {
                                                dispatch(displayComponentInModal(<SelectIssuesModal
                                                    projectInfo={projectInfo}
                                                    issuesInProject={issuesInProject.filter(issue => getValueOfNumberFieldInIssue(issue, "issue_status") !== 4)}
                                                    versionInfo={versionInfo}
                                                    userInfo={userInfo}
                                                    processInfo={process}
                                                    epicInfo={process}
                                                />))
                                            }} type='primary'><i className="fa-solid fa-plus mr-2"></i>Add issues</Button>
                                        }
                                        return null
                                    }}
                                    columns={columns}
                                    locale={{
                                        emptyText: (renderAddIssue(process))
                                    }} />
                            </div>
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}
