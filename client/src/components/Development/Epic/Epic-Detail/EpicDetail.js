import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getEpicById } from '../../../../redux/actions/CategoryAction'
import { useParams } from 'react-router-dom'
import { Avatar, Table, Tag } from 'antd'
import { GetProcessListAction } from '../../../../redux/actions/ListProjectAction'
import { getIssuesBacklog } from '../../../../redux/actions/IssueAction'
import { iTagForIssueTypes, iTagForPriorities } from '../../../../util/CommonFeatures'
import { UserOutlined } from '@ant-design/icons';
export default function EpicDetail() {
  const epicInfo = useSelector(state => state.categories.epicInfo)
  const { epicId, id } = useParams()
  const processList = useSelector(state => state.listProject.processList)
  const issuesBacklog = useSelector(state => state.issue.issuesBacklog)
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(getEpicById(epicId))
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
        if(record.assignees.length === 0){
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
      <div className='epic-header'>
        <p>Project / website development / Release</p>
      </div>
      <div className='epic-title'>
        <div className='epic-title-header'>
          <h4>{epicInfo?.epic_name}</h4>
        </div>
        <div className='epic-title-summary'>
          <p>Summary: {epicInfo?.summary}</p>
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
                  setDataSource(issuesBacklog?.filter(issue => issue.epic_link?._id.toString() === epicInfo?._id.toString()))
                }}>
                <Avatar size={15}><span style={{ fontSize: 13, display: 'flex' }}>{issuesBacklog?.filter(issue => issue.epic_link?._id?.toString() === epicInfo?._id?.toString()).length}</span></Avatar> issues in epic
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
                    setDataSource(issuesBacklog?.filter(issue => issue.epic_link?._id.toString() === epicInfo?._id.toString() && issue.issue_type?._id?.toString() === process?._id?.toString()))
                  }}>
                  <Avatar size={15} style={{ backgroundColor: process.tag_color }}>
                    <span style={{ fontSize: 13, display: 'flex' }}>
                      {issuesBacklog?.filter(issue => issue.epic_link?._id?.toString() === epicInfo?._id?.toString() && issue.issue_type?._id?.toString() === process?._id?.toString()).length}
                    </span>
                  </Avatar> issues in {process.name_process.toLowerCase()}
                </button>
              })}
            </div>
          </nav>
          <div className="tab-content" id="nav-tabContent">
            <div className="tab-pane fade show active" id="nav-epic" role="tabpanel" aria-labelledby="nav-epic-tab">
              <Table dataSource={dataSource} columns={columns} />;
            </div>
            {processList?.map(process => {
              return <div className="tab-pane fade" id={`nav-epic-${process._id.toString()}`} role="tabpanel" aria-labelledby={`nav-epic-${process._id.toString()}-tab`}>
                <Table dataSource={dataSource} columns={columns} />;
              </div>
            })}
          </div>
        </div>

      </div>
    </div>
  )
}
