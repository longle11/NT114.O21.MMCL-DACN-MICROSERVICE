import { Button, Checkbox, Tag } from 'antd'
import React from 'react'
import { useParams } from 'react-router-dom'
import htmlParser from 'html-react-parser'
import './CardItemLeftFields.css'
import { useDispatch } from 'react-redux'
import { updateIssueTagProjectAction } from '../../../redux/actions/CreateProjectAction'
import { renderInterfaceForCreatingNewTag } from '../../../util/IssueTagSetting'
import { showNotificationWithIcon } from '../../../util/NotificationUtil'

export default function CardItemLeftFields(props) {
    const issue_config = props.issue_config
    const positionNewIssueTagAdded = props.positionNewIssueTagAdded
    const status = props.status
    const setPositionNewIssueTagAdded = props.setPositionNewIssueTagAdded
    const { id } = useParams()
    const dispatch = useDispatch()
    const renderButtonOptions = () => {
        if (positionNewIssueTagAdded?.isModifyAvailable === false) {
            var check = false
            if (['issue_type', 'issue_status', 'issue_priority', 'parent', 'assignees', 'summary', 'reporter', 'current_sprint', 'fix_version', 'epic_link'].includes(issue_config?.field_key_issue)) {
                check = true
            }
            return <Button disabled={check} onClick={() => {
                dispatch(updateIssueTagProjectAction(id, {
                    field_key_issue: issue_config?.field_key_issue,
                    position_display: issue_config?.field_position_display,
                    issue_status: status
                }))
            }}>Remove</Button>
        }
        else {
            return <div className='mr-2'>
                <Button type="primary" className='mr-1' onClick={() => {
                    if (positionNewIssueTagAdded.data.field_text !== null && positionNewIssueTagAdded.data?.field_text?.trim() !== "") {
                        dispatch(updateIssueTagProjectAction(id, {
                            field_key_issue: issue_config.field_key_issue,
                            field_name: positionNewIssueTagAdded?.data?.field_text,
                            field_description: positionNewIssueTagAdded?.data?.field_description,
                            default_value: positionNewIssueTagAdded?.data?.default_value,
                            is_required: positionNewIssueTagAdded?.data?.is_required,
                        }))
                    } else {
                        showNotificationWithIcon('error', '', 'Field (*) can\'t be blank')
                    }

                    setPositionNewIssueTagAdded({
                        isOpen: false,
                        positionOpen: -1,
                        id_issue_tag: -1,
                        isModifyAvailable: false,
                        isOpenCollapse: issue_config?.field_key_issue,
                        data: {
                            icon: null,
                            field_description: positionNewIssueTagAdded?.data?.field_description,
                            field_text: positionNewIssueTagAdded?.data?.field_text,
                            default_value: positionNewIssueTagAdded?.data?.default_value,
                            is_required: positionNewIssueTagAdded?.data?.is_required,
                            issue_status: 0
                        }
                    })
                }}>Save</Button>
                <Button onClick={() => {
                    setPositionNewIssueTagAdded({
                        isOpen: false,
                        positionOpen: -1,
                        id_issue_tag: -1,
                        isOpenCollapse: issue_config?.field_key_issue,
                        isModifyAvailable: false,
                        data: {
                            icon: null,
                            field_description: '',
                            field_text: null,
                            default_value: null,
                            is_required: false,
                            issue_status: 0
                        }
                    })
                }}>Cancel</Button>
            </div>
        }
    }
    return (
        issue_config?.field_position_display?.map(field => field.issue_status)?.includes(status) ? <div
            className="list-group-item list-group-item-action"
            style={{
                padding: '5px 20px',
                width: issue_config?.field_key_issue === 'issue_type' ? 'max-content' : '100%',
                cursor: ['issue_type', 'summary'].includes(issue_config?.field_key_issue) ? 'not-allowed' : 'pointer'
            }}>
            <div className='d-flex align-items-center justify-content-between'>
                <div className='description_field-info-left'>
                    <span className='mr-2'>{htmlParser(issue_config?.icon_field_type)}</span>
                    <span>{issue_config?.field_name}</span>
                </div>
                <div className='d-flex align-items-center ml-2'>
                    {issue_config?.is_required ? <Tag style={{ height: 'max-content' }} color='#ddd'>
                        <span className='font-weight-bold' style={{ color: '#44546F' }}>REQUIRED</span>
                    </Tag> : <></>}
                    {
                        !["issue_type", "summary"].includes(issue_config?.field_key_issue) ? <div className='description_field-info-right'>
                            <Button style={{ padding: '0 10px' }} className='ml-1'>
                                <i className="fa fa-ellipsis-h"></i>
                            </Button>
                            <Button
                                onClick={() => {
                                    if (issue_config?.field_key_issue === null || issue_config?.field_key_issue !== positionNewIssueTagAdded.isOpenCollapse) {
                                        setPositionNewIssueTagAdded({
                                            isOpen: false,
                                            positionOpen: -1,
                                            id_issue_tag: -1,
                                            isModifyAvailable: false,
                                            isOpenCollapse: issue_config?.field_key_issue,
                                            data: {
                                                icon: null,
                                                field_description: issue_config?.field_description,
                                                field_text: issue_config?.field_name,
                                                default_value: issue_config?.default_value,
                                                is_required: false,
                                                issue_status: 0
                                            }
                                        })
                                    } else {
                                        setPositionNewIssueTagAdded({
                                            isOpen: false,
                                            positionOpen: -1,
                                            id_issue_tag: -1,
                                            isModifyAvailable: false,
                                            isOpenCollapse: null,
                                            data: {
                                                icon: null,
                                                field_description: '',
                                                field_text: null,
                                                default_value: null,
                                                is_required: false,
                                                issue_status: 0
                                            }
                                        })
                                    }
                                }}
                                style={{ padding: '0 10px' }}
                                className='ml-1'>
                                <i className="fa fa-angle-down"></i>
                            </Button>
                        </div> : <></>
                    }
                </div>
            </div>
            <div className={`collapse-issue-setting d-none ${positionNewIssueTagAdded.isOpenCollapse === issue_config?.field_key_issue ? "show" : ""}`}>
                {
                    <div>
                        <div>
                            <div className="form-group">
                                <label htmlFor="field_text">Field Name <span className='text-danger'>*</span></label>
                                <input
                                    style={{ cursor: issue_config?.field_is_edited ? 'default' : 'not-allowed', fontSize: 13 }}
                                    disabled={!issue_config?.field_is_edited}
                                    type="field_text"
                                    className="form-control"
                                    id="field_text"
                                    onChange={e => {
                                        setPositionNewIssueTagAdded({ ...positionNewIssueTagAdded, isModifyAvailable: true, data: { ...positionNewIssueTagAdded.data, field_text: e.target.value } })
                                    }}
                                    defaultValue={issue_config?.field_name}
                                    placeholder="Name the field you seleted from the Create a field section."
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="field_description">Field Description</label>
                                <input
                                    style={{ cursor: issue_config?.field_is_edited ? 'default' : 'not-allowed', fontSize: 13 }}
                                    disabled={!issue_config?.field_is_edited}
                                    type="field_description"
                                    className="form-control"
                                    onChange={e => {
                                        setPositionNewIssueTagAdded({ ...positionNewIssueTagAdded, isModifyAvailable: true, data: { ...positionNewIssueTagAdded.data, field_description: e.target.value } })
                                    }}
                                    id="field_description"
                                    defaultValue={issue_config?.field_description}
                                    placeholder="Describe how people should you this field."
                                />
                            </div>
                            {
                                renderInterfaceForCreatingNewTag(
                                    issue_config?.field_type,
                                    issue_config?.field_is_edited,
                                    positionNewIssueTagAdded,
                                    setPositionNewIssueTagAdded,
                                    issue_config
                                )
                            }
                        </div>
                    </div>
                }
                <hr />
                <div className='d-flex justify-content-end'>
                    {issue_config?.field_is_edited ? <Checkbox
                        onChange={(e) => {
                            setPositionNewIssueTagAdded({ ...positionNewIssueTagAdded, isModifyAvailable: true, data: { ...positionNewIssueTagAdded.data, is_required: e.target.checked } })
                        }}
                        lassName='mr-2'>Require</Checkbox> : <Checkbox disabled={!issue_config?.field_is_edited}
                            checked={issue_config?.is_required}
                            className='mr-2'>Require</Checkbox>}
                    {
                        renderButtonOptions()
                    }
                </div>
            </div>
        </div> : <></>
    )
}
