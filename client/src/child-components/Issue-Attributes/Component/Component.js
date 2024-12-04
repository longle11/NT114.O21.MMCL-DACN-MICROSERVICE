import { Select, Tag } from 'antd'
import React from 'react'
import { useDispatch } from 'react-redux'
import { getValueOfArrayObjectFieldInIssue } from '../../../util/IssueFilter'
import { renderComponentList } from '../../../util/CommonFeatures'
import { updateInfoIssue } from '../../../redux/actions/IssueAction'
import { updateComponent } from '../../../redux/actions/CategoryAction'
import { checkConstraintPermissions } from '../../../util/CheckConstraintFields'
import { eyeSlashIcon } from '../../../util/icon'

export default function Component(props) {
    const issueInfo = props.issueInfo
    const userInfo = props.userInfo
    const id = props.id
    const componentList = props.componentList
    const projectInfo = props.projectInfo
    const dispatch = useDispatch()

    const getCurrentComponent = () => {
        const componentsInIssue = getValueOfArrayObjectFieldInIssue(issueInfo, "component")
        if (componentsInIssue === null || componentsInIssue?.length === 0) {
            return null
        }
        return componentsInIssue
    }

    return (
        <div className='component-version d-flex align-items-center'>
            {props.editAttributeTag === 'component' ? <Select
                className="info-item-field"
                style={{ width: '100%', padding: 0 }}
                options={renderComponentList(componentList, id)
                    ?.filter(component => {
                        if (!getCurrentComponent() || getCurrentComponent()?.length === 0) return true
                        return !getCurrentComponent()?.map(component => component?._id?.toString())?.includes(component.value)
                    })}
                onBlur={() => {
                    props.handleEditAttributeTag('')
                }}
                onSelect={async (value, props) => {
                    //assign issue to new component
                    dispatch(updateInfoIssue(
                        issueInfo?._id,
                        id,
                        { component: value },
                        null,
                        props.label,
                        userInfo.id,
                        "updated",
                        "component",
                        projectInfo,
                        userInfo
                    ))
                    dispatch(updateComponent(value, { issue_id: issueInfo?._id }, id))
                }}
            /> :
                <span className='d-flex flex-wrap' onDoubleClick={() => {
                    props.handleEditAttributeTag('component')
                    if (checkConstraintPermissions(projectInfo, issueInfo, userInfo, 1)) {
                        props.handleEditAttributeTag('component')
                    }
                }} style={{ width: '100%', color: '#7A869A' }}>
                    {
                        checkConstraintPermissions(projectInfo, issueInfo, userInfo, 9) ?
                            (getCurrentComponent() !== null && getCurrentComponent()?.length !== 0 ? getCurrentComponent()?.map(component => {
                                return <Tag>{component.component_name}</Tag>
                            }) : "None") : eyeSlashIcon
                    }
                </span>}
        </div>
    )
}
