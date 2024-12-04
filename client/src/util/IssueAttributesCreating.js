import Component from "../child-components/Issue-Attributes/Component/Component";
import CurrentSprint from "../child-components/Issue-Attributes/Current-Sprint/CurrentSprint";
import EpicLink from "../child-components/Issue-Attributes/Epic-Link/EpicLink";
import FixVersion from "../child-components/Issue-Attributes/Fix-Version/FixVersion";
import Parent from "../child-components/Issue-Attributes/Parent/Parent";
import { updateInfoIssue } from "../redux/actions/IssueAction"
import { Tooltip } from 'antd';
import { getValueOfObjectFieldInIssue, getValueOfStringFieldInIssue } from "./IssueFilter";
import StoryPoint from "../child-components/Issue-Attributes/Story-Point/StoryPoint";
import StartEndDate from "../child-components/Issue-Attributes/Start-End-Date/StartEndDate";
import IssuePriority from "../child-components/Issue-Attributes/Issue-Priority/IssuePriority";
import TimeOriginalEstimate from "../child-components/Issue-Attributes/Time-Original-Estimate/TimeOriginalEstimate";
import Description from "../child-components/Issue-Attributes/Description/Description";
import Assignees from "../child-components/Issue-Attributes/Assignees/Assignees";
import Approvers from "../child-components/Issue-Attributes/Approvers/Approvers";
import ActualStartEndDate from "../child-components/Issue-Attributes/Actual-Start-End-Date/ActualStartEndDate";
import Impact from "../child-components/Issue-Attributes/Impact/Impact";
import Label from "../child-components/Issue-Attributes/Label/Label";
import ChangeReason from "../child-components/Issue-Attributes/ChangeReason/ChangeReason";
import ChangeRisk from "../child-components/Issue-Attributes/ChangeRisk/ChangeRisk";
import Reporter from "../child-components/Issue-Attributes/Reporter/Reporter";
import ShortTextField from "../child-components/Issue-Attributes/ShortTextField/ShortTextField";
import ParagraphField from "../child-components/Issue-Attributes/ParagraphField/ParagraphField";
import NumberField from "../child-components/Issue-Attributes/NumberField/NumberField";
import DateField from "../child-components/Issue-Attributes/DateField/DateField";
import TimeStampField from "../child-components/Issue-Attributes/TimestampField/TimestampField";
import DropDown from "../child-components/Issue-Setting/New-Tags-Created/DropDown/DropDown";
import SingleUserField from "../child-components/Issue-Attributes/SingleUserField/SingleUserField";
import MultiUserField from "../child-components/Issue-Attributes/MultiUserField/MultiUserField";
import ChangeType from "../child-components/Issue-Attributes/ChaneType/ChangeType";
import URLField from "../child-components/Issue-Attributes/URLField/URLField";
export const attributesFiltering = (projectInfo, props) => {
    const issue_data_type_array = []
    const issue_data_type_number = [{ field_key_issue: 'issue_status', value: props.issue_status, pinned: false, is_display: true }]
    const issue_data_type_string = []
    const issue_data_type_object = []
    const issue_data_type_array_object = []

    const issuesTemplateForCreating = projectInfo?.issue_fields_config
    const tempIssueData = props.issue_status
    delete props['issue_status']
    const objs = Object.keys(props)
    issuesTemplateForCreating?.forEach((issue) => {
        const indexField = issue.field_position_display.findIndex(status => status.issue_status === tempIssueData)
        if (indexField !== -1) {
            const template = {
                field_key_issue: issue.field_key_issue,
                value: issue.default_value,
                pinned: false,
                is_display: true,
                field_name: issue.field_name,
                position: issue.field_position_display[indexField].position
            }

            const index = objs.findIndex(field => field === template.field_key_issue)
            if (index !== -1) {
                template['value'] = props[objs[index]]
                delete props[objs[index]]
            }

            if (issue.field_type_in_issue === 'string') {
                if (Array.isArray(issue.default_value)) {
                    template.value = null
                }
                issue_data_type_string.push(template)
            }
            else if (issue.field_type_in_issue === 'number') {
                issue_data_type_number.push(template)
            } else if (issue.field_type_in_issue === 'array') {
                issue_data_type_array.push(template)
            } else if (issue.field_type_in_issue === 'object') {
                if (issue.field_key_issue === 'current_sprint') {
                    template['propertyModel'] = 'sprints'
                }
                else if (issue.field_key_issue === 'issue_type') {
                    template['propertyModel'] = 'issueProcesses'
                }
                else if (issue.field_key_issue === 'reporter') {
                    template['propertyModel'] = 'users'
                }
                else if (issue.field_key_issue === 'epic_link') {
                    template['propertyModel'] = 'epics'
                }
                else if (issue.field_key_issue === 'fix_version') {
                    template['propertyModel'] = 'versions'
                }
                else if (issue.field_key_issue === 'parent') {
                    template['propertyModel'] = 'issues'
                }
                issue_data_type_object.push(template)
            } else if (issue.field_type_in_issue === 'array-object') {
                if (issue.field_key_issue === 'assignees') {
                    template['propertyModel'] = 'users'
                } else if (issue.field_key_issue === 'old_sprint') {
                    template['old_sprint'] = 'sprints'
                } else if (issue.field_key_issue === 'approvers') {
                    template['propertyModel'] = 'users'
                } else if (issue.field_key_issue === 'component') {
                    template['propertyModel'] = 'components'
                }
                issue_data_type_array_object.push(template)
            }
        }
    })

    return {
        project_id: props.project_id,
        creator: props.creator,
        issue_data_type_array: issue_data_type_array,
        issue_data_type_number: issue_data_type_number,
        issue_data_type_string: issue_data_type_string,
        issue_data_type_object: issue_data_type_object,
        issue_data_type_array_object: issue_data_type_array_object,
        ...props
    }
}

