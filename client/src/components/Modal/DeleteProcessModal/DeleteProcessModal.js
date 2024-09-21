import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { handleChildClickOk, openChildModal } from '../../../redux/actions/ModalAction'
import { Select } from 'antd'
import { updateManyIssueAction } from '../../../redux/actions/IssueAction'
import { deleteProcessAction } from '../../../redux/actions/CreateProjectAction'

export default function DeleteProcessModal(props) {
    const processList = props.processList
    const sprintInfo = props.sprintInfo
    const currentProcess = props.process
    const issue_list = props.issue_list
    const dispatch = useDispatch()

    const [selectNewProcess, setSelectNewProcess] = useState(null)
    useEffect(() => {
        dispatch(handleChildClickOk(handleSelectIssueOk))
    }, [selectNewProcess])
    const renderProcessListOptions = (currentProcessId) => {
        var processListOptions = []
        processList.filter(process => {
            if (process._id.toString() !== currentProcessId) {
                const processOption = {
                    label: <span style={{ backgroundColor: process.tag_color, width: '100%', height: '100%', display: 'block' }}>{process.name_process}</span>,
                    value: process._id.toString()
                }
                processListOptions.push(processOption)
                return true
            }
            return false
        })
        return processListOptions
    }
    const handleSelectIssueOk = () => {
        console.log("selectNewProcess ", selectNewProcess);
        
        if (selectNewProcess !== null) {
            //proceed to update all issues in current process to new process
            dispatch(updateManyIssueAction(sprintInfo._id, { issue_list: issue_list, new_issue_type: selectNewProcess }))
            dispatch(deleteProcessAction(currentProcess._id, currentProcess.project_id))
            setSelectNewProcess(null)
        }
        dispatch(openChildModal(false))
    }
    return (
        <div>
            <div className='d-flex align-items-center'>
                <i className="fa fa-exclamation-triangle mr-2" style={{ fontSize: 20 }}></i>
                <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Move work from <span>{currentProcess?.name_process}</span> column</span>
            </div>
            <p>Select a new home for any work with the <span>{currentProcess?.name_process}</span> status, including work in the backlog.</p>
            <div className='d-flex justify-content-between align-items-center'>
                <div className='d-flex flex-column'>
                    <label htmlFor='currentProcess'>This status will be deleted:</label>
                    <div style={{ textDecoration: 'line-through', backgroundColor: currentProcess?.tag_color, display: 'inline' }}>{currentProcess?.name_process}</div>
                </div>
                <i className="fa fa-long-arrow-alt-right"></i>
                <div className='d-flex flex-column'>
                    <label htmlFor='newProcess?'>Move existing issues to:</label>
                    <Select
                        options={renderProcessListOptions(currentProcess?._id.toString())}
                        onSelect={(value) => {
                            setSelectNewProcess(value)
                        }}
                    />
                </div>
            </div>
        </div>
    )
}
