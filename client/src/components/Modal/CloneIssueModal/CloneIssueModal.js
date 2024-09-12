import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { handleClickOk } from '../../../redux/actions/ModalAction'
import { Checkbox, Input } from 'antd'
import { createIssue } from '../../../redux/actions/IssueAction'

export default function CloneIssueModal(props) {
    const issue = props.issue
    const userInfo = props.userInfo
    const dispatch = useDispatch()
    const [summary, setSummary] = useState(`CLONE-${issue.summary}`)
    useEffect(() => {
        dispatch(handleClickOk(handleSelectIssueOk))
    }, [summary])
    const handleSelectIssueOk = () => {
        const newIssue = { ...issue, summary: summary, creator: userInfo.id }
        delete newIssue['_id']
        delete newIssue['createAt']
        delete newIssue['updateAt']
        dispatch(createIssue({ ...newIssue }, issue.project_id._id, userInfo.id, null, null))
    }
    return (
        <div>
            <div className='d-flex flex-column'>
                <label className='font-weight-bold' htmlFor='summary'>Summary</label>
                <Input style={{ width: '100%' }} defaultValue={`CLONE-${issue.summary}`} onChange={(e) => {
                    setSummary(e.target.value)
                }} />
            </div>
            <div className='d-flex flex-column'>
                <label className='font-weight-bold' htmlFor='link'>Includes</label>
                <Checkbox>Links</Checkbox>
            </div>
        </div>
    )
}