export const renderField = (
    field,
    handleEditAttributeTag,
    editAttributeTag,
    issueInfo,
    projectInfo,
    userInfo,
    sprintList,
    id,
    epicList,
    versionList,
    componentList
) => {
    if (field === 'current_sprint') {
        return <CurrentSprint
            handleEditAttributeTag={handleEditAttributeTag}
            editAttributeTag={editAttributeTag}
            issueInfo={issueInfo}
            projectInfo={projectInfo}
            id={id}
            userInfo={userInfo}
            sprintList={sprintList} />
    }
    else if (field === 'reporter') {
        return <Reporter issueInfo={issueInfo} />
    }
    else if (field === 'start_date') {
        return <StartEndDate handleEditAttributeTag={handleEditAttributeTag}
            editAttributeTag={editAttributeTag}
            date={getValueOfStringFieldInIssue(issueInfo, "start_date")}
            projectInfo={projectInfo}
            name_date="Start Date"
            type_date="start_date"
            userInfo={userInfo}
            issueInfo={issueInfo}
        />
    }
    else if (field === 'end_date') {
        return <StartEndDate handleEditAttributeTag={handleEditAttributeTag}
            editAttributeTag={editAttributeTag}
            date={getValueOfStringFieldInIssue(issueInfo, "end_date")}
            projectInfo={projectInfo}
            name_date="End Date"
            type_date="end_date"
            userInfo={userInfo}
            issueInfo={issueInfo}
        />
    }
    else if (field === 'issue_priority') {
        return <IssuePriority handleEditAttributeTag={handleEditAttributeTag}
            editAttributeTag={editAttributeTag}
            issueInfo={issueInfo}
            projectInfo={projectInfo}
            userInfo={userInfo} />
    }
    else if (field === 'actual_start') {
        return <ActualStartEndDate handleEditAttributeTag={handleEditAttributeTag}
            editAttributeTag={editAttributeTag}
            date={getValueOfStringFieldInIssue(issueInfo, "actual_start")}
            projectInfo={projectInfo}
            type_date="actual_start"
            userInfo={userInfo}
            issueInfo={issueInfo}
        />
    }
    else if (field === 'actual_end') {
        return <ActualStartEndDate handleEditAttributeTag={handleEditAttributeTag}
            editAttributeTag={editAttributeTag}
            date={getValueOfStringFieldInIssue(issueInfo, "actual_end")}
            projectInfo={projectInfo}
            type_date="actual_end"
            userInfo={userInfo}
            issueInfo={issueInfo}
        />
    }
    else if (field === 'story_point') {
        return <StoryPoint handleEditAttributeTag={handleEditAttributeTag}
            editAttributeTag={editAttributeTag}
            issueInfo={issueInfo}
            projectInfo={projectInfo}
            userInfo={userInfo} />
    }
    else if (field === 'timeOriginalEstimate') {
        return <TimeOriginalEstimate handleEditAttributeTag={handleEditAttributeTag}
            editAttributeTag={editAttributeTag}
            projectInfo={projectInfo}
            issueInfo={issueInfo}
            userInfo={userInfo} />
    }
    else if (field === 'epic_link') {
        return <EpicLink
            handleEditAttributeTag={handleEditAttributeTag}
            editAttributeTag={editAttributeTag}
            issueInfo={issueInfo}
            projectInfo={projectInfo}
            id={id}
            userInfo={userInfo}
            epicList={epicList} />
    }
    else if (field === 'fix_version') {
        return <FixVersion
            handleEditAttributeTag={handleEditAttributeTag}
            editAttributeTag={editAttributeTag}
            issueInfo={issueInfo}
            projectInfo={projectInfo}
            id={id}
            userInfo={userInfo}
            versionList={versionList} />
    }
    else if (field === 'impact') {
        return <Impact
            handleEditAttributeTag={handleEditAttributeTag}
            editAttributeTag={editAttributeTag}
            issueInfo={issueInfo}
            projectInfo={projectInfo}
            userInfo={userInfo} />
    }
    else if (field === 'label') {
        return <Label
            handleEditAttributeTag={handleEditAttributeTag}
            editAttributeTag={editAttributeTag}
            issueInfo={issueInfo}
            projectInfo={projectInfo}
            userInfo={userInfo} />
    }
    else if (field === 'parent') {
        return <Parent
            projectInfo={projectInfo}
            userInfo={userInfo}
            issueInfo={issueInfo}
            issueParentInfo={getValueOfObjectFieldInIssue(issueInfo, "parent")} />
    }
    else if (field === 'change_reason') {
        return <ChangeReason
            handleEditAttributeTag={handleEditAttributeTag}
            editAttributeTag={editAttributeTag}
            issueInfo={issueInfo}
            projectInfo={projectInfo}
            userInfo={userInfo} />
    }
    else if (field === 'change_risk') {
        return <ChangeRisk
            handleEditAttributeTag={handleEditAttributeTag}
            editAttributeTag={editAttributeTag}
            issueInfo={issueInfo}
            projectInfo={projectInfo}
            userInfo={userInfo} />
    }
    else if (field === 'component') {
        return <Component
            handleEditAttributeTag={handleEditAttributeTag}
            id={id}
            userInfo={userInfo}
            issueInfo={issueInfo}
            projectInfo={projectInfo}
            componentList={componentList}
            editAttributeTag={editAttributeTag} />
    }
    else if (field === 'change_type') {
        return <ChangeType
            handleEditAttributeTag={handleEditAttributeTag}
            editAttributeTag={editAttributeTag}
            issueInfo={issueInfo}
            projectInfo={projectInfo}
            userInfo={userInfo} />
    }
    else if (field?.includes("new-tag")) {
        if (field.includes('short_text')) {
            return <ShortTextField
                projectInfo={projectInfo}
                issueInfo={issueInfo}
                field_key_issue={field}
                userInfo={userInfo} />
        } else if (field.includes('paragraph')) {
            return <ParagraphField
                handleEditAttributeTag={handleEditAttributeTag}
                editAttributeTag={editAttributeTag}
                projectInfo={projectInfo}
                issueInfo={issueInfo}
                field_key_issue={field}
                userInfo={userInfo}
            />
        } else if (field.includes('number')) {
            return <NumberField
                handleEditAttributeTag={handleEditAttributeTag}
                editAttributeTag={editAttributeTag}
                field_key_issue={field}
                issueInfo={issueInfo}
                projectInfo={projectInfo}
                userInfo={userInfo} />
        } else if (field.includes('date')) {
            return <DateField
                handleEditAttributeTag={handleEditAttributeTag}
                editAttributeTag={editAttributeTag}
                date={getValueOfStringFieldInIssue(issueInfo, field)}
                projectInfo={projectInfo}
                field_key_issue={field}
                userInfo={userInfo}
                issueInfo={issueInfo} />
        } else if (field.includes('time_stamp')) {
            return <TimeStampField
                handleEditAttributeTag={handleEditAttributeTag}
                editAttributeTag={editAttributeTag}
                date={getValueOfStringFieldInIssue(issueInfo, field)}
                projectInfo={projectInfo}
                field_key_issue={field}
                userInfo={userInfo}
                issueInfo={issueInfo} />
        } else if (field.includes('time_stamp')) {
            return <DropDown
                handleEditAttributeTag={handleEditAttributeTag}
                editAttributeTag={editAttributeTag}
                projectInfo={projectInfo}
                field_key_issue={field}
                userInfo={userInfo}
                issueInfo={issueInfo} />
        } else if (field.includes('single_user')) {
            return <SingleUserField
                projectInfo={projectInfo}
                handleEditAttributeTag={handleEditAttributeTag}
                editAttributeTag={editAttributeTag}
                field_key_issue={field}
                userInfo={userInfo}
                issueInfo={issueInfo} />
        } else if (field.includes('multi_users')) {
            return <MultiUserField
                handleEditAttributeTag={handleEditAttributeTag}
                editAttributeTag={editAttributeTag}
                projectInfo={projectInfo}
                field_key_issue={field}
                userInfo={userInfo}
                issueInfo={issueInfo} />
        } else if (field.includes('url')) {
            return <URLField
                handleEditAttributeTag={handleEditAttributeTag}
                editAttributeTag={editAttributeTag}
                projectInfo={projectInfo}
                field_key_issue={field}
                userInfo={userInfo}
                issueInfo={issueInfo} />
        }
    }
}

