import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { checkConstraintPermissions } from '../../../util/CheckConstraintFields'
import { getValueOfStringFieldInIssue } from '../../../util/IssueFilter'
import { Input } from 'antd'
import { eyeSlashIcon } from '../../../util/icon'
import { NavLink } from 'react-router-dom'
import { updateInfoIssue } from '../../../redux/actions/IssueAction'

export default function URLField(props) {
    const issueInfo = props.issueInfo
    const userInfo = props.userInfo
    const field_key_issue = props.field_key_issue
    const projectInfo = props.projectInfo

    const [urlValue, setUrlValue] = useState(getValueOfStringFieldInIssue(issueInfo, field_key_issue))
    const dispatch = useDispatch()
    return (
        <div className="mt-2">
            <div style={{ display: props.editAttributeTag === field_key_issue ? 'none' : 'block' }}>
                <div className='d-flex flex-column'>
                    {
                        checkConstraintPermissions(projectInfo, issueInfo, userInfo, 9) ?
                            (typeof urlValue === 'string' ? <NavLink to={urlValue}>{urlValue}</NavLink> : <span style={{ width: 'fit-content' }}>None</span>) : eyeSlashIcon
                    }
                    {
                        checkConstraintPermissions(projectInfo, issueInfo, userInfo, 1) ? <div style={{ width: '100%', marginTop: 5 }}>
                            <button onKeyDown={() => { }} className='text-primary ml-3 mt-2 mb-2 btn bg-transparent ml-2' style={{ width: 'max-content', fontSize: '12px', margin: '0px', cursor: 'pointer', padding: 0, textAlign: 'left' }} onClick={() => {
                                props.handleEditAttributeTag(field_key_issue)
                            }} >
                                <i className="fa fa-plus" style={{ marginRight: 5 }} />Edit
                            </button>
                        </div> : <></>
                    }
                </div>
            </div>

            {props.editAttributeTag === field_key_issue ? (
                <div>
                    <Input
                        defaultValue={urlValue}
                        value={urlValue}
                        onChange={(e) => {
                            setUrlValue(prev => e.target.value.trim())
                        }}
                        onBlur={() => {
                            if (urlValue && urlValue?.trim() !== '') {
                                dispatch(updateInfoIssue(issueInfo?._id, issueInfo.project_id._id, { [field_key_issue]: urlValue }, null, null, userInfo.id, "updated", field_key_issue, projectInfo, userInfo))
                            }
                            props.handleEditAttributeTag('')
                        }}
                    />
                </div>
            ) : <></>}
        </div>
    )
}
