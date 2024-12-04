import React, { useState } from 'react'
import OptionDropdown from '../../../Option-Dropdown/OptionDropdown'
import { Button } from 'antd'

export default function DropDown(props) {
    const positionNewIssueTagAdded = props.positionNewIssueTagAdded
    const setPositionNewIssueTagAdded = props.setPositionNewIssueTagAdded
    const [addOption, setAddOption] = useState(false)
    const is_edited = props.is_edited
    const issue_config = props.issue_config
    const renderOptions = () => {
        var tempArrs = []
        if (issue_config === null) { tempArrs = positionNewIssueTagAdded?.data?.default_value ? [...positionNewIssueTagAdded?.data?.default_value] : [] }
        else {
            if (issue_config?.default_value) {
                if (positionNewIssueTagAdded?.data?.default_value?.length !== issue_config?.default_value?.length) {
                    tempArrs = positionNewIssueTagAdded?.data?.default_value
                } else {
                    tempArrs = issue_config?.default_value
                }
            } else {
                tempArrs = []
            }
        }
        if (Array.isArray(tempArrs) && tempArrs?.length > 0) {
            return tempArrs?.map((data, index) => {
                return <OptionDropdown is_edited={is_edited} setAddOption={setAddOption} index={index} data={data} positionNewIssueTagAdded={positionNewIssueTagAdded} setPositionNewIssueTagAdded={setPositionNewIssueTagAdded} />
            })
        }
        return <></>
    }
    return (
        <div className='form-group'>
            <label>Options</label>
            <div>
                {renderOptions()}
                {addOption && is_edited ? <OptionDropdown is_edited={is_edited} setAddOption={setAddOption} index={-1} data={''} positionNewIssueTagAdded={positionNewIssueTagAdded} setPositionNewIssueTagAdded={setPositionNewIssueTagAdded} /> : <></>}
            </div>
            {is_edited ? <Button onClick={() => {
                setAddOption(true)
            }}>
                <i className="fa fa-plus mr-2"></i> Add option
            </Button> : <span></span>}
        </div>
    )
}
