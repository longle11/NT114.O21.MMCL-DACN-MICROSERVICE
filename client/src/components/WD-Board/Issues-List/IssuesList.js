import { Avatar, Breadcrumb, Button, Input, Select, Table, Tag } from 'antd'
import Search from 'antd/es/input/Search'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { issueTypeWithoutOptions, iTagForIssueTypes, iTagForPriorities } from '../../../util/CommonFeatures'
import { createIssue, getIssuesBacklog } from '../../../redux/actions/IssueAction'
import { useParams } from 'react-router-dom'
import dayjs from 'dayjs'
import './IssuesList.css'
import { GetProcessListAction, GetProjectAction } from '../../../redux/actions/ListProjectAction'
import { UserOutlined } from '@ant-design/icons';
import { updateProjectAction } from '../../../redux/actions/CreateProjectAction'
import {
  closestCenter,
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers';
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
} from '@dnd-kit/sortable';


const DragIndexContext = createContext({
  active: -1,
  over: -1,
});
const dragActiveStyle = (dragState, id) => {
  const { active, over, direction } = dragState;
  // drag active style
  let style = {};
  if (active && active === id) {
    style = {
      backgroundColor: 'gray',
      opacity: 0.5,
    };
  }
  // dragover dashed style
  else if (over && id === over && active !== over) {
    style =
      direction === 'right'
        ? {
          borderRight: '1px dashed gray',
        }
        : {
          borderLeft: '1px dashed gray',
        };
  }
  return style;
};
const TableBodyCell = (props) => {
  const dragState = useContext(DragIndexContext);
  return (
    <td
      {...props}
      style={{
        ...props.style,
        ...dragActiveStyle(dragState, props.id),
      }}
    />
  );
};
const TableHeaderCell = (props) => {
  const dragState = useContext(DragIndexContext);
  const { attributes, listeners, setNodeRef, isDragging } = useSortable({
    id: props.id,
  });
  const style = {
    ...props.style,
    cursor: 'move',
    ...(isDragging
      ? {
        position: 'relative',
        zIndex: 9999,
        userSelect: 'none',
      }
      : {}),
    ...dragActiveStyle(dragState, props.id),
  };
  return <th {...props} ref={setNodeRef} style={style} {...attributes} {...listeners} />;
};

