import { Avatar, Breadcrumb, Button, Input, Select, Table, Tag } from 'antd'
import Search from 'antd/es/input/Search'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { issueTypeWithoutOptions, iTagForIssueTypes } from '../../../util/CommonFeatures'
import { createIssue, getIssuesBacklog } from '../../../redux/actions/IssueAction'
import { useParams } from 'react-router-dom'
import dayjs from 'dayjs'
import './IssuesList.css'
import { GetProcessListAction } from '../../../redux/actions/ListProjectAction'
import { UserOutlined } from '@ant-design/icons';
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
      dataIndex: 'issue_status',
      key: 'issue_status',
      width: 'fit-content',
      fixed: 'center',
      render: (text, record, index) => {
        return iTagForIssueTypes(record.issue_status)
      }
    },
    {
      title: "Summary",
      dataIndex: 'summary',
      key: 'summary',
      width: 'fit-content',
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
      width: '200px',
      key: 'assignees',
      render: (text, render) => {
        return <span><Avatar icon={<UserOutlined />} style={{ backgroundColor: 'red' }} size={30} /> <span className='ml-2'>Unassignee</span></span>
      }
    },
    {
      title: 'Due date',
      dataIndex: 'due_date',
      width: 'fit-content',
      key: 'due_date',
    },
    {
      title: 'Labels',
      dataIndex: 'label',
      width: 'fit-content',
      key: 'label',
    },
    {
      title: 'Created',
      dataIndex: 'createAt',
      width: 'fit-content',
      key: 'createAt',
      render: (text, record, index) => {
        return <Tag color="#87d068">{dayjs(record.createAt).format("DD/MM/YYYY")}</Tag>
      }
    },
    {
      title: 'Updated',
      dataIndex: 'updateAt',
      key: 'updateAt',
      width: 'fit-content',
      render: (text, record, index) => {
        return <Tag color="#2db7f5">{dayjs(record.updateAt).format("DD/MM/YYYY")}</Tag>
      }
    },
    {
      title: 'Reporter',
      dataIndex: 'creator',
      width: 'fit-content',
      key: 'creator',
      render: (text, record, index) => {
        return <span><Avatar src={record.creator.avatar} className='mr-2' />{record.creator.username}</span>
      }
    },
    {
      title: 'Epic',
      dataIndex: 'epic',
      key: 'epic',
      width: 'fit-content',
      render: (text, record, index) => {
        return record.epic_link !== null ? <Tag color={record.epic_link?.tag_color}>{record.epic_link?.epic_name}</Tag> : null
      }
    },
    {
      title: 'Parent',
      width: 'fit-content',
      dataIndex: 'parent',
      key: 'parent'
    }

  ];
  return (
    <div style={{ margin: '0 20px' }}>
      <Breadcrumb
        style={{ marginBottom: 10 }}
        items={[
          {
            title: <a href="">Projects</a>,
          },
          {
            title: <a href="">Hidden</a>,
          }
        ]}
      />
      <div className='d-flex justify-content-between'>
        <h4>List</h4>
        <span className='btn btn-light' style={{ fontSize: 13 }}><i className="fa-duotone fa-solid fa-comments"></i> Give feedback</span>
      </div>
      <div className='d-flex align-items-center mb-4'>
        <Search
          placeholder="Search List"
          style={{
            width: 200
          }}
        />
        <div className='issues-members-list ml-3'>
          {listProject?.members?.map(user => <Avatar size={40} src={user.avatar} />)}
          <Avatar.Group>
            <Avatar icon={<UserOutlined />} style={{ backgroundColor: 'red' }} size={30} />
            <Avatar icon={<UserOutlined />} style={{ backgroundColor: 'blue' }} size={30} />
            <Avatar icon={<UserOutlined />} style={{ backgroundColor: 'green' }} size={30} />
            <Avatar icon={<UserOutlined />} style={{ backgroundColor: 'red' }} size={30} />
            <Avatar icon={<UserOutlined />} style={{ backgroundColor: 'purple' }} size={30} />
            <Avatar icon={<UserOutlined />} style={{ backgroundColor: 'black' }} size={30} />
            <Avatar icon={<UserOutlined />} style={{ backgroundColor: 'pink' }} size={30} />
            <Avatar size={30}><i className="fa-solid fa-user-plus" style={{ fontSize: 14, display: 'flex' }}></i></Avatar>
          </Avatar.Group>
        </div>
      </div>
      <div className='issues-info'>
        <Table
          columns={columns}
          dataSource={issuesBacklog}
          bordered
          size='middle'
          scroll={{
            x: 'max-content'
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
              <Input
                placeholder="What need to be done?"
                onChange={(e) => {
                  setSummaryValue(e.target.value)
                }}
                value={summaryValue}
                defaultValue=""
                onBlur={() => {
                  setOpenCreatingBacklog(false)
                  setSummaryValue('')
                }} style={{ border: 'none', borderRadius: 0 }} onKeyUp={((e) => {
                  if (e.key === "Enter") {
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
                  }
                })} />
            </div>
          }}
        />
      </div>
    </div>
  )
}
