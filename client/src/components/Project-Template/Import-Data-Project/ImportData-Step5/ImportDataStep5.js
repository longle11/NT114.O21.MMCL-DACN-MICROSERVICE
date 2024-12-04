import { Table } from 'antd'
import React from 'react'

export default function ImportDataStep5() {
  const columns = Object.keys(JSON.parse(localStorage.getItem("table-preview"))[0]).map(value => {
    return {
      title: (value[0].toUpperCase() + value.substring(1))?.replace('_', ' '),
      dataIndex: value,
      key: value
    }    
  })
  
  const data = JSON.parse(localStorage.getItem("table-preview"))?.map(field => {
    const keys = Object.keys(field)
    const newObj = {}
    keys.forEach(key => {
      newObj[key] = field[key]?.toString()
    })

     return newObj
  })

  return (
    <div>
      <Table columns={columns} dataSource={data} />
    </div>
  )
}
