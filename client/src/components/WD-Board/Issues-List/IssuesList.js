import { Avatar, Breadcrumb, Button, Form, Input, Select, Space, Table, Tag } from 'antd'
import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { issueTypeWithoutOptions, iTagForIssueTypes, iTagForPriorities, renderAssignees, renderEpicList, renderIssueType, renderSprintList, renderVersionList } from '../../../util/CommonFeatures'
import { createIssue, getIssuesBacklog, updateInfoIssue } from '../../../redux/actions/IssueAction'
import { useParams } from 'react-router-dom'
import dayjs from 'dayjs'
import './IssuesList.css'
import { GetProcessListAction, GetProjectAction, GetSprintListAction } from '../../../redux/actions/ListProjectAction'
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
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
} from '@dnd-kit/sortable';
import { getEpicList, getVersionList } from '../../../redux/actions/CategoryAction'
import { showNotificationWithIcon } from '../../../util/NotificationUtil'
import { calculateTimeAfterSplitted, convertMinuteToFormat, validateOriginalTime } from '../../../validations/TimeValidation'
import MemberProject from '../../../child-components/Member-Project/MemberProject'




export default function IssuesList() {
  const listProject = useSelector(state => state.listProject.listProject)
  const issuesBacklog = useSelector(state => state.issue.issuesBacklog)
  const projectInfo = useSelector(state => state.listProject.projectInfo)
  const epicList = useSelector(state => state.categories.epicList)
  const versionList = useSelector(state => state.categories.versionList)
  const sprintList = useSelector(state => state.listProject.sprintList)
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
    dispatch(GetProjectAction(id, null, null))
    dispatch(getEpicList(id))
    dispatch(getVersionList(id))
    dispatch(GetSprintListAction(id))
  }, [])
  const EditableContext = React.createContext(null);
  const EditableRow = ({ index, ...props }) => {
    const [form] = Form.useForm();
    return (
      <Form form={form} component={false}>
        <EditableContext.Provider value={form}>
          <tr {...props} />
        </EditableContext.Provider>
      </Form>
    );
  };
  const EditableCell = ({
    title,
    editable,
    children,
    dataIndex,
    record,
    ...restProps
  }) => {
    const [editing, setEditing] = useState(false);
    const ref = useRef(null);
    const form = useContext(EditableContext);
    useEffect(() => {
      if (editing) {
        ref.current?.focus();
      }
    }, [editing]);
    const toggleEdit = () => {
      setEditing(!editing);
      form.setFieldsValue({
        [dataIndex]: record[dataIndex],
      });
    };
    const save = async (record) => {
      try {
        const values = await form.validateFields();
        if (values?.timeOriginalEstimate) {
          if (validateOriginalTime(values.timeOriginalEstimate)) {
            const oldValue = calculateTimeAfterSplitted(record.timeOriginalEstimate ? record.timeOriginalEstimate : 0)
            const newValue = calculateTimeAfterSplitted(values.timeOriginalEstimate)

            dispatch(updateInfoIssue(record?._id, projectInfo?._id, { timeOriginalEstimate: newValue }, oldValue, newValue, userInfo.id, "updated", "time original estimate"))
            showNotificationWithIcon('success', '', "Truong du lieu hop le")
          } else {
            showNotificationWithIcon('error', '', "Truong du lieu nhap vao khong hop le")
          }
        }

        toggleEdit();

      } catch (errInfo) {
        console.log('save failed:', errInfo);
      }
    };
    let childNode = children;
    if (editable) {
      childNode = editing ? (
        <Form.Item
          style={{
            margin: 0,
          }}
          name={dataIndex}
        // rules={[
        //   {
        //     required: true,
        //     message: `${title} is required.`,
        //   },
        // ]}
        >
          {record.isCompleted === false ? renderEditingCellsInRow(ref, dataIndex, save, record) : setEditing(false)}
        </Form.Item>
      ) : (
        <div
          className="editable-cell-value-wrap"
          style={{
            paddingInlineEnd: 24,
          }}
          onClick={toggleEdit}
        >
          {children}
        </div>
      );
    }
    return <td {...restProps}>{childNode}</td>;
  };

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
  const components = {
    header: {
      cell: TableHeaderCell,
    },
    body: {
      row: EditableRow,
      cell: (EditableCell),
    },
  }
  const renderEditingCellsInRow = (ref, dataIndex, save, record) => {
    if (dataIndex === 'summary') {
      return <Input ref={ref} onPressEnter={() => {
        save(record)
      }} onBlur={() => {
        save(record)
      }} />
    } else if (dataIndex === 'issue_status') {
      return <Select ref={ref} onPressEnter={() => {
        save(record)
      }} onBlur={() => {
        save(record)
      }} options={issueTypeWithoutOptions} onSelect={(value) => value} />
    } else if (dataIndex === 'issue_type') {
      const renderOptions = renderIssueType(processList, id)
      return <Select ref={ref} onPressEnter={() => {
        save(record)
      }} onBlur={() => {
        save(record)
      }} options={renderOptions.filter(option => option.value !== record.issue_type._id)} onSelect={(value) => value} />
    } else if (dataIndex === 'assignees') {
      return <Select ref={ref} onPressEnter={() => {
        save(record)
      }} onBlur={() => {
        save(record)
      }} options={renderAssignees(listProject, id, userInfo)} onSelect={(value) => value} optionRender={(option) => {
        return <Space>
          <div>
            {option.data.desc}
          </div>
        </Space>
      }} />
    } else if (dataIndex === 'current_sprint') {
      return <Select ref={ref} onPressEnter={() => {
        save(record)
      }} onBlur={() => {
        save(record)
      }} options={renderSprintList(sprintList, id)} onSelect={(value) => value} />
    } else if (dataIndex === 'timeOriginalEstimate') {
      return <Input ref={ref} defaultValue={''} onPressEnter={() => {
        save(record)
      }} onBlur={() => {
        save(record)
      }} />
    } else if (dataIndex === 'epic_link') {
      const renderOptions = renderEpicList(epicList, id)
      return <Select ref={ref} onPressEnter={() => {
        save(record)
      }} onBlur={() => {
        save(record)
      }} options={renderOptions.filter(option => option.value !== record.epic_link?._id)} onSelect={(value) => value} />
    }
    else if (dataIndex === 'fix_version') {
      const renderOptions = renderVersionList(versionList, id)
      return <Select ref={ref} onPressEnter={() => {
        save(record)
      }} onBlur={() => {
        save(record)
      }} options={renderOptions.filter(option => option.value !== record.fix_version?._id)} onSelect={(value) => value} />
    }
  }
  const renderValueColumns = (text, record, index, key) => {
    if (key === 'issue_status') {
      return iTagForIssueTypes(record?.issue_status)
    }
    else if (key === 'summary') {
      return <span>{record?.summary}</span>
    }
    else if (key === 'issue_type') {
      return <Tag color={record.issue_type?.tag_color}>{record.issue_type?.name_process}</Tag>
    }
    else if (key === 'issue_priority') {
      return iTagForPriorities(record.issue_priority)
    }
    else if (key === 'assignees') {
      return <span className='d-flex align-items-center'><Avatar icon={<UserOutlined />} size={30} /> <span className='ml-2'>Unassignee</span></span>
    }
    else if (key === 'creator') {
      return <span><Avatar src={record.creator?.avatar} className='mr-2' />{record.creator?.username}</span>
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
      if (record.parent) {
        return <div className='d-flex align-items-center'>
          <span className='mr-1'>{iTagForIssueTypes(record.parent?.issue_status, null, null)}</span>
          <span className='mr-1'>WD-{record.parent?.ordinal_number}</span>
          <span>{record.parent?.summary}</span>
        </div>
      }
      return null
    }
    else if (key === 'fix_version') {
      if (record.fix_version === null) return <></>
      return <Tag color={record.fix_version?.tag_color}>{record.fix_version?.version_name}</Tag>
    }
    else if (key === 'timeOriginalEstimate') {
      if (record.timeOriginalEstimate !== 0) {
        return <span>{convertMinuteToFormat(record.timeOriginalEstimate)}</span>
      } else {
        return <span>None</span>
      }
    }
    else if (key === 'timeSpent') {
      return <span>{record.timeSpent}</span>
    }
    else if (key === 'timeRemaining') {
      return <span>{record.timeRemaining}</span>
    }
    else if (key === 'current_sprint') {
      return <Tag>{record.current_sprint?.sprint_name}</Tag>
    }
    else if (key === 'old_sprint') {
      return <div className='d-flex'>
        {record.old_sprint?.filter((sprint, index) => record.old_sprint.map(sprint => sprint._id).indexOf(sprint._id) === index).map((sprint) => {
          return <Tag key={sprint._id}>{sprint.sprint_name}</Tag>
        })}
      </div>
    }
    else if (key === 'story_point') {
      return <span>{record.story_point}</span>
    }
  }

  const renderColumns = () => {
    const data = projectInfo?.table_issues_list?.filter(col => col.isShowed).map(col => {
      var allowEdit = false
      if (["issue_type", "issue_priority", "summary", "issue_status", "assignees", "current_sprint", "epic_link", "fix_version", "story_point", "timeOriginalEstimate", "timeRemaining"].includes(col.key)) {
        allowEdit = true
      }
      return {
        title: col.title,
        dataIndex: col.key,
        key: col.key,
        editable: allowEdit,
        index: col.til_index,
        width: 150,
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
        render: (text, record, index) => {
          return renderValueColumns(text, record, index, col.key)
        }
      }
    }).sort((a, b) => a.index - b.index)


    if (data?.length !== 0) {
      return data?.map((column) => ({
        ...column,
        key: `${column.index}`,
        onHeaderCell: () => ({
          id: `${column.index}`,
        }),
        onCell: (record) => ({
          id: `${column.index}`,
          editable: column.editable,
          dataIndex: column.dataIndex,
          title: column.title,
          record
        })
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

  const renderDataSource = () => {
    return issuesBacklog?.filter(issue => issue.issue_status !== 4).map(issue => {
      if (issue.sub_issue_list.length === 0) {
        return {
          key: issue._id,
          ...issue
        }
      } else {
        return {
          key: issue._id,
          children: issue.sub_issue_list.map(subIssue => ({ ...subIssue })),
          ...issue
        }
      }
    })
  }

  return (
    <div style={{ margin: '0 20px' }}>
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
      <div className='d-flex justify-content-between'>
        <h4>List</h4>
        <span className='btn btn-light' style={{ fontSize: 13 }}><i className="fa-duotone fa-solid fa-comments"></i> Give feedback</span>
      </div>
      <div className='d-flex align-items-center mb-4'>
        <MemberProject projectInfo={projectInfo} id={id} userInfo={userInfo} />
      </div>
      <div className='issues-info' style={{ height: '70vh', overflowY: 'auto', scrollbarWidth: 'none' }}>
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
                  dataSource={renderDataSource()}
                  bordered
                  size='middle'
                  style={{ width: '100%' }}
                  scroll={{
                    x: 'max-content',
                    y: 380
                  }}
                  components={components}
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
                            }, id, userInfo.id, null))
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