export const aggregationFields = (issueInfo, status) => {
    var str = ''
    issueInfo?.issue_data_type_string?.filter(field => field.is_display && field.position === status && !['summary'].includes(field.field_key_issue))
        .map(field => str += field.field_name + ', ')
    issueInfo?.issue_data_type_number?.filter(field => field.is_display && field.position === status && !['issue_status'].includes(field.fieqld_key_issue))
        .map(field => str += field.field_name + ', ')
    issueInfo?.issue_data_type_object?.filter(field => field.is_display && field.position === status && !['issue_type'].includes(field.field_key_issue))
        .map(field => str += field.field_name + ', ')
    issueInfo?.issue_data_type_array?.filter(field => field.is_display && field.position === status)
        .map(field => str += field.field_name + ', ')
    issueInfo?.issue_data_type_array_object?.filter(field => field.is_display && field.position === status)
        .map(field => str += field.field_name + ', ')
    return str.substring(0, str.length - 2).length > 30 ? `${str.substring(0, 30)}...` : str.substring(0, str.length - 2)
}

export const renderPinnedField = (issueInfo) => {
    const data1 = issueInfo?.issue_data_type_string?.filter(field => !['summary'].includes(field.field_key_issue) && field.pinned)
    const data2 = issueInfo?.issue_data_type_number?.filter(field => !['issue_status', 'timeSpent'].includes(field.field_key_issue) && field.pinned)
    const data3 = issueInfo?.issue_data_type_object?.filter(field => !['issue_type'].includes(field.field_key_issue) && field.pinned)
    const data4 = issueInfo?.issue_data_type_array?.filter(field => field.pinned)
    const data5 = issueInfo?.issue_data_type_array_object.filter(field => field.pinned)
    const data = data1?.concat(data2, data3, data4, data5)
    return Array.isArray(data) && data.length > 0 ? data : []
}

export const renderFieldStringIssue = (issueInfo, status, dispatch, projectInfo, userInfo, handleEditAttributeTag, editAttributeTag, sprintList, id, epicList, versionList) => {
    const getAllIssuesValidCondition = issueInfo?.issue_data_type_string?.filter(field => field.position === status && !['summary'].includes(field.field_key_issue) && !field.pinned)
    const data = getAllIssuesValidCondition?.map(field => {
        if (field.field_key_issue === 'description') {
            return <div>
                <p style={{ fontWeight: 'bold', fontSize: '15px', marginBottom: 5 }}>Description</p>
                <Description projectInfo={projectInfo} issueInfo={issueInfo} userInfo={userInfo} />
            </div>
        }
        if(!field?.is_display) return null
        return <div className="row d-flex align-items-center mt-2 mb-2 items-field">
            <span className={`${status === 0 ? 'col-3' : 'col-5'} d-flex align-items-center`} style={{ fontSize: 14, color: '#42526e', fontWeight: '500', display: 'flex', alignItems: 'center' }}>
                {field.field_name}
                {status !== 0 ? <Tooltip placement="topRight" title="Pin to top">
                    {!field.pinned ? <a style={{ color: '#000' }} className="ml-2 field-pinned" onClick={() => {
                        dispatch(updateInfoIssue(issueInfo._id, issueInfo.project_id, {
                            [field.field_key_issue]: !field.pinned
                        }, null, null, userInfo.id, 'pinned', field.field_name, projectInfo, userInfo))
                    }}><i className="fa fa-thumbtack"></i></a> : <></>}
                </Tooltip> : <></>}
            </span>
            <div className={`${status === 0 ? 'col-8' : 'col-7'} item-value_field`}>
                {renderField(field.field_key_issue, handleEditAttributeTag, editAttributeTag, issueInfo, projectInfo, userInfo, sprintList, id, epicList, versionList, [])}
            </div>
        </div>
    })

    return data?.filter(field => field !== null)
}