export default function IssuesList() {
  const listProject = useSelector(state => state.listProject.listProject)
  const issuesBacklog = useSelector(state => state.issue.issuesBacklog)
  const processList = useSelector(state => state.listProject.processList)
  const projectInfo = useSelector(state => state.listProject.projectInfo)
  const userInfo = useSelector(state => state.user.userInfo)
  const dispatch = useDispatch()
  const { id } = useParams()
  const [openCreatingBacklog, setOpenCreatingBacklog] = useState(false)
  const [issueStatus, setIssueStatus] = useState(0)
  const [summaryValue, setSummaryValue] = useState('')
  useEffect(() => {
    dispatch(getIssuesBacklog(id))
    dispatch(GetProcessListAction(id))
    dispatch(GetProjectAction(id, null, null))
  }, [])

  const renderValueColumns = (text, record, index, key) => {
    if (key === 'issue_status') {
      return iTagForIssueTypes(record?.issue_status)
    } 
    else if (key === 'summary') {
      return <span>{record?.summary}</span>
    } 
    else if (key === 'issue_type') {
      return <Tag color={record.issue_type.tag_color}>{record.issue_type.name_process}</Tag>
    } 
    else if (key === 'issue_priority') {
      return iTagForPriorities(record.issue_priority)
    } 
    else if (key === 'assignees') {
      return <span><Avatar icon={<UserOutlined />} style={{ backgroundColor: 'red' }} size={30} /> <span className='ml-2'>Unassignee</span></span>
    } 
    else if (key === 'creator') {
      return <span><Avatar src={record.creator.avatar} className='mr-2' />{record.creator.username}</span>
    } 
    else if (key === 'createAt') {
      return <Tag color="#87d068">{dayjs(record.createAt).format("DD/MM/YYYY")}</Tag>
    } 
    else if (key === 'updateAt') {
      return <Tag color="#2db7f5">{dayjs(record.updateAt).format("DD/MM/YYYY")}</Tag>
    } 
    else if (key === 'epic_link') {
      return record.epic_link !== null ? <Tag color={record.epic_link?.tag_color}>{record.epic_link?.epic_name}</Tag> : null
    } 
    else if (key === 'parent') {
      return null
    } 
    else if(key === 'fix_version') {
      return <Tag color={record.fix_version.tag_color}>{record.fix_version.epic_name}</Tag>
    }
    else if(key === 'timeOriginalEstimate') {
      return <span>{record.timeOriginalEstimate}</span>
    }
    else if(key === 'timeSpent') {
      return <span>{record.timeSpent}</span>
    }
    else if(key === 'timeRemaining') {
      return <span>{record.timeRemaining}</span>
    }
    else if(key === 'current_sprint') {
      return <span>{record.current_sprint.sprint_name}</span>
    }
    else if(key === 'story_point') {
      return <span>{record.story_point}</span>
    }
  }

  const renderColumns = () => {
    const data = projectInfo?.table_issues_list?.filter(col => col.isShowed).sort((a, b) => a.index - b.index).map(col => {
      return {
        title: col.title,
        dataIndex: col.key,
        key: col.key,
        index: col.til_index,
        filters: [
          {
            text: 'Sort A -> Z',
            value: 0
          },
          {
            text: 'Sort Z -> A',
            value: 1
          },
          {
            text: 'Hide field',
            value: 3
          }
        ],
        width: 'fit-content',
        render: (text, record, index) => {
          return renderValueColumns(text, record, index, col.key)
        }
      }
    })
    
    if (data?.length !== 0) {
      return data?.map((column) => ({
        ...column,
        key: `${column.index}`,
        onHeaderCell: () => ({
          id: `${column.index}`,
        }),
        onCell: () => ({
          id: `${column.index}`,
        }),
      }))
    }
    return null
  }


  const [dragIndex, setDragIndex] = useState({
    active: -1,
    over: -1,
  });


  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 1,
      },
    }),
  );

  const onDragEnd = ({ active, over }) => {
    if (active.id !== over?.id) {
      const getIndexColFrom = renderColumns().findIndex((i) => i.key === active?.id)
      const getIndexColTo = renderColumns().findIndex((i) => i.key === over?.id)

      const getColFrom = renderColumns()[getIndexColFrom]
      const getColTo = renderColumns()[getIndexColTo]

      dispatch(updateProjectAction(id, { table_col_key_from: getColFrom.index, table_col_key_to: getColTo.index }, null))
    }
    setDragIndex({
      active: -1,
      over: -1,
    });
  };

  const onDragOver = ({ active, over }) => {
    const activeIndex = renderColumns()?.findIndex((i) => i.key === active.id);
    const overIndex = renderColumns()?.findIndex((i) => i.key === over?.id);
    setDragIndex({
      active: active.id,
      over: over?.id,
      direction: overIndex > activeIndex ? 'right' : 'left',
    });
  };

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
      <div className='issues-info' style={{ height: '75vh', overflowY: 'auto', scrollbarWidth: 'none' }}>
        {(renderColumns() !== null || renderColumns() !== undefined) && renderColumns()?.length > 0 ? <div className='d-flex'>
          <DndContext
            sensors={sensors}
            modifiers={[restrictToHorizontalAxis]}
            onDragEnd={onDragEnd}
            onDragOver={onDragOver}
            collisionDetection={closestCenter}
          >
            <SortableContext items={renderColumns()?.map((i) => i.key)} strategy={horizontalListSortingStrategy}>
              <DragIndexContext.Provider value={dragIndex}>
                <Table
                  columns={renderColumns()}
                  dataSource={issuesBacklog}
                  bordered
                  size='middle'
                  style={{ width: '93%' }}
                  scroll={{
                    x: 'max-content'
                  }}
                  components={{
                    header: {
                      cell: TableHeaderCell,
                    },
                    body: {
                      cell: TableBodyCell,
                    },
                  }}
                  rowKey="key"
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
                          if (e.target.value.trim() !== "") {
                            setSummaryValue(e.target.value)
                          }
                        }}
                        value={summaryValue}
                        defaultValue=""
                        onBlur={() => {
                          setOpenCreatingBacklog(false)
                          setSummaryValue('')
                        }}
                        style={{ border: 'none', borderRadius: 0 }}
                        onKeyUp={((e) => {
                          if (e.key === "Enter") {
                            const tempSummary = summaryValue
                            setIssueStatus(0)
                            setSummaryValue('')
                            dispatch(createIssue({
                              project_id: id,
                              issue_status: issueStatus,
                              summary: tempSummary,
                              creator: userInfo.id,
                              issue_type: processList.length === 0 ? null : processList[0]._id,
                              current_sprint: null
                            }, issuesBacklog, null, null, userInfo.id))
                            //set default is 0 which means story
                          }
                        })} />
                    </div>
                  }}
                />
              </DragIndexContext.Provider>
            </SortableContext>
            <DragOverlay>
              {
                renderColumns() !== undefined || renderColumns() !== null ? <th
                  style={{
                    backgroundColor: 'gray',
                    padding: 16,
                  }}
                >
                  {renderColumns() !== undefined ? renderColumns()[renderColumns()?.findIndex((i) => i.key === dragIndex.active)]?.title : null}
                </th> : <></>
              }
            </DragOverlay>
          </DndContext>
          <div className="dropdown" style={{ width: '7%' }}>
            <Button className='ml-1' type="primary" id="dropdownMenuTable" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><i className="fa fa-plus"></i></Button>
            <div className="dropdown-menu" aria-labelledby="dropdownMenuTable" style={{ height: 300, overflowY: 'auto', scrollbarWidth: 'none' }}>
              {projectInfo?.table_issues_list?.map(col => {
                return <button className="dropdown-item d-flex justify-content-between" type="button" onClick={() => {
                  dispatch(updateProjectAction(id, { table_col_key: col.key, isShowed: !col.isShowed }, null))
                }}>
                  <span style={{ marginRight: 20, fontSize: 15 }}>{col.title}</span>
                  {
                    col.isShowed ? <span>
                      <i className="fa fa-check" style={{ color: '#0D7C66' }}></i>
                    </span> : <></>
                  }
                </button>
              })}
            </div>
          </div>
        </div> : <div></div>}
      </div>
    </div>
  )
}
