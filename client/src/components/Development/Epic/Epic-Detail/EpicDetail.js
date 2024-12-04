import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getEpicById } from '../../../../redux/actions/CategoryAction'
import { NavLink, useParams } from 'react-router-dom'
import { Avatar, Breadcrumb, Button, Table, Tag } from 'antd'
import { GetProcessListAction, GetProjectAction } from '../../../../redux/actions/ListProjectAction'
import { getIssuesInProject } from '../../../../redux/actions/IssueAction'
import { iTagForIssueTypes, iTagForPriorities } from '../../../../util/CommonFeatures'
import { UserOutlined } from '@ant-design/icons';
import { drawer_edit_form_action } from '../../../../redux/actions/DrawerAction'
import CreateEpic from '../../../Forms/CreateEpic/CreateEpic'
import { getValueOfArrayObjectFieldInIssue, getValueOfNumberFieldInIssue, getValueOfObjectFieldInIssue, getValueOfStringFieldInIssue } from '../../../../util/IssueFilter'
import { displayComponentInModal } from '../../../../redux/actions/ModalAction'
import SelectIssuesModal from '../../../Modal/SelectIssuesModal/SelectIssuesModal'
export default function EpicDetail() {
  const epicInfo = useSelector(state => state.categories.epicInfo)
  const userInfo = useSelector(state => state.user.userInfo)

  const { epicId, id } = useParams()
  const processList = useSelector(state => state.listProject.processList)
  const issuesInProject = useSelector(state => state.issue.issuesInProject)
  const projectInfo = useSelector(state => state.listProject.projectInfo)



  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(getEpicById(epicId))
    dispatch(GetProcessListAction(id))
    dispatch(getIssuesInProject(id, null))
    dispatch(GetProjectAction(id, null, null))
  }, [])

  useEffect(() => {
    setDataSource(issuesInProject?.filter(issue => getValueOfObjectFieldInIssue(issue, "epic_link")?._id?.toString() === epicInfo?._id?.toString()))
  }, [issuesInProject])
  const [dataSource, setDataSource] = useState([])
  console.log("dataSource ", dataSource);

  const columns = [
    {
      title: 'Ordinal number',
      dataIndex: 'ordinal_number',
      key: 'ordinal_number',
      render: (text, record) => {
        return <NavLink to={`/projectDetail/${projectInfo?._id}/issues/issue-detail/${record._id}?typeview=detailview`}>{projectInfo?.key_name}-{record.ordinal_number}</NavLink>
      }
    },
    {
      title: 'Issue',
      dataIndex: 'issue',
      key: 'issue',
      render: (text, record) => {
        return <div className='d-flex align-items-center'>
          <span>{iTagForPriorities(getValueOfNumberFieldInIssue(record, "issue_priority"), null, null)}</span>
          <span className='ml-2'>{iTagForIssueTypes(getValueOfNumberFieldInIssue(record, "issue_status"), null, null, projectInfo?.issue_types_default)}</span>
          {/* <span>WD-{record._id.toString()}</span> */}
          <span className='ml-2'>{getValueOfStringFieldInIssue(record, "summary")}</span>
        </div>
      }
    },
    {
      title: 'Assignees',
      dataIndex: 'assignees',
      key: 'assignees',
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
      render: (text, record) => {
        return <Tag color={getValueOfObjectFieldInIssue(record, "issue_type").tag_color}>{getValueOfObjectFieldInIssue(record, "issue_type").name_process}</Tag>
      }
    },
  ]
  const renderAddIssue = (processInfo) => {
    return <div style={{ height: 250, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h6>Nothing to see here</h6>
      <p>No issues have been added yet.</p>
      <Button onClick={() => {
        dispatch(displayComponentInModal(<SelectIssuesModal
          projectInfo={projectInfo}
          processList={processList}
          issuesInProject={issuesInProject.filter(issue => getValueOfNumberFieldInIssue(issue, "issue_status") !== 4)}
          versionInfo={null}
          epicInfo={epicInfo}
          userInfo={userInfo}
          processInfo={processInfo} />))
      }} type='primary'><i className="fa-solid fa-plus mr-2"></i>Add issues</Button>
    </div>
  }
  return (
    <div>
      <div className='epic-header'>
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
              title: <a href={`/projectDetail/${id}/epics`}>epics</a>,
            }
          ]}
        />
      </div>
      <div className='epic-title d-flex align-items-center justify-content-between'>
        <div>
          <div className='epic-title-header'>
            <h4>{epicInfo?.epic_name}</h4>
          </div>
          {
            epicInfo?.summary ? <div className='epic-title-summary'>
              <p>Summary: {epicInfo?.summary}</p>
            </div> : <></>
          }
        </div>
        <div>
          <Button className="mr-2"><i className="fa-solid fa-comment mr-2"></i> Give feedback</Button>
          <Button onClick={() => {
            dispatch(drawer_edit_form_action(<CreateEpic currentEpic={
              {
                id: epicInfo._id,
                project_id: id,
                summary: epicInfo.summary,
                epic_name: epicInfo.epic_name,
                name_project: projectInfo.name_project
              }
            } />, 'Save', '760px'))
          }}>Edit version</Button>
        </div>
      </div>
      <div className='epic-info'>
        <div>
          <nav>
            <div className="nav nav-tabs" id="nav-tab" role="tablist">
              <button
                className="nav-link active"
                id="nav-epic-tab"
                data-toggle="tab"
                data-target="#nav-epic"
                type="button"
                role="tab"
                aria-controls="nav-epic"
                aria-selected="true"
                onClick={() => {
                  setDataSource(issuesInProject?.filter(issue => getValueOfObjectFieldInIssue(issue, "epic_link")?._id.toString() === epicInfo?._id.toString()))
                }}>
                <div className='d-flex align-items-center'>
                  <Avatar size={25}>
                    {issuesInProject?.filter(issue => getValueOfObjectFieldInIssue(issue, "epic_link")?._id?.toString() === epicInfo?._id?.toString()).length}
                  </Avatar>
                  <span className='ml-2'>issues in epic</span>
                </div>
              </button>
              {processList?.map(process => {
                return <button
                  className="nav-link"
                  id={`nav-epic-${process._id.toString()}-tab`}
                  data-toggle="tab"
                  data-target={`#nav-epic-${process._id.toString()}`}
                  type="button" role="tab"
                  aria-controls={`nav-epic-${process._id.toString()}`}
                  aria-selected="false"
                  onClick={() => {
                    setDataSource(issuesInProject?.filter(issue => getValueOfObjectFieldInIssue(issue, "epic_link")?._id.toString() === epicInfo?._id.toString() && getValueOfObjectFieldInIssue(issue, "issue_type")?._id?.toString() === process?._id?.toString()))
                  }}>
                  <div className='d-flex align-items-center'>
                    <Avatar size={25} style={{ backgroundColor: process.tag_color }}>
                      {issuesInProject?.filter(issue => getValueOfObjectFieldInIssue(issue, "epic_link")?._id?.toString() === epicInfo?._id?.toString() && getValueOfObjectFieldInIssue(issue, "issue_type")?._id?.toString() === process?._id?.toString()).length}
                    </Avatar>
                    <span className='ml-2'>issues in {process.name_process.toLowerCase()}</span>
                  </div>
                </button>
              })}
            </div>
          </nav>
          <div className="tab-content" id="nav-tabContent">
            <div className="tab-pane fade show active" id="nav-epic" role="tabpanel" aria-labelledby="nav-epic-tab">
              <Table
                dataSource={dataSource}
                columns={columns}
                locale={{ emptyText: (renderAddIssue(processList[0])) }}
                footer={() => {
                  if (dataSource.length !== 0) {
                    return <Button className='mt-3' onClick={() => {
                      dispatch(displayComponentInModal(<SelectIssuesModal
                        projectInfo={projectInfo}
                        processList={processList}
                        issuesInProject={issuesInProject.filter(issue => getValueOfNumberFieldInIssue(issue, "issue_status") !== 4)}
                        versionInfo={null}
                        epicInfo={epicInfo}
                        userInfo={userInfo}
                        processInfo={processList[0]} />
                      ))
                    }} type='primary'><i className="fa-solid fa-plus mr-2"></i>Add issues</Button>
                  }
                  return null
                }} />
            </div>
            {processList?.map(process => {
              return <div className="tab-pane fade" id={`nav-epic-${process._id.toString()}`} role="tabpanel" aria-labelledby={`nav-epic-${process._id.toString()}-tab`}>
                <Table
                  dataSource={dataSource}
                  columns={columns}
                  locale={{ emptyText: (renderAddIssue(process)) }}
                  footer={() => {
                    if (dataSource.length !== 0) {
                      return <Button className='mt-3' onClick={() => {
                        dispatch(displayComponentInModal(<SelectIssuesModal
                          projectInfo={projectInfo}
                          processList={processList}
                          issuesInProject={issuesInProject.filter(issue => getValueOfNumberFieldInIssue(issue, "issue_status") !== 4)}
                          versionInfo={null}
                          epicInfo={epicInfo}
                          userInfo={userInfo}
                          processInfo={process} />
                        ))
                      }} type='primary'><i className="fa-solid fa-plus mr-2"></i>Add issues</Button>
                    }
                    return null
                  }} />
              </div>
            })}
          </div>
        </div>

      </div>
    </div>
  )
}