export const renderFieldNumberIssue = (issueInfo, status, dispatch, projectInfo, userInfo, handleEditAttributeTag, editAttributeTag, sprintList, id, epicList, versionList) => {
    const getAllIssuesValidCondition = issueInfo?.issue_data_type_number?.filter(field => field.position === status && !['issue_status', 'timeSpent'].includes(field.field_key_issue) && !field.pinned)
    const data = getAllIssuesValidCondition?.map(field => {
        if(!field?.is_display) return null
        return <div className="row d-flex align-items-center mt-2 mb-2 items-field">
            <span className={`${status === 0 ? 'col-3' : 'col-5'} d-flex align-items-center`} style={{ fontSize: 14, color: '#42526e', fontWeight: '500', display: 'flex', alignItems: 'center' }}>
                {field.field_name}
                {status !== 0 ? <Tooltip placement="topRight" title="Unpin">
                    {!field.pinned ? <a style={{ color: '#000' }} className="ml-2 field-pinned" onClick={() => {
                        dispatch(updateInfoIssue(issueInfo._id, issueInfo.project_id, {
                            [field.field_key_issue]: !field.pinned
                        }, null, null, userInfo.id, 'pinned', field.field_name, projectInfo, userInfo))
                    }}><i className="fa fa-thumbtack"></i></a> : <></>}
                </Tooltip> : <></>}
            </span>
            <div className={`${status === 0 ? 'col-8' : 'col-7'} item-value_field`}>
                {renderField(field.field_key_issue, handleEditAttributeTag, editAttributeTag, issueInfo, projectInfo, userInfo, sprintList, id, epicList, versionList, [])}
            </div>
        </div>
    })

    return data?.filter(field => field !== null)
}

export const renderFieldObjectIssue = (issueInfo, status, dispatch, projectInfo, userInfo, handleEditAttributeTag, editAttributeTag, sprintList, id, epicList, versionList) => {
    const getAllIssuesValidCondition = issueInfo?.issue_data_type_object?.filter(field => field.position === status && !['issue_type'].includes(field.field_key_issue) && !field.pinned)
    const data = getAllIssuesValidCondition?.map(field => {
        if(!field?.is_display) return null
        return <div className="row d-flex align-items-center mt-2 mb-2 items-field">
            <span className={`${status === 0 ? 'col-3' : 'col-5'} d-flex align-items-center`} style={{ fontSize: 14, color: '#42526e', fontWeight: '500', display: 'flex', alignItems: 'center' }}>
                {field.field_name}
                {status !== 0 ? <Tooltip placement="topRight" title="Unpin">
                    {!field.pinned ? <a style={{ color: '#000' }} className="ml-2 field-pinned" onClick={() => {
                        dispatch(updateInfoIssue(issueInfo._id, issueInfo.project_id, {
                            [field.field_key_issue]: !field.pinned
                        }, null, null, userInfo.id, 'pinned', field.field_name, projectInfo, userInfo))
                    }}><i className="fa fa-thumbtack"></i></a> : <></>}
                </Tooltip> : <></>}
            </span>
            <div className={`${status === 0 ? 'col-8' : 'col-7'} item-value_field`}>
                {renderField(field.field_key_issue, handleEditAttributeTag, editAttributeTag, issueInfo, projectInfo, userInfo, sprintList, id, epicList, versionList, [])}
            </div>
        </div>
    })

    return data?.filter(field => field !== null)
}

