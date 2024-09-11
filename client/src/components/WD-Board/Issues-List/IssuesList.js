import { Avatar, Breadcrumb, Button, Form, Input, Select, Space, Table, Tag } from 'antd'
import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { issueTypeOptions, issueTypeWithoutOptions, iTagForIssueTypes, priorityTypeOptions, renderAssignees, renderEpicList, renderIssueType, renderSprintList, renderVersionList } from '../../../util/CommonFeatures'
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
  const summaryValue = useRef('')
  const addSubSummaryIssue = useRef('')
  const [searchIssue, setSearchIssue] = useState({
    versions: [],
    epics: []
  })

  const handleSearchIssue = (versions, epics) => {
    setSearchIssue({ ...searchIssue, versions: versions, epics: epics })
  }
  useEffect(() => {
    dispatch(getIssuesBacklog(id, null))
    dispatch(GetProcessListAction(id))
    dispatch(GetProjectAction(id, null, null))
    dispatch(getEpicList(id))
    dispatch(getVersionList(id))
    dispatch(GetSprintListAction(id))
  }, [])

  useEffect(() => {
    dispatch(getIssuesBacklog(id, {
      epics: searchIssue.epics,
      versions: searchIssue.versions
    }))
  }, [searchIssue])
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
    const style = { marginLeft: record?.parent && record?.issue_status === 4 ? 30 : 0 }
    if (key === 'issue_status') {
      return <div style={style}>{iTagForIssueTypes(record?.issue_status)}</div>
    }
    else if (key === 'summary') {
      return <span style={style}>{record?.summary}</span>
    }
    else if (key === 'issue_type') {
      return <Tag style={style} color={record.issue_type?.tag_color}>{record.issue_type?.name_process}</Tag>
    }
    else if (key === 'issue_priority') {
      return <span style={style}>{priorityTypeOptions[record.issue_priority]?.label}</span>
    }
    else if (key === 'assignees') {
      return <span style={style} className='d-flex align-items-center'><Avatar icon={<UserOutlined />} size={30} /> <span className='ml-2'>Unassignee</span></span>
    }
    else if (key === 'creator') {
      return <span style={style}><Avatar src={record.creator?.avatar} className='mr-2' />{record.creator?.username}</span>
    }
    else if (key === 'createAt') {
      return <Tag style={style} color="#87d068">{dayjs(record.createAt).format("DD/MM/YYYY")}</Tag>
    }
    else if (key === 'updateAt') {
      return <Tag style={style} color="#2db7f5">{dayjs(record.updateAt).format("DD/MM/YYYY")}</Tag>
    }
    else if (key === 'epic_link') {
      return record.epic_link !== null ? <Tag style={style} color={record.epic_link?.tag_color}>{record.epic_link?.epic_name}</Tag> : null
    }
    else if (key === 'parent') {
      if (record.parent) {
        return <div style={style} className='d-flex align-items-center'>
          <span className='mr-1'>{iTagForIssueTypes(record.parent?.issue_status, null, null)}</span>
          <span className='mr-1'>WD-{record.parent?.ordinal_number}</span>
        </div>
      }
      return null
    }
    else if (key === 'fix_version') {
      if (record.fix_version === null) return <></>
      return <Tag style={style} color={record.fix_version?.tag_color}>{record.fix_version?.version_name}</Tag>
    }
    else if (key === 'timeOriginalEstimate') {
      if (record.timeOriginalEstimate !== 0) {
        return <span style={style}>{convertMinuteToFormat(record.timeOriginalEstimate)}</span>
      } else {
        return <span>None</span>
      }
    }
    else if (key === 'timeSpent') {
      return <span style={style}>{record.timeSpent ? convertMinuteToFormat(record.timeSpent) : "None"}</span>
    }
    else if (key === 'timeRemaining') {
      return <span style={style}>{Number.isInteger(record?.timeSpent) && Number.isInteger(record.timeOriginalEstimate) ? convertMinuteToFormat(record.timeOriginalEstimate - record?.timeSpent) : "None"}</span>
    }
    else if (key === 'current_sprint') {
      if (record?.current_sprint) {
        return <Tag style={style}>{record.current_sprint?.sprint_name}</Tag>
      }
      return null
    }
    else if (key === 'old_sprint') {
      return <div className='d-flex'>
        {record.old_sprint?.filter((sprint, index) => record.old_sprint.map(sprint => sprint._id).indexOf(sprint._id) === index).map((sprint) => {
          return <Tag style={style} key={sprint._id}>{sprint.sprint_name}</Tag>
        })}
      </div>
    }
    else if (key === 'story_point') {
      return <span style={style}>{record.story_point}</span>
    }
  }

  const renderColumns = () => {
    const data = projectInfo?.table_issues_list?.filter(col => col.isShowed).map(col => {
      var align = "left"
      var allowEdit = false
      if (["issue_type", "issue_priority", "summary", "issue_status", "assignees", "current_sprint", "epic_link", "fix_version", "story_point", "timeOriginalEstimate", "timeRemaining"].includes(col.key)) {
        allowEdit = true
      }

      var setWidth = 200
      if (["summary", "assignees", "issue_type", "creator"].includes(col.key)) {
        setWidth = 'max-content'
      }
      if (["issue_status", "issue_priority", "story_point"].includes(col.key)) {
        setWidth = 100
      }

      if (["issue_status", "issue_priority", "story_point", "fix_version", "epic_link", "createAt", "updateAt"].includes(col.key)) {
        align = "center"
      }
      return {
        title: col.title,
        dataIndex: col.key,
        key: col.key,
        editable: allowEdit,
        index: col.til_index,
        width: setWidth,
        align: align,
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
      const newData = data?.map((column) => ({
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
      newData?.splice(0, 0, Table.EXPAND_COLUMN)
      return newData
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
        <MemberProject typeInterface="issue list" projectInfo={projectInfo} id={id} userInfo={userInfo} allIssues={issuesBacklog} epicList={epicList} versionList={versionList} handleSearchIssue={handleSearchIssue} searchIssue={searchIssue} />
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
                  className='table-issue-list'
                  size='middle'
                  style={{ width: '100%' }}
                  scroll={{
                    x: 'max-content',
                    y: 450
                  }}
                  components={components}
                  rowKey="key"
                  expandable={{
                    expandedRowRender: (record) => (
                      <div style={{ width: '80%', backgroundColor: '#ffff', padding: '5px 20px', border: '2px solid #4BADE8' }}>
                        <div style={{ width: '100%' }} className='d-flex justify-content-between'>
                          <div className='d-flex align-items-center' style={{ marginLeft: 100, width: '100%' }}>
                            <span>{iTagForIssueTypes(0, 'ml-1w99999--', 16)}</span>
                            <Input onChange={(e) => {
                              addSubSummaryIssue.current = e.target.value
                              console.log('addSubSummaryIssue.current ', addSubSummaryIssue.current);
                            }} className='edit-input-issue-list' style={{ border: 'none', borderRadius: 0, width: '100%' }} placeholder='What needs to be done?' />
                          </div>
                          <div className='d-flex align-items-center'>
                            <Select className='mr-2' defaultValue={issueTypeOptions[4]?.value} options={issueTypeOptions} disabled />
                            <Button type='primary' onClick={() => {
                              if (addSubSummaryIssue.current?.trim() !== "") {
                                dispatch(createIssue({ summary: addSubSummaryIssue.current, creator: userInfo.id, issue_status: 4, issue_priority: 2, issue_type: processList[0]._id, parent: record?._id, project_id: id }, id, userInfo.id, record?.current_sprint?._id, record?._id))
                              } else {
                                showNotificationWithIcon('error', '', 'Summary can\'t not left blank')
                              }
                              addSubSummaryIssue.current = ""
                            }}><span style={{ color: "#dddd", fontWeight: 600 }}>Create <i style={{ transform: 'rotate(180deg)' }} className="fa-solid fa-share-from-square"></i></span></Button>
                          </div>
                        </div>
                      </div>
                    ),
                    rowExpandable: (record) => !record.parent && record.issue_status !== 4,
                  }}
                  footer={() => {
                    return !openCreatingBacklog ? <button className='btn btn-transparent btn-create-issue' style={{ fontSize: '14px', color: '#ddd' }} onClick={() => {
                      setOpenCreatingBacklog(true)
                    }}>
                      <i className="fa-regular fa-plus mr-2"></i>
                      Create issue
                    </button> : <div className='d-flex' style={{ border: '2px solid #4BADE8' }}>
                      <Select style={{ border: 'none', borderRadius: 0 }}
                        defaultValue={issueTypeWithoutOptions[0].value}
                        onChange={(value, option) => {
                          setIssueStatus(value)
                        }}
                        className='edit-select-issue-list'
                        options={issueTypeWithoutOptions.filter(status => [0, 1, 2].includes(parseInt(status.value)))}
                      />
                      <Input
                        placeholder="What need to be done?"
                        onChange={(e) => {
                          summaryValue.current = e.target.value
                        }}
                        defaultValue={summaryValue.current}
                        onBlur={() => {
                          setOpenCreatingBacklog(false)
                          summaryValue.current = ""
                        }}
                        className='edit-input-issue-list'
                        style={{ border: 'none', borderRadius: 0 }}
                        onKeyUp={((e) => {
                          if (e.key === "Enter") {
                            if (summaryValue.current.trim() !== "") {
                              dispatch(createIssue({
                                project_id: id,
                                issue_status: issueStatus,
                                summary: summaryValue.current,
                                creator: userInfo.id,
                                issue_type: processList.length === 0 ? null : processList[0]._id,
                                current_sprint: null
                              }, id, userInfo.id, null))
                              //set default is 0 which means story
                            }
                            setIssueStatus(0)
                            summaryValue.current = ""
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
