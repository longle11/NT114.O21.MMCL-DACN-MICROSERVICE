import { Button, Checkbox, Input } from 'antd'
import React, { useState } from 'react'
import { showNotificationWithIcon } from '../../util/NotificationUtil'
import './OptionCheckBox.css'
export default function OptionCheckBox(props) {
    const index = props.index
    const data = props.data
    const is_edited = props.is_edited

    const positionNewIssueTagAdded = props.positionNewIssueTagAdded
    const setPositionNewIssueTagAdded = props.setPositionNewIssueTagAdded
    const [fielCheckBoxOption, setFieldCheckboxOption] = useState({
        optionName: '',
        isChecked: false
    })
    const setAddOption = props.setAddOption
    return (
        <div className='list-group-item mb-2 pl-2 d-flex justify-content-between align-items-center'>
            <div className='info-left d-flex align-items-center w-100 mr-2'>
                <div className='d-flex mr-2'>
                    <i className="fa fa-grip-vertical"></i>
                </div>
                <Checkbox defaultChecked={data?.isChecked} disabled={index !== -1} onChange={(e) => {
                    if (index === -1) {
                        setFieldCheckboxOption({ ...fielCheckBoxOption, isChecked: e.target.checked })
                    }
                }} className='mr-1' />
                {
                    index === -1 ? <Input
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                const tempArr = positionNewIssueTagAdded.data.default_value ? [...positionNewIssueTagAdded.data.default_value] : []
                                if (fielCheckBoxOption.optionName?.trim() !== "") {
                                    tempArr.push(fielCheckBoxOption)
                                    setPositionNewIssueTagAdded({ ...positionNewIssueTagAdded, isModifyAvailable: true, data: { ...positionNewIssueTagAdded.data, default_value: [...tempArr] } })
                                } else {
                                    showNotificationWithIcon('error', '', 'loi nhe')
                                }
                            }
                        }}
                        allowClear
                        onChange={(e) => {
                            setFieldCheckboxOption({ ...fielCheckBoxOption, optionName: e.target.value })
                        }}
                        style={{ width: '100%' }}
                        className='edit-checkbox-issue_setting'
                        placeholder='Enter your value' /> : <Input className='edit-checkbox-issue_setting' value={data?.optionName} disabled={index !== -1} />
                }
            </div>
            {
                is_edited ? <Button onClick={() => {
                    console.log("positionNewIssueTagAdded.data", positionNewIssueTagAdded.data.default_value);
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