export const renderFieldArrayIssue = (issueInfo, status, dispatch, projectInfo, userInfo, handleEditAttributeTag, editAttributeTag, sprintList, id, epicList, versionList) => {
    const getAllIssuesValidCondition = issueInfo?.issue_data_type_array?.filter(field => field.position === status && !field.pinned)
    const data = getAllIssuesValidCondition?.map(field => {
        if(!field?.is_display) return null
        return <div className="row d-flex align-items-center mt-2 mb-2 items-field">
            <span className={`${status === 0 ? 'col-3' : 'col-5'} d-flex align-items-center`} style={{ fontSize: 14, color: '#42526e', fontWeight: '500', display: 'flex', alignItems: 'center' }}>
                {field.field_name}
                {status !== 0 ? <Tooltip placement="topRight" title="Unpin">
                    {!field.pinned ? <a style={{ color: '#000' }} className="ml-2 field-pinned" onClick={() => {
                        dispatch(updateInfoIssue(issueInfo._id, issueInfo.project_id, {
                            [field.field_key_issue]: !field.pinned
                        }, null, null, userInfo.id, 'pinned', field.field_name, projectInfo, userInfo))
                    }}><i className="fa fa-thumbtack"></i></a> : <></>}
                </Tooltip> : <></>}
            </span>
            <div className={`${status === 0 ? 'col-8' : 'col-7'} item-value_field`}>
                {renderField(field.field_key_issue, handleEditAttributeTag, editAttributeTag, issueInfo, projectInfo, userInfo, sprintList, id, epicList, versionList, [])}
            </div>
        </div>
    })
    return data?.filter(field => field !== null)
}

export const renderFieldArrayObjectIssue = (issueInfo, status, dispatch, projectInfo, userInfo, handleEditAttributeTag, editAttributeTag, sprintList, id, epicList, versionList, componentList) => {
    const getAllIssuesValidCondition = issueInfo?.issue_data_type_array_object?.filter(field => field.position === status && !field.pinned)
    const data =  getAllIssuesValidCondition?.map(field => {
        if (field.field_key_issue === 'assignees') {
            return <div className="mb-2">
                <span style={{ fontSize: 14, color: '#42526e', fontWeight: '500', display: 'flex', alignItems: 'center' }}>{field.field_name}</span>
                <Assignees
                    projectInfo={projectInfo}
                    userInfo={userInfo}
                    issueInfo={issueInfo} />
            </div>
        }
        if (field.field_key_issue === 'approvers') {
            return <div className="mb-2">
                <span style={{ fontSize: 14, color: '#42526e', fontWeight: '500', display: 'flex', alignItems: 'center' }}>{field.field_name}</span>
                <Approvers
                    projectInfo={projectInfo}
                    userInfo={userInfo}
                    issueInfo={issueInfo} />
            </div>
        }
        if(!field?.is_display) return null
        return <div className="row d-flex align-items-center mt-2 mb-2 items-field">
            <span className={`${status === 0 ? 'col-3' : 'col-5'} d-flex align-items-center`} style={{ fontSize: 14, color: '#42526e', fontWeight: '500', display: 'flex', alignItems: 'center' }}>
                {field.field_name}
                {status !== 0 ? <Tooltip placement="topRight" title="Unpin">
                    {!field.pinned ? <a style={{ color: '#000' }} className="ml-2 field-pinned" onClick={() => {
                        dispatch(updateInfoIssue(issueInfo._id, issueInfo.project_id, {
                            [field.field_key_issue]: !field.pinned
                        }, null, null, userInfo.id, 'pinned', field.field_name, projectInfo, userInfo))
                    }}><i className="fa fa-thumbtack"></i></a> : <></>}
                </Tooltip> : <></>}
            </span>
            <div className={`${status === 0 ? 'col-8' : 'col-7'} item-value_field`}>
                {renderField(field.field_key_issue, handleEditAttributeTag, editAttributeTag, issueInfo, projectInfo, userInfo, sprintList, id, epicList, versionList, componentList)}
            </div>
        </div>
    })
    return data?.filter(field => field !== null)
}