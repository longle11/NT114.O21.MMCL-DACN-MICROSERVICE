import React, { useState } from 'react';
import { Button, message, Steps, theme } from 'antd';
import ImportDataStep1 from '../ImportData-Step1/ImportDataStep1';
import ImportDataStep2 from '../ImportData-Step2/ImportDataStep2';
import ImportDataStep3 from '../ImportData-Step3/ImportDataStep3';
import ImportDataStep4 from '../ImportData-Step4/ImportDataStep4';
import ImportDataStep5 from '../ImportData-Step5/ImportDataStep5';
import { useDispatch, useSelector } from 'react-redux';
import { importIssuesIntoNewProject } from '../../../../redux/actions/IssueAction';
import { useNavigate } from 'react-router-dom';


const ImportDataProject = () => {
  const [isEnableClickNext, setIsEnableClickNext] = useState(true)

  const [loadings, setLoadings] = useState(false)
  const userInfo = useSelector(state => state.user.userInfo)
  const dispatch = useDispatch()

  const navigate = useNavigate()

  const steps = [
    {
      title: 'Upload CSV',
      content: <ImportDataStep1 setIsEnableClickNext={setIsEnableClickNext} />,
    },
    {
      title: 'Set up project',
      content: <ImportDataStep2 setIsEnableClickNext={setIsEnableClickNext} />,
    },
    {
      title: 'Map fields',
      content: <ImportDataStep3 setIsEnableClickNext={setIsEnableClickNext} />,
    },
    // {
    //   title: 'Move users',
    //   content: <ImportDataStep4 setIsEnableClickNext={setIsEnableClickNext} />,
    // },
    {
      title: 'Review details',
      content: <ImportDataStep5 setIsEnableClickNext={setIsEnableClickNext} />,
    }
  ]

  const { token } = theme.useToken()
  const [current, setCurrent] = useState(0)
  const next = () => {
    setCurrent(current + 1)
  }
  const prev = () => {
    setCurrent(current - 1)
  }
  const items = steps.map((item) => ({
    key: item.title,
    title: item.title,
  }))
  const contentStyle = {
    backgroundColor: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    border: `1px dashed ${token.colorBorder}`,
    marginTop: 16,
    height: '90%'
  }
  return (
    <div style={{ height: '80vh', margin: '15px 5px 5px 0' }}>
      <Steps current={current} items={items} />
      <div style={contentStyle}>{steps[current].content}</div>
      <div
        style={{
          marginTop: 24,
          display: 'flex',
          justifyContent: 'end'
        }}
      >

        {current > 0 && (
          <Button
            style={{
              margin: '0 8px',
            }}
            onClick={() => prev()}
          >
            Previous
          </Button>
        )}
        {current < steps.length - 1 && (
          <Button disabled={isEnableClickNext} type="primary" onClick={() => {
            next()
            setIsEnableClickNext(true)
          }}>
            Next
          </Button>
        )}
        {current === steps.length - 1 && (
          <Button type="primary" loading={loadings} onClick={() => {
            const data = JSON.parse(localStorage.getItem("table-preview"))
            const project_name = localStorage.getItem('project_name')
            const project_template = localStorage.getItem('project_template')
            const key_project = localStorage.getItem('key_project')

            const issue_types_default = [
              {
                icon_id: 0,
                icon_type: 'fa-bookmark',
                icon_color: '#65ba43',
                icon_name: 'Story'
              },
              {
                icon_id: 1,
                icon_type: 'fa-square-check',
                icon_color: '#4fade6',
                icon_name: 'Task'
              },
              {
                icon_id: 2,
                icon_type: 'fa-circle-exclamation',
                icon_color: '#cd1317',
                icon_name: 'Bug'
              },
              {
                icon_id: 3,
                icon_type: 'fa-bolt',
                icon_color: 'purple',
                icon_name: 'Epic'
              },
              {
                icon_id: 4,
                icon_type: 'fa-list-check',
                icon_color: '#e97f33',
                icon_name: 'Subtask'
              }
            ]
            const workflow_default = [
              {
                process_name: 'To Do',
                process_color: '#ddd',
                type_process: 'normal'
              },
              {
                process_name: 'In Progress',
                process_color: '#1d7afc',
                type_process: 'normal'
              },
              {
                process_name: 'Done',
                process_color: '#22a06b',
                type_process: 'done'
              }
            ]

            data.forEach(issue => {
              if (typeof issue['issue_type'] === 'string' && !workflow_default.map(field => field.process_name?.toLocaleLowerCase()).includes(issue['issue_type']?.toLowerCase())) {
                workflow_default.push({
                  process_name: issue['issue_type'],
                  type_process: 'normal'
                })
              }
            })

            const project_attrs =
            {
              name_project: project_name?.trim(),
              key_name: key_project?.trim(),
              creator: userInfo.id,
              issue_types_default: issue_types_default,
              workflow_default: workflow_default,
              template_name: project_template === '0' ? 'Kanban' : 'Scrum',
              members: [{ user_info: userInfo.id, user_role: 0, status: 'approved' }],
              sprint_id: null
            }

            dispatch(importIssuesIntoNewProject(
              { ...project_attrs },
              data,
              setLoadings,
              navigate
            ))
          }}>
            Done
          </Button>
        )}
      </div>
    </div >
  );
};
export default ImportDataProject;