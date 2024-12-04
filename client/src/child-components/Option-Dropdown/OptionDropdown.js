import { Button, Input } from 'antd'
import React, { useState } from 'react'
import { showNotificationWithIcon } from '../../util/NotificationUtil'
import './OptionDropdown.css'
export default function OptionDropdown(props) {
    const index = props.index
    const data = props.data
    const is_edited = props.is_edited


    const positionNewIssueTagAdded = props.positionNewIssueTagAdded
    const setPositionNewIssueTagAdded = props.setPositionNewIssueTagAdded
    const [optionNameText, setOptionNameText] = useState('')

    const setAddOption = props.setAddOption
    return (
        <div className='list-group-item mb-2 pl-2 d-flex justify-content-between align-items-center' style={{padding: '5px 10px'}}>
            <div className='info-left d-flex align-items-center w-100 mr-2'>
                <div className='d-flex mr-2'>
                    <i className="fa fa-grip-vertical"></i>
                </div>
                {
                    index === -1 ? <Input
                        onChange={(e) => {
                            setOptionNameText(e.target.value)
                        }}
                        allowClear
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                const tempArr = positionNewIssueTagAdded.data.default_value ? [...positionNewIssueTagAdded.data.default_value] : []
                                if (optionNameText?.trim() !== "") {
                                    tempArr.push(optionNameText)
                                    setPositionNewIssueTagAdded({ ...positionNewIssueTagAdded, isModifyAvailable: true, data: { ...positionNewIssueTagAdded.data, default_value: [...tempArr] } })
                                } else {
                                    showNotificationWithIcon('error', '', 'loi nhe')
                                }
                            }
                        }}
                        className='edit-dropdown-issue_setting'
                        style={{ width: '100%' }}
                        placeholder='Enter your value' /> : <Input className='edit-dropdown-issue_setting' value={data} disabled={index !== -1} />
                }
            </div>
            {
                is_edited ? <Button onClick={() => {
                    if (index === -1) {
                        setAddOption(false)
                    }
                    else {
                        const tempArr = [...positionNewIssueTagAdded.data.default_value]
                        tempArr.splice(index, 1)
                        setPositionNewIssueTagAdded({ ...positionNewIssueTagAdded, isModifyAvailable: true, data: { ...positionNewIssueTagAdded.data, default_value: [...tempArr] } })
                    }
                }}>
                    <i className="fa fa-times"></i>
                </Button> : <></>
            }
        </div>
    )
}
