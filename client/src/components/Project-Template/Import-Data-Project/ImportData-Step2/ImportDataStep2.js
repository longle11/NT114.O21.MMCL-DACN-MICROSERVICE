import { Input, Select } from 'antd'
import Axios from 'axios'
import React, { useRef, useState } from 'react'
import domainName from '../../../../util/Config'
import { delay } from '../../../../util/Delay'

export default function ImportDataStep2(props) {
  const [errorKey, setErrorKey] = useState('')
  const [errorProjectName, setErrorProjectName] = useState('')
  const setIsEnableClickNext = props.setIsEnableClickNext
  if (typeof localStorage.getItem('key_project') === 'string' && typeof localStorage.getItem('project_name') === 'string' && typeof localStorage.getItem('project_template') === 'string') {
    setIsEnableClickNext(prev => false)
  } else {
    setIsEnableClickNext(prev => true)
  }
  const errorName = useRef(false)
  const inputHandlingCallApi = useRef(null)
  return (
    <div style={{ margin: 20 }}>
      <h4>Set up a project in Taskscheduler</h4>
      <span>Your team’s data will be imported into this project. Check if you’re selecting the right Taskscheduler project, template, and project type as these options can’t be modified later.</span>
      <br />
      <span className='text-danger mt-2 mb-2 d-block'>All fields are required</span>
      <form>
        <div class="d-flex flex-column">
          <label for="typeProject">Type Project</label>
          <Select style={{ width: '50%' }} options={[
            { label: 'Software Project', value: 0 },
            { label: 'Business Project', value: 1 },
          ]} defaultValue={'Software Project'} disabled id="typeProject" />
        </div>
        <div class="d-flex flex-column mt-2">
          <label for="templateProject">Template</label>
          <Select
            style={{ width: '50%' }}
            onSelect={(value) => {
              localStorage.setItem('project_template', value)
            }}
            options={[
              { label: 'Kanban', value: 0 },
              { label: 'Scrum', value: 1 },
            ]}
            defaultValue={localStorage.getItem('project_template') === '0' ? "Kanban" : "Scrum"}
            id="templateProject" />
        </div>
        <div class="d-flex flex-column mt-2">
          <label for="nameProject">Project Name</label>
          <Input defaultValue={localStorage.getItem('project_name')} onChange={async (e) => {
            setIsEnableClickNext(prev => true)
            errorName.current = false
            if (!e.target.value || e.target.value.trim() === "") {
              setErrorProjectName("Name project is required")
              errorName.current = true
            } else if (e.target.value.trim().length < 6) {
              setErrorProjectName("Name project has a minimum of 6 characters")
              errorName.current = true
            } else {
              //kiem tra gia tri co khac null khong, khac thi xoa
              if (inputHandlingCallApi.current) {
                clearTimeout(inputHandlingCallApi.current)
              }
              inputHandlingCallApi.current = setTimeout(async () => {
                try {
                  const result = await Axios.get(`${domainName}/api/projectmanagement/get-project/name`, {
                    params: { name_project: e.target.value.trim() }
                  })
                  if (result.status === 200) {
                    setErrorProjectName("Project name is already existed")
                    errorName.current = true
                    setIsEnableClickNext(prev => true)
                  }
                } catch (error) {
                }
              }, 1000)

              await delay(1000)
              if (!errorName.current) {
                localStorage.setItem('project_name', e.target.value)
                setIsEnableClickNext(prev => false)
                setErrorProjectName(prev => '')
              }
            }
          }} style={{ width: '50%' }} class="form-control" id="nameProject" />
          {errorProjectName.trim() !== '' ? <small className='text-danger'>{errorProjectName}</small> : <></>}
        </div>
        <div class="d-flex flex-column mt-2">
          <label for="keyProject">Key Name</label>
          <Input defaultValue={localStorage.getItem('key_project')} onChange={(e) => {
            if (!e.target.value || e.target.value.trim() === "") {
              setErrorKey("Key name is required")
            } else {
              setIsEnableClickNext(prev => true)

              const trimmedKeyName = e.target.value.trim();
              if (trimmedKeyName.length < 2) {
                setErrorKey("Key name has a minimum of 2 characters")
              } else if (trimmedKeyName.length > 10) {
                setErrorKey("Key name has a maximum of 10 characters")
              } else if (!/^[A-Za-z][A-Za-z0-9]*$/.test(trimmedKeyName)) {
                setErrorKey("Key name must start with a letter and contain no special characters or spaces")
              } else {
                setIsEnableClickNext(prev => false)
                setErrorKey(prev => '')
                localStorage.setItem('key_project', e.target.value.toUpperCase())
              }
            }
          }} style={{ width: '25%' }} class="form-control" id="keyProject" />
          {errorKey.trim() !== '' ? <small className='text-danger'>{errorKey}</small> : <></>}
        </div>
      </form>
    </div>
  )
}

