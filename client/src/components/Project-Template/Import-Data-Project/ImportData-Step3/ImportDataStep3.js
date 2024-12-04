import { Button, Checkbox, Select, Table } from 'antd'
import React, { useState } from 'react'
import { showNotificationWithIcon } from '../../../../util/NotificationUtil';
import { csvFileToArray } from '../../../../util/CSV';

export default function ImportDataStep3(props) {
  const contentAfterConverted = csvFileToArray(JSON.parse(localStorage.getItem('content')), JSON.parse(localStorage.getItem('delimiter')))

  const [checkboxArrs, setCheckboxArrs] = useState(Object.keys(contentAfterConverted[0])?.map(() => false))
  const [isFieldValid, setFieldValue] = useState(Object.keys(contentAfterConverted[0]).map((value, index) => {
    return {
      isCorrect: true,
      index: index
    }
  }))
  const setIsEnableClickNext = props.setIsEnableClickNext
  const [fieldInProject, setFieldInProject] = useState(Object.keys(contentAfterConverted[0]).map(field => {
    return {
      field_col_in_old_project: field,
      field_col_in_new_project: '',
      dataType: '',
      isCheck: false //neu la false thi tuong ung voi loai truong do va khong xet
    }
  }))

  function convertStringToArray(str) {
    // Thay thế dấu nháy đơn bằng dấu nháy kép
    const jsonString = str.replace(/'/g, '"')

    try {
      // Chuyển đổi chuỗi JSON thành mảng
      const array = JSON.parse(jsonString)
      return array
    } catch (error) {
      return null
    }
  }

  function convertValue(array, typeName) {
    const currentValueConverted = []
    var data = array.map(value => {
      if (value[typeName] === '' || !value[typeName]) {
        currentValueConverted.push(null)
        return null
      }
      else if (typeof value[typeName] === 'string') {
        if (currentValueConverted.includes('string')) {
          return value[typeName]
        }
        if (Number.isInteger(Number(value[typeName]))) {
          currentValueConverted.push('number')
          return Number(value[typeName])
        } else if (value[typeName]?.toLowerCase() === 'true' || value[typeName]?.toLowerCase() === 'false') {
          currentValueConverted.push('boolean')
          return value[typeName]?.toLowerCase() === 'true'
        } else if (Array.isArray(value[typeName])) {
          currentValueConverted.push('array')
          return convertStringToArray(value[typeName])
        }
        currentValueConverted.push('string')
        return value[typeName]
      }
    })

    if (currentValueConverted.includes('string')) {
      data = data.map(value => value ? value.toString() : null)
    }

    return data
  }

  const convertTypeValue = (value, dataType) => {
    if (value === '' || !value) {
      return null
    }
    if (dataType === 'number') {
      return Number(value)
    } else if (dataType === 'boolean') {
      return value?.toLowerCase() === 'true'
    } else if (dataType === 'array-object-id') {
      return convertStringToArray(value)
    }
    return value
  }

  const checkTypeData = (typeName, field_index, indexRow) => {
    const getValueOfAllRows = convertValue(contentAfterConverted, typeName)
    var isValid = true

    var checkMongoID = new RegExp("^[0-9a-fA-F]{24}$")
    const index = attributeFieldDefaultOfProject.findIndex(field => field.value === field_index)
    if (index !== -1) {
      const type = attributeFieldDefaultOfProject[index].dataType
      const fieldOriginalRemoveNull = getValueOfAllRows?.filter(value => value !== null)
      if (type === 'number') {
        if (fieldOriginalRemoveNull.map(value => typeof value === 'number').includes(false)) {
          isValid = false
        }
      } else if (type === 'string') {
        if (fieldOriginalRemoveNull.map(value => typeof value === 'string').includes(false)) {
          isValid = false
        }
      } else if (type === 'date') {
        if (fieldOriginalRemoveNull.map(value => !isNaN(new Date(value).getTime())).includes(false)) {
          isValid = false
        }
      } else if (type === 'object-id') {
        if (fieldOriginalRemoveNull.map(value => typeof value === 'string' && checkMongoID.test(value))) {
          isValid = false
        }
      }
    }

    if (isValid === false) {
      const temp = [...isFieldValid]
      temp[indexRow].isCorrect = false
      temp[indexRow].index = indexRow
      showNotificationWithIcon('error', '', 'Trường dữ liệu ánh xạ có kiểu dữ liệu không hợp lệ')
      setFieldValue(prev => {
        const temp = [...prev]
        temp[indexRow].isCorrect = false
        temp[indexRow].index = indexRow
        return temp
      })

      return false
    }

    return true
  }

  const attributeFieldDefaultOfProject = [
    { label: 'Issue Status', value: 'issue_status', dataType: 'number' },
    { label: 'Summary', value: 'summary', dataType: 'string' },
    { label: 'Description', value: 'description', dataType: 'string' },
    { label: 'Type Name', value: 'issue_type', dataType: 'string' },
    // { label: 'Assignees', value: 'assignees', dataType: 'array-object-id' },
    { label: 'Epic Link', value: 'epic_link', dataType: 'string' },
    { label: 'Priority', value: 'issue_priority', dataType: 'number' },
    { label: 'Fix version', value: 'fix_version', dataType: 'string' },
    { label: 'Sprint', value: 'current_sprint', dataType: 'string' },
    { label: 'Story point', value: 'story_point', dataType: 'number' },
    { label: 'Start date', value: 'start_date', dataType: 'string' },
    { label: 'Issue Flagged', value: 'isFlagged', dataType: 'boolean' },
    { label: 'End date', value: 'end_date', dataType: 'string' },
    { label: 'Time Original Estimate', value: 'timeOriginalEstimate', dataType: 'number' }
  ].filter(field => {
    if (localStorage.getItem('project_template') == '1') {  //scrum project
      return true
    } else if (localStorage.getItem('project_template') == '0' && !['epic_link', 'fix_version', 'current_sprint'].includes(field.value)) {
      return true
    }
    return false
  })

  const attrs = attributeFieldDefaultOfProject.map(issue => {
    return {
      label: issue.label,
      value: issue.value
    }
  })

  const [selectedValues, setSelectedValues] = useState(Array(attributeFieldDefaultOfProject.length).fill(null));

  const columns = [
    {
      title: 'Columns in CSV',
      dataIndex: 'column_csv',
      render: (text, record, index) => {
        return record
      }
    },
    {
      title: '',
      dataIndex: '',
      render: (text, record) => {
        return <i className="fa-solid fa-arrow-right"></i>
      }
    },
    {
      title: 'Taskscheduler Field',
      dataIndex: 'project_field',
      render: (text, record, index) => {
        if (checkboxArrs[index]) {

          const availableOptions = attrs.filter(attr => !selectedValues.includes(attr.value));
          return <Select
            onSelect={(value, option) => {
              setSelectedValues((prev) => {
                const tempArr = [...prev]
                tempArr[index] = value;
                return [...tempArr]
              })


              setFieldInProject(prev => {
                const tempArr = [...prev]
                tempArr[index].field_col_in_new_project = value
                tempArr[index].dataType = attributeFieldDefaultOfProject.find(field => field.value === value).dataType

                return tempArr
              })

              if (checkTypeData(record, value, index) === true) {
                setFieldValue(prev => {
                  const oldArrs = [...prev]
                  oldArrs[index].isCorrect = true
                  oldArrs[index].index = index
                  return oldArrs
                })
              }
            }}
            allowClear
            onClear={() => {
              setSelectedValues((prev) => {
                const tempArr = [...prev]
                tempArr[index] = null;
                return [...tempArr]
              })

              setFieldValue(prev => {
                const oldArrs = [...prev]
                oldArrs[index].isCorrect = true
                oldArrs[index].index = index
                return oldArrs
              })

              setFieldInProject(prev => {
                const tempArr = [...prev]
                tempArr[index].field_col_in_new_project = ''
                tempArr[index].dataType = ''
                return tempArr
              })
            }}
            options={availableOptions}
            style={{ width: 300, border: isFieldValid[index].isCorrect === false ? '1px solid red' : '1px solid transparent', borderRadius: 6 }}
            placeholder="Select a field to map" />
        } else {
          return <Select style={{ width: 300 }} disabled value="Do not import" />
        }
      }
    },
    {
      title: 'Include in import',
      dataIndex: 'action',
      render: (text, record, index) => {
        return <Checkbox defaultChecked={checkboxArrs[index]} onChange={(e) => {
          setSelectedValues(prev => {
            const newValues = [...prev]
            newValues[index] = null
            return newValues
          })

          setFieldValue(prev => {
            const oldArrs = [...prev]
            oldArrs[index].isCorrect = true
            oldArrs[index].index = index
            return oldArrs
          })

          setCheckboxArrs(prev => {
            const newCheckboxArrs = [...prev]
            newCheckboxArrs[index] = e.target.checked
            return newCheckboxArrs
          })

          setFieldInProject(prev => {
            const tempArr = [...prev]
            tempArr[index].field_col_in_new_project = ''
            tempArr[index].dataType = ''
            tempArr[index].isCheck = e.target.checked
            return tempArr
          })
        }} />
      }
    }
  ]
  return (
    <div>
      <h4>Map project fields</h4>
      <p>We’ve tried to map columns from the CSV file to Jira fields. Organize how your data is presented by verifying and mapping any remaining columns</p>
      <h6>Summary is a required field in Taskscheduler. It can be the task name or an overview of a task. Map the summary field to a CSV column to proceed with the import.</h6>
      <Table
        columns={columns}
        dataSource={Object.keys(contentAfterConverted[0])}
        pagination={false}
        scroll={{
          y: 460
        }}
      />
      <Button onClick={() => {
        const arrsResult = fieldInProject.map((value, index) => {
          return { ...value, ...isFieldValid[index] }
        })
        const findSummaryIndex = arrsResult.findIndex(field => field.field_col_in_new_project === 'summary')
        if (findSummaryIndex !== -1) {
          var isCheck = false
          //check whether all fields are mapping correctly
          for (let index = 0; index < arrsResult.length; index++) {
            if (arrsResult[index].field_col_in_new_project !== '' && arrsResult[index].isCorrect) {
              isCheck = true
            } else if (arrsResult[index].field_col_in_new_project === '' && !arrsResult[index].isCheck) {
              isCheck = true
            } else {
              isCheck = false
              break
            }
          }
          if (!isCheck) {
            setIsEnableClickNext(true)
            showNotificationWithIcon('error', '', 'Mapping is invalid')
          } else {
            const getMappingFieldValid = arrsResult.filter(field => field.field_col_in_new_project !== '' && field.isCorrect)
            //proceed to create new data with new field
            const data = contentAfterConverted.map(row => {
              const arrs = {}
              getMappingFieldValid.forEach(field => {
                arrs[field.field_col_in_new_project] = convertTypeValue(row[field.field_col_in_old_project], field.dataType)
              })
              return arrs
            })
            localStorage.setItem('table-preview', JSON.stringify(data))
            showNotificationWithIcon('success', '', 'Mapping is valid')

            setIsEnableClickNext(false)
          }
        } else {
          setIsEnableClickNext(true)
          showNotificationWithIcon('error', '', 'Summary is required')
        }
      }}>Check valid</Button>
    </div>
  )
}
