import { Avatar, Button, Input, Select, Table, Tag } from 'antd'
import Search from 'antd/es/input/Search'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { issueTypeWithoutOptions, iTagForIssueTypes } from '../../../util/CommonFeatures'
import { createIssue, getIssuesBacklog } from '../../../redux/actions/IssueAction'
import { useParams } from 'react-router-dom'
import dayjs from 'dayjs'
import { GetProcessListAction } from '../../../redux/actions/ListProjectAction'

export default function IssuesList() {
  const listProject = useSelector(state => state.listProject.listProject)
  const issuesBacklog = useSelector(state => state.issue.issuesBacklog)
  const processList = useSelector(state => state.listProject.processList)
  const userInfo = useSelector(state => state.user.userInfo)
  const dispatch = useDispatch()
  const { id } = useParams()
  const [openCreatingBacklog, setOpenCreatingBacklog] = useState(false)
  const [issueStatus, setIssueStatus] = useState(0)
  const [summaryValue, setSummaryValue] = useState('')
  useEffect(() => {
    dispatch(getIssuesBacklog(id))
    dispatch(GetProcessListAction(id))
    console.log("Lap vo tan trong list");
  }, [])
  const columns = [
    {
      title: '# Type',
      width: 100,
      dataIndex: 'issue_status',
      key: 'issue_status',
      fixed: 'center',
      render: (text, record, index) => {
        return iTagForIssueTypes(record.issue_status)
      }
    },
    {
      title: "Summary",
      width: 250,
      dataIndex: 'summary',
      key: 'summary',
      fixed: 'left',
      sorter: true,
    },
    {
      title: 'Status',
      dataIndex: 'issue_type',
      key: 'issue_type',
      render: (text, record, index) => {
        return record.name_process
      }
    },
    {
      title: 'Assignee',
      dataIndex: 'assignees',
      key: 'assignees',
    },
    {
      title: 'Due date',
      dataIndex: 'due_date',
      key: 'due_date',
    },
    {
      title: 'Labels',
      dataIndex: 'label',
      key: 'label',
    },
    {
      title: 'Created',
      dataIndex: 'createAt',
      key: 'createAt',
      render: (text, record, index) => {
        return <Tag color="#87d068">{dayjs(record.createAt).format("DD/MM/YYYY")}</Tag>
      }
    },
    {
      title: 'Updated',
      dataIndex: 'updateAt',
      key: 'updateAt',
      render: (text, record, index) => {
        return <Tag color="#2db7f5">{dayjs(record.updateAt).format("DD/MM/YYYY")}</Tag>
      }
    },
    {
      title: 'Reporter',
      dataIndex: 'creator',
      key: 'creator',
      render: (text, record, index) => {
        return <span><Avatar src={record.creator.avatar} className='mr-2' />{record.creator.username}</span>
      }
    },
    {
      title: 'Epic',
      dataIndex: 'epic',
      key: 'epic',
      width: '15%',
      render: (text, record, index) => {
        return record.epic_link !== null ? <Tag color={record.epic_link?.tag_color}>{record.epic_link?.epic_name}</Tag> : null
      }
    },
    {
      title: 'Parent',
      dataIndex: 'parent',
      key: 'parent'
    }
  ];
  return (
    <div>
      <p>Projects / long le project</p>
      <div className='d-flex justify-content-between'>
        <h4>List</h4>
        <span className='btn btn-transparent'><i className="fa-duotone fa-solid fa-comments"></i> Give feedback</span>
      </div>
      <div className='d-flex align-items-center'>
        <Search
          placeholder="Search List"
          style={{
            width: 200
          }}
        />
        <div className='issues-members-list ml-3'>
          {listProject?.members?.map(user => <Avatar size={40} src={user.avatar} />)}
          <Avatar size={40}><i className="fa-solid fa-user-plus"></i></Avatar>
        </div>
      </div>
      <div className='issues-info'>
        <Table
          style={{ padding: '5px 15px' }}
          columns={columns}
          dataSource={issuesBacklog}
          bordered
          scroll={{
            x: 1300,
          }}
          footer={() => {
            return !openCreatingBacklog ? <button className='btn btn-transparent btn-create-issue' style={{ fontSize: '14px', color: '#ddd' }} onClick={() => {
              setOpenCreatingBacklog(true)
            }}>
              <i className="fa-regular fa-plus mr-2"></i>
              Create issue
            </button> : <div className='d-flex'>
              <Select style={{ border: 'none', borderRadius: 0 }}
                defaultValue={issueTypeWithoutOptions[0].value}
                onChange={(value, option) => {
                  setIssueStatus(value)
                }}
                options={issueTypeWithoutOptions}
              />
              <Input placeholder="What need to be done?" onChange={(e) => {
                setSummaryValue(e.target.value)
              }} style={{ border: 'none', borderRadius: 0 }} />
              <Button type="primary" onClick={() => {
                dispatch(createIssue({
                  project_id: id,
                  issue_status: issueStatus,
                  summary: summaryValue,
                  creator: userInfo.id,
                  issue_type: processList.length === 0 ? null : processList[0]._id,
                  current_sprint: null
                }, issuesBacklog, null, null, userInfo.id))
                //set default is 0 which means story
                setIssueStatus(0)
                setSummaryValue('')
              }}>Save</Button>
              <Button type="danger" onClick={() => {
                setOpenCreatingBacklog(false)
                setSummaryValue('')
              }}>Cancel</Button>
            </div>
          }}
        />
      </div>
    </div>
  )
}
