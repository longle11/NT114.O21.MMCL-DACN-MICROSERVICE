import { Avatar, Breadcrumb, Button, DatePicker, Form, Input, InputNumber, Select, Space, Switch, Table, Tag } from 'antd'
import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { defaultForIssueType, issueTypeOptions, issueTypeWithoutOptions, iTagForIssueTypes, priorityTypeOptions, renderAssignees, renderEpicList, renderIssueType, renderSprintList, renderVersionList } from '../../../util/CommonFeatures'
import { createIssue, getIssuesInProject, updateInfoIssue } from '../../../redux/actions/IssueAction'
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
import { calculateTimeAfterSplitted, checkDeadlineIsComing, convertMinuteToFormat, convertTime, validateOriginalTime } from '../../../validations/TimeValidation'
import MemberProject from '../../../child-components/Member-Project/MemberProject'
import { getValueOfArrayFieldInIssue, getValueOfArrayObjectFieldInIssue, getValueOfNumberFieldInIssue, getValueOfObjectFieldInIssue, getValueOfStringFieldInIssue } from '../../../util/IssueFilter'
import { attributesFiltering } from '../../../util/IssueAttributesCreating'

export default function IssuesList() {
  const listProject = useSelector(state => state.listProject.listProject)
  const workflowList = useSelector(state => state.listProject.workflowList)
  const issuesInProject = useSelector(state => state.issue.issuesInProject)
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

  const setValueChanged = useRef(null)
  const [displaySetting, setDisplaySetting] = useState(false)

  const handleSearchIssue = (versions, epics) => {
    setSearchIssue({ ...searchIssue, versions: versions, epics: epics })
  }
  useEffect(() => {
    dispatch(getIssuesInProject(id, null))
    dispatch(GetProcessListAction(id))
    dispatch(GetProjectAction(id, null, null))
    dispatch(getEpicList(id))
    dispatch(getVersionList(id))
    dispatch(GetSprintListAction(id))
  }, [])

  useEffect(() => {
    dispatch(getIssuesInProject(id, {
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
        if (Object.keys(values).includes('epic_link')) {
          const getEpicIndex = epicList?.findIndex(epic => epic._id?.toString() === setValueChanged.current)
          if (getEpicIndex !== -1) {
            dispatch(updateInfoIssue(record?._id, record?.project_id?._id, { epic_link: setValueChanged.current }, getValueOfObjectFieldInIssue(record, "epic_link") ? getValueOfObjectFieldInIssue(record, "epic_link")?.epic_name : "None", epicList[getEpicIndex].epic_name, userInfo.id, "updated", "epic", projectInfo, userInfo))
          }
        }
        if (Object.keys(values).includes('current_sprint')) {
          const getSprintIndex = sprintList?.findIndex(sprint => sprint._id?.toString() === setValueChanged.current)
          if (getSprintIndex !== -1) {
            dispatch(updateInfoIssue(record?._id, record?.project_id?._id, { current_sprint: setValueChanged.current }, getValueOfObjectFieldInIssue(record, "current_sprint") ? getValueOfObjectFieldInIssue(record, "current_sprint")?.sprint_name : "None", sprintList[getSprintIndex].sprint_name, userInfo.id, "updated", "sprint", projectInfo, userInfo))
          }
        }
        if (Object.keys(values).includes('issue_priority')) {
          if (Number.isInteger(parseInt(setValueChanged.current))) {
            dispatch(updateInfoIssue(record?._id, record?.project_id?._id, { issue_priority: parseInt(setValueChanged.current) }, getValueOfNumberFieldInIssue(record, "issue_priority").toString(), setValueChanged.current, userInfo.id, "updated", "priority", projectInfo, userInfo))
          }
        }
        if (Object.keys(values).includes('fix_version')) {
          const fix_version = versionList?.findIndex(version => version._id?.toString() === setValueChanged.current)
          if (fix_version !== -1) {
            dispatch(updateInfoIssue(record?._id, record?.project_id?._id, { fix_version: setValueChanged.current }, getValueOfObjectFieldInIssue(record, "fix_version") ? getValueOfObjectFieldInIssue(record, "fix_version")?.version_name : "None", versionList[fix_version].version_name, userInfo.id, "updated", "version", projectInfo, userInfo))
          }
        }
        if (Object.keys(values).includes('issue_status')) {
          if (Number.isInteger(parseInt(setValueChanged.current))) {
            dispatch(updateInfoIssue(record?._id, record?.project_id?._id, { issue_status: parseInt(setValueChanged.current) }, getValueOfObjectFieldInIssue(record, "issue_status").toString(), parseInt(setValueChanged.current).toString(), userInfo.id, "updated", "issue status", projectInfo, userInfo))
          }
        }

        if (Object.keys(values).includes('issue_type')) {
          const getProcessIndex = processList?.findIndex(process => process._id?.toString() === setValueChanged.current)
          if (typeof setValueChanged.current === "string" && getProcessIndex !== -1) {
            dispatch(updateInfoIssue(record?._id, record?.project_id?._id, { issue_type: setValueChanged.current }, getValueOfObjectFieldInIssue(record, "issue_type").name_process, processList[getProcessIndex].name_process, userInfo.id, "updated", "issue type", projectInfo, userInfo))
          }
        }

        if (Object.keys(values).includes('start_date')) {
          if (typeof setValueChanged.current === "string") {

            dispatch(updateInfoIssue(record?._id, record?.project_id?._id, { start_date: setValueChanged.current }, convertTime(getValueOfStringFieldInIssue(record, "start_date"), true), convertTime(setValueChanged.current, true), userInfo.id, "updated", "start time", projectInfo, userInfo))
          }
        }

        if (Object.keys(values).includes('end_date')) {
          if (typeof setValueChanged.current === "string") {
            dispatch(updateInfoIssue(record?._id, record?.project_id?._id, { end_date: setValueChanged.current }, convertTime(getValueOfStringFieldInIssue(record, "end_date"), true), convertTime(setValueChanged.current, true), userInfo.id, "updated", "end time", projectInfo, userInfo))
          }
        }

        if (Object.keys(values).includes('summary')) {
          if (typeof values?.summary === "string") {
            dispatch(updateInfoIssue(record?._id, record?.project_id?._id, { summary: values?.summary }, null, null, userInfo.id, "updated", "summary", projectInfo, userInfo))
          }
        }

        if (values?.story_point && Number.isInteger(parseInt(values?.story_point))) {
          dispatch(updateInfoIssue(record?._id, projectInfo?._id, { story_point: parseInt(values?.story_point) }, getValueOfNumberFieldInIssue(record, "story_point") ? getValueOfNumberFieldInIssue(record, "story_point").toString() : "None", values?.story_point, userInfo.id, "updated", "story point", projectInfo, userInfo))
        }

        if (values?.assignees) {
          if (typeof setValueChanged.current === 'string') {
            const getUserIndex = projectInfo?.members?.findIndex(user => user?.user_info?._id?.toString() === setValueChanged.current)
            if (getUserIndex !== -1) {
              dispatch(updateInfoIssue(record?._id, record?.project_id?._id, { assignees: setValueChanged.current }, null, projectInfo?.members[getUserIndex].user_info.avatar, userInfo.id, "added", "assignees", projectInfo, userInfo))
            }
          }
        }
        if (values?.timeOriginalEstimate) {
          if (validateOriginalTime(values.timeOriginalEstimate)) {
            const oldValue = calculateTimeAfterSplitted(getValueOfNumberFieldInIssue(record, "timeOriginalEstimate") ? getValueOfNumberFieldInIssue(record, "timeOriginalEstimate") : 0)
            const newValue = calculateTimeAfterSplitted(values.timeOriginalEstimate)

            dispatch(updateInfoIssue(record?._id, projectInfo?._id, { timeOriginalEstimate: newValue }, oldValue, newValue, userInfo.id, "updated", "time original estimate", projectInfo, userInfo))
            showNotificationWithIcon('success', '', "Truong du lieu hop le")
          } else {
            showNotificationWithIcon('error', '', "Truong du lieu nhap vao khong hop le")
          }
        }
        if (values?.timeSpent) {
          if (validateOriginalTime(values.timeSpent)) {
            const oldValue = calculateTimeAfterSplitted(getValueOfNumberFieldInIssue(record, "timeSpent") ? getValueOfNumberFieldInIssue(record, "timeSpent") : 0)
            const newValue = calculateTimeAfterSplitted(values.timeSpent)
            dispatch(updateInfoIssue(record?._id, projectInfo?._id, { timeSpent: newValue }, oldValue, newValue, userInfo.id, "updated", "time spent", projectInfo, userInfo))
            showNotificationWithIcon('success', '', "Truong du lieu hop le")
          } else {
            showNotificationWithIcon('error', '', "Truong du lieu nhap vao khong hop le")
          }
        }
        setValueChanged.current = null
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

  const renderSubmit = (save, record) => {
    return <div style={{ position: 'absolute', display: 'flex', zIndex: 99999999, right: 0, marginTop: 5 }}>
      <Button onClick={(e) => {
        save(record)
      }} type='primary' className='mr-1'><i className="fa fa-check"></i></Button>
      <Button onClick={(e) => { save(null) }}><i className="fa fa-times"></i></Button>
    </div>
  }

  const renderEditingCellsInRow = (ref, dataIndex, save, record) => {
    if (dataIndex === 'summary') {
      return <div style={{ position: 'relative' }}>
        <Input ref={ref} />
        {renderSubmit(save, record)}
      </div>
    }
    else if (dataIndex === 'issue_status') {
      return <div style={{ position: 'relative' }}>
        <Select ref={ref} options={issueTypeWithoutOptions(projectInfo?.issue_types_default)} onSelect={(value) => setValueChanged.current = value} />
        {renderSubmit(save, record)}
      </div>
    }
    else if (dataIndex === 'issue_priority') {
      return <div style={{ position: 'relative' }}>
        <Select style={{ width: 150 }} ref={ref} options={priorityTypeOptions} onSelect={(value) => setValueChanged.current = value} />
        {renderSubmit(save, record)}
      </div>
    }
    else if (dataIndex === 'issue_type') {
      const renderOptions = renderIssueType(processList, id)
      return <div style={{ position: 'relative' }}>
        <Select style={{ width: 200 }} ref={ref} options={renderOptions.filter(option => option.value !== getValueOfObjectFieldInIssue(record, "issue_type")?._id)} onSelect={(value) => setValueChanged.current = value} />
        {renderSubmit(save, record)}
      </div>
    }
    else if (dataIndex === 'assignees') {
      return <div style={{ position: 'relative' }}>
        <Select
          style={{ width: 250 }}
          ref={ref}
          onClick={(e) => e.stopPropagation()}
          options={renderAssignees(listProject, id, userInfo)}
          onSelect={(value) => {
            setValueChanged.current = value
          }}
          optionRender={(option) => {
            return <Space>
              <div>
                {option.data.desc}
              </div>
            </Space>
          }} />
        <div style={{ position: 'absolute', zIndex: 99999999, right: 0 }}>
          <Button onClick={(e) => {
            e.stopPropagation()
            save(record)
          }} type='primary' className='mr-1'><i className="fa fa-check"></i></Button>
          <Button onClick={(e) => { save(null); setValueChanged.current = null }}><i className="fa fa-times"></i></Button>
        </div>
      </div>
    }
    else if (dataIndex === 'current_sprint') {
      return <div style={{ position: 'relative', width: 200 }}>
        <Select ref={ref} options={renderSprintList(sprintList, id)} onSelect={(value) => setValueChanged.current = value} />
        {renderSubmit(save, record)}
      </div>
    }
    else if (dataIndex === 'timeOriginalEstimate') {
      return <div style={{ position: 'relative' }}>
        <Input ref={ref} defaultValue={''} />
        <div style={{ position: 'absolute', display: 'flex', zIndex: 99999999, right: 0 }}>
          <Button onClick={(e) => {
            save(record)
          }} type='primary' className='mr-1'><i className="fa fa-check"></i></Button>
          <Button onClick={(e) => { save(null) }}><i className="fa fa-times"></i></Button>
        </div>
      </div>
    }
    else if (dataIndex === 'epic_link') {
      const renderOptions = renderEpicList(epicList, id)
      return <div style={{ position: 'relative' }}>
        <Select ref={ref} options={renderOptions.filter(option => option.value !== getValueOfObjectFieldInIssue(record, "epic_link")?._id)} onSelect={(value) => setValueChanged.current = value} />
        {renderSubmit(save, record)}
      </div>

    }
    else if (dataIndex === 'fix_version') {
      const renderOptions = renderVersionList(versionList, id)
      return <div style={{ position: 'relative' }}>
        <Select ref={ref} options={renderOptions.filter(option => option.value !== getValueOfObjectFieldInIssue(record, "fix_version")?._id)} onSelect={(value) => setValueChanged.current = value} />
        {renderSubmit(save, record)}
      </div>
    }
    else if (dataIndex === 'story_point') {
      return <div style={{ position: 'relative' }}>
        <InputNumber
          min={0}
          max={1000}
          ref={ref}
          onClick={(e) => e.stopPropagation()} />
        {renderSubmit(save, record)}
      </div>
    }
    else if (dataIndex === 'start_date') {
      setValueChanged.current = dayjs().toISOString()
      return <div style={{ position: 'relative' }}>
        <DatePicker style={{ width: 'max-content' }} defaultValue={dayjs()} showTime onChange={(value, dateString) => setValueChanged.current = dateString} />
        {renderSubmit(save, record)}
      </div>
    }
    else if (dataIndex === 'end_date') {
      setValueChanged.current = dayjs().toISOString()
      return <div style={{ position: 'relative' }}>
        <DatePicker style={{ width: 'max-content' }} defaultValue={dayjs()} showTime onChange={(value, dateString) => setValueChanged.current = dateString} />
        {renderSubmit(save, record)}
      </div>
    }
    else if (dataIndex === 'story_point') {
      return <div style={{ position: 'relative' }}>
        <DatePicker showTime onChange={(dateString) => setValueChanged.current = dateString} />
        {renderSubmit(save, record)}
      </div>
    }
    else if (dataIndex === 'timeSpent') {
      return <div style={{ position: 'relative' }}>
        <Input ref={ref} defaultValue={''} />
        <div style={{ position: 'absolute', display: 'flex', zIndex: 99999999, right: 0 }}>
          <Button onClick={(e) => {
            save(record)
          }} type='primary' className='mr-1'><i className="fa fa-check"></i></Button>
          <Button onClick={(e) => { save(null) }}><i className="fa fa-times"></i></Button>
        </div>
      </div>
    }
  }

  const renderValueColumns = (text, record, index, key) => {
    const checkDone = processList?.findIndex(process => process._id.toString() === getValueOfObjectFieldInIssue(record, 'issue_type')?._id?.toString() && process.type_process === 'done')
    const style = { marginLeft: getValueOfObjectFieldInIssue(record, "parent") && getValueOfNumberFieldInIssue(record, "issue_status") === 4 ? 30 : 0 }
    if (key === 'ordinal_number') {
      return <span style={style} className='font-weight-bold'>{projectInfo?.key_name}-{record?.ordinal_number}</span>
    }
    else if (key === 'issue_status') {
      return <div style={style}>{iTagForIssueTypes(getValueOfNumberFieldInIssue(record, "issue_status"), null, null, projectInfo?.issue_types_default)}</div>
    }
    else if (key === 'summary') {
      return <span style={{ ...style, textDecoration: checkDone !== -1 ? 'line-through' : 'none' }}>{getValueOfStringFieldInIssue(record, "summary")}</span>
    }
    else if (key === 'issue_type') {
      return <Tag style={style} color={getValueOfObjectFieldInIssue(record, "issue_type")?.tag_color}>{getValueOfObjectFieldInIssue(record, "issue_type")?.name_process}</Tag>
    }
    else if (key === 'issue_priority') {
      return <span style={style}>{priorityTypeOptions[getValueOfNumberFieldInIssue(record, "issue_priority")]?.label}</span>
    }
    else if (key === 'assignees') {
      if (getValueOfArrayObjectFieldInIssue(record, "assignees")?.length === 0) {
        return <span style={style} className='d-flex align-items-center'><Avatar icon={<UserOutlined />} size={30} /> <span className='ml-2'>Unassignee</span></span>
      } else {
        return getValueOfArrayObjectFieldInIssue(record, "assignees")?.map(user => {
          return <span style={style} className='mr-1'><Avatar src={user.avatar} size={30} /></span>
        })
      }
    }
    else if (key === 'creator') {
      return <span style={style}><Avatar src={record.creator?.avatar} className='mr-2' />{record.creator?.username}</span>
    }
    else if (key === 'start_date') {
      if (!getValueOfStringFieldInIssue(record, "start_date")) return <span className='mr-1 items-hover invisible'><i className="fa fa-plus"></i> Add start date</span>
      return <span style={style}><Tag color={checkDeadlineIsComing(getValueOfStringFieldInIssue(record, "start_date"), getValueOfStringFieldInIssue(record, "end_date")).tag_color}>
        <span style={{ color: checkDeadlineIsComing(getValueOfStringFieldInIssue(record, "start_date"), getValueOfStringFieldInIssue(record, "end_date")).text_color }}>{convertTime(getValueOfStringFieldInIssue(record, "start_date"), true)}</span>
      </Tag></span>
    }
    else if (key === 'end_date') {
      if (!getValueOfStringFieldInIssue(record, "end_date")) return <span className='mr-1 items-hover invisible'><i className="fa fa-plus"></i> Add end date</span>
      return <span style={style}><Tag color={checkDeadlineIsComing(getValueOfStringFieldInIssue(record, "start_date"), getValueOfStringFieldInIssue(record, "end_date")).tag_color}>
        <span style={{ color: checkDeadlineIsComing(getValueOfStringFieldInIssue(record, "start_date"), getValueOfStringFieldInIssue(record, "end_date")).text_color }}>{convertTime(getValueOfStringFieldInIssue(record, "end_date"), true)}</span>
      </Tag></span>
    }
    else if (key === 'createAt') {
      return <Tag style={style} color="#87d068">{dayjs(record.createAt).format("DD/MM/YYYY")}</Tag>
    }
    else if (key === 'updateAt') {
      return <Tag style={style} color="#2db7f5">{dayjs(record.updateAt).format("DD/MM/YYYY")}</Tag>
    }
    else if (key === 'epic_link') {
      if (!getValueOfObjectFieldInIssue(record, "epic_link")) return <span className='mr-1 items-hover invisible'><i className="fa fa-plus"></i> Add epic</span>
      return <Tag style={style} color={getValueOfObjectFieldInIssue(record, "epic_link")?.tag_color}>{getValueOfObjectFieldInIssue(record, "epic_link")?.epic_name}</Tag>
    }
    else if (key === 'parent') {
      if (getValueOfObjectFieldInIssue(record, "parent")) {
        return <div style={style} className='d-flex align-items-center'>
          <span className='mr-1'>{iTagForIssueTypes(getValueOfObjectFieldInIssue(record, "parent")?.issue_status, null, null, projectInfo?.issue_types_default)}</span>
          <span className='mr-1'>{projectInfo?.key_name}-{getValueOfObjectFieldInIssue(record, "parent")?.ordinal_number}</span>
        </div>
      }
      return null
    }
    else if (key === 'fix_version') {
      if (!getValueOfObjectFieldInIssue(record, "fix_version")) return <span className='mr-1 items-hover invisible'><i className="fa fa-plus"></i> Add version</span>
      return <Tag style={style} color={getValueOfObjectFieldInIssue(record, "fix_version")?.tag_color}>{getValueOfObjectFieldInIssue(record, "fix_version")?.version_name}</Tag>
    }
    else if (key === 'timeOriginalEstimate') {
      const time = getValueOfNumberFieldInIssue(record, "timeOriginalEstimate")
      if (typeof time === "number") {
        return <span style={style}>{time !== null ? convertMinuteToFormat(time) : null}</span>
      } else {
        return <span className='mr-1 items-hover invisible'><i className="fa fa-plus"></i> Add time estimate</span>
      }
    }
    else if (key === 'timeSpent') {
      if (typeof getValueOfNumberFieldInIssue(record, "timeSpent") !== "number")
        return <span className='mr-1 items-hover invisible'><i className="fa fa-plus"></i> Add time spent</span>
      return <span style={style}>{convertMinuteToFormat(getValueOfNumberFieldInIssue(record, "timeSpent"))}</span>
    }
    else if (key === 'timeRemaining') {
      return <span style={style}>{Number.isInteger(getValueOfNumberFieldInIssue(record, "timeSpent")) && Number.isInteger(getValueOfNumberFieldInIssue(record, "timeOriginalEstimate")) ? convertMinuteToFormat(getValueOfNumberFieldInIssue(record, "timeOriginalEstimate") - getValueOfNumberFieldInIssue(record, "timeSpent")) : "None"}</span>
    }
    else if (key === 'current_sprint') {
      if (getValueOfObjectFieldInIssue(record, "current_sprint")) {
        return <Tag style={style}>{getValueOfObjectFieldInIssue(record, "current_sprint")?.sprint_name}</Tag>
      }
      return <span className='mr-1 items-hover invisible'><i className="fa fa-plus"></i> Add sprint</span>
    }
    else if (key === 'old_sprint') {
      return <div className='d-flex'>
        {getValueOfArrayFieldInIssue(record, "old_sprint")?.filter((sprint, index) => getValueOfArrayFieldInIssue(record, "old_sprint").map(sprint => sprint._id).indexOf(sprint._id) === index).map((sprint) => {
          return <Tag style={style} key={sprint._id}>{sprint.sprint_name}</Tag>
        })}
      </div>
    }
    else if (key === 'story_point') {
      if (typeof getValueOfNumberFieldInIssue(record, "story_point") !== 'number') return <span style={{ width: 'max-content' }} className='mr-1 items-hover invisible'><i className="fa fa-plus"></i> Add story point</span>
      return <span style={style}>{getValueOfNumberFieldInIssue(record, "story_point")}</span>
    }
  }

  const renderColumns = () => {
    const data = projectInfo?.table_issues_list?.filter(col => col.isShowed).map(col => {
      var align = "left"
      var allowEdit = false
      var icon = null
      if (["issue_type", "start_date", "end_date", "issue_priority", "summary", "issue_status", "assignees", "current_sprint", "epic_link", "fix_version", "story_point", "timeOriginalEstimate", "timeSpent"].includes(col.key)) {
        allowEdit = true
      }

      //set icon
      if (["createAt", "updateAt", "start_date", "end_date"].includes(col.key)) {
        icon = <i className="fa fa-calendar-alt"></i>
      }
      if (col.key === "ordinal_number") {
        icon = <i className="fa-solid fa-hashtag"></i>
      }
      if (col.key === "summary") {
        icon = <i className="fa fa-stream"></i>
      }
      if ("issue_status" === col.key) {
        icon = <i className="fa fa-arrow-circle-right"></i>
      }
      if ("issue_type" === col.key) {
        icon = <i className="fa fa-arrow-right"></i>
      }
      if (col.key === "assignees") {
        icon = <i className="fa-solid fa-people-group"></i>
      }
      if (["timeSpent", "timeOriginalEstimate", "timeRemaining"].includes(col.key)) {
        icon = <i className="fa-solid fa-clock"></i>
      }
      if ("parent" === col.key) {
        icon = <i className="fa fa-code-branch"></i>
      }
      if ("fix_version" === col.key) {
        icon = <i className="fa-solid fa-folder-open"></i>
      }
      if ("issue_priority" === col.key) {
        icon = <i className="fa fa-arrow-alt-circle-down"></i>
      }
      if ("epic_link" === col.key) {
        icon = <i className="fa fa-bolt"></i>
      }
      if (["current_sprint", "old_sprint"].includes(col.key)) {
        icon = <i className="fab fa-viadeo"></i>
      }
      if ("creator" === col.key) {
        icon = <i className="fa-solid fa-person"></i>
      }
      if ("story_point" === col.key) {
        icon = <i className="fa-solid fa-list-ol"></i>
      }

      var setWidth = 'max-content'

      if (["parent", "old_sprint", "timeRemaining", "component"].includes(col.key)) {
        setWidth = 200
      }

      if (["timeOriginalEstimate"].includes(col.key)) {
        setWidth = 250
      }

      if (["issue_status", "issue_priority", "story_point", "fix_version", "epic_link", "createAt", "updateAt"].includes(col.key)) {
        align = "center"
      }
      return {
        title: <span style={{ color: "#626F86", display: 'flex', alignItems: 'center' }}>{icon} <span className='ml-2' style={{ width: 'max-content' }}>{col.title}</span></span>,
        dataIndex: col.key,
        key: col.key,
        editable: allowEdit,
        index: col.til_index,
        width: setWidth,
        align: align,
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
    return issuesInProject?.filter(issue => getValueOfNumberFieldInIssue(issue, "issue_status") !== 4).map(issue => {
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
      <h4>List</h4>
      <div className='d-flex align-items-center mb-4 justify-content-between'>
        <MemberProject typeInterface="issue list" projectInfo={projectInfo} id={id} userInfo={userInfo} allIssues={issuesInProject} epicList={epicList} versionList={versionList} handleSearchIssue={handleSearchIssue} searchIssue={searchIssue} />
        <div>
          <Button className='mr-2' tyle={{ fontSize: 13 }}><i className="fa-duotone fa-solid fa-comments mr-2"></i> Give feedback</Button>
          <Button onClick={() => {
            setDisplaySetting(!displaySetting)
          }}><span><i className="fa-solid fa-sliders mr-2"></i> View Settings</span></Button>
        </div>
      </div>
      <div className='d-flex w-100'>
        <div className='issues-info' style={{ height: '70vh', overflowY: 'auto', scrollbarWidth: 'none', width: '100%' }}>
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
                      x: issuesInProject?.length > 0 ? 'max-content' : 0,
                      y: issuesInProject?.length > 0 ? 450 : null
                    }}
                    components={components}
                    rowKey="key"
                    expandable={{
                      expandedRowRender: (record) => {
                        return <div style={{ width: 1000, backgroundColor: '#ffff', padding: '5px 20px', border: '2px solid #4BADE8' }}>
                          <div style={{ width: '100%' }} className='d-flex justify-content-between'>
                            <div className='d-flex align-items-center' style={{ marginLeft: 100, width: '100%' }}>
                              <span>{iTagForIssueTypes(0, 'ml-1', 16, projectInfo?.issue_types_default)}</span>
                              <Input onChange={(e) => {
                                addSubSummaryIssue.current = e.target.value
                              }} className='edit-input-issue-list' style={{ border: 'none', borderRadius: 0, width: 500 }} placeholder='What needs to be done?' />
                            </div>
                            <div className='d-flex align-items-center'>
                              <Select className='mr-2' defaultValue={issueTypeOptions(projectInfo?.issue_types_default)[4]?.value} options={issueTypeOptions(projectInfo?.issue_types_default)} disabled />
                              <Button style={{ padding: '0 10px' }} type='primary' onClick={() => {
                                if (addSubSummaryIssue.current?.trim() !== "") {
                                  dispatch(createIssue(attributesFiltering(projectInfo, {
                                    project_id: id,
                                    issue_status: 4,
                                    issue_priority: 2,
                                    summary: addSubSummaryIssue.current,
                                    issue_type: defaultForIssueType(issueStatus, workflowList, processList),
                                    current_sprint: null,
                                    parent: record?._id,
                                    creator: userInfo.id,
                                  }),
                                    id,
                                    userInfo.id,
                                    getValueOfObjectFieldInIssue(record, "current_sprint")?._id,
                                    record?._id,
                                    projectInfo,
                                    userInfo
                                  ))
                                } else {
                                  showNotificationWithIcon('error', '', 'Summary can\'t not left blank')
                                }
                                addSubSummaryIssue.current = ""
                              }}><span style={{ color: "#dddd", fontWeight: 600 }}>Create <i style={{ transform: 'rotate(180deg)' }} className="fa-solid fa-share-from-square"></i></span></Button>
                            </div>
                          </div>
                        </div>
                      },
                      rowExpandable: (record) => !getValueOfObjectFieldInIssue(record, "parent") && getValueOfNumberFieldInIssue(record, "issue_status") !== 4,
                    }}
                    footer={() => {
                      return !openCreatingBacklog ? <button className='btn btn-transparent btn-create-issue' style={{ fontSize: '14px', color: '#ddd' }} onClick={() => {
                        setOpenCreatingBacklog(true)
                      }}>
                        <i className="fa-regular fa-plus mr-2"></i>
                        Create issue
                      </button> : <div className='d-flex' style={{ border: '2px solid #4BADE8' }}>
                        <Select style={{ border: 'none', borderRadius: 0 }}
                          defaultValue={issueTypeWithoutOptions(projectInfo?.issue_types_default)[0]?.value}
                          onChange={(value, option) => {
                            setIssueStatus(value)
                          }}
                          value={issueStatus}
                          className='edit-select-issue-list'
                          options={issueTypeWithoutOptions(projectInfo?.issue_types_default)?.filter(status => [0, 1, 2].includes(parseInt(status.value)))}
                        />
                        <Input
                          placeholder="What need to be done?"
                          onChange={(e) => {
                            summaryValue.current = e.target.value
                          }}
                          onBlur={(e) => {
                            setOpenCreatingBacklog(false)
                            setIssueStatus(0)
                            summaryValue.current = ""
                          }}
                          defaultValue={summaryValue.current}
                          className='edit-input-issue-list'
                          style={{ border: 'none', borderRadius: 0 }}
                          onKeyUp={((e) => {
                            if (e.key === "Enter") {
                              if (summaryValue.current.trim() !== "") {
                                dispatch(createIssue(attributesFiltering(projectInfo, {
                                  project_id: id,
                                  issue_status: issueStatus,
                                  summary: summaryValue.current,
                                  issue_type: processList.length === 0 ? null : processList[0]._id,
                                  current_sprint: null,
                                  creator: userInfo.id,
                                }),
                                  id,
                                  userInfo.id,
                                  null,
                                  null,
                                  projectInfo,
                                  userInfo
                                ))
                                //set default is 0 which means story
                              }
                              setOpenCreatingBacklog(false)
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
          </div> : <div></div>}
        </div>
        <div className={`card info-settings mr-1 mt-0`} style={{ width: '25rem', height: 510, display: displaySetting ? 'block' : 'none', margin: '0px 10px', overflowY: 'auto', scrollbarWidth: 'none', marginTop: 7 }}>
          <div className='d-flex justify-content-between' style={{ padding: '15px 10px' }}>
            <h6 className='m-0'>View Settings</h6>
            <i className="fa-solid fa-xmark" onClick={() => {
              setDisplaySetting(!displaySetting)
            }}></i>
          </div>
          <div className='ml-2 mb-2 row'>
            {projectInfo?.table_issues_list?.map(col => {
              return <div className='row col-12 mt-1'>
                <span className='col-8' style={{ marginRight: 20, fontSize: 15 }}>{col.title}</span>
                <Switch className='col-2' onChange={() => {
                  dispatch(updateProjectAction(id, { table_col_key: col.key, isShowed: !col.isShowed }, null))
                }} defaultValue={col.isShowed} />
              </div>
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
