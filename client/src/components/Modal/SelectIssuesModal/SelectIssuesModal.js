import React, { useEffect, useState } from 'react'
import { handleClickOk, openModal } from '../../../redux/actions/ModalAction'
import { useDispatch } from 'react-redux'
import { Select } from 'antd'
import { iTagForIssueTypes } from '../../../util/CommonFeatures'
import { updateInfoIssue } from '../../../redux/actions/IssueAction'
import { delay } from '../../../util/Delay'
import { getValueOfNumberFieldInIssue, getValueOfObjectFieldInIssue, getValueOfStringFieldInIssue } from '../../../util/IssueFilter'

export default function SelectIssuesModal(props) {
    const issuesInProject = props.issuesInProject
    const versionInfo = props.versionInfo
    const epicInfo = props.epicInfo
    const projectInfo = props.projectInfo
    const userInfo = props.userInfo
    const processInfo = props.processInfo
    const dispatch = useDispatch()
    const [issues, setIssues] = useState([])
    console.log("epicInfo ", epicInfo);

    useEffect(() => {
        dispatch(handleClickOk(handleSelectIssueOk))
    }, [issues])
    const handleSelectIssueOk = async () => {
        
        if (issues !== null && issues.length > 0 && userInfo !== null && issuesInProject !== null) {
            // if (versionInfo) {
            //     // add all issues to version
            //     dispatch(updateVersion(versionInfo._id, { issue_list: issues }, versionInfo.project_id))
            // }

            // if (epicInfo) {
            //     // add all issues to epic
            //     dispatch(updateEpic(epicInfo._id, { issue_list: issues }, epicInfo.project_id))
            // }

            // add version id to issue
            const getIssueListInProject = issuesInProject.filter(issue => issues.includes(issue._id))

            for (let index = 0; index < getIssueListInProject.length; index++) {
                if (versionInfo) {
                    dispatch(updateInfoIssue(
                        getIssueListInProject[index]._id,
                        getIssueListInProject[index].project_id._id,
                        {
                            fix_version: versionInfo._id,
                            issue_type: processInfo._id
                        },
                        getValueOfObjectFieldInIssue(getIssueListInProject[index], 'fix_version') ? getValueOfObjectFieldInIssue(getIssueListInProject[index], 'fix_version')?.version_name : "None",
                        versionInfo.version_name,
                        userInfo.id,
                        "updated",
                        "version",
                        projectInfo,
                        userInfo
                    ))
                }
                if (epicInfo) {
                    dispatch(updateInfoIssue(
                        getIssueListInProject[index]._id,
                        getIssueListInProject[index].project_id._id,
                        {
                            epic_link: epicInfo._id,
                            issue_type: processInfo._id
                        },
                        getValueOfObjectFieldInIssue(getIssueListInProject[index], 'epic_link') ? getValueOfObjectFieldInIssue(getIssueListInProject[index], 'epic_link')?.epic_name : "None",
                        epicInfo.epic_name,
                        userInfo.id,
                        "updated",
                        "epic",
                        projectInfo,
                        userInfo
                    ))
                }
                await delay(200)
            }
        }
        dispatch(openModal(false))
        setIssues([])
    }

const renderTemplate = (issue) => {
    return <div className='d-flex align-items-center'>
        <span className='mr-1'>{iTagForIssueTypes(getValueOfNumberFieldInIssue(issue, 'issue_status'), null, null, projectInfo?.issue_types_default)}</span>
        <span className='mr-1' style={{ fontWeight: 'bold' }}>WD-{issue.ordinal_number}</span>
        <span>{getValueOfStringFieldInIssue(issue, 'summary')}</span>
    </div>
}
const renderOptions = () => {
    if (versionInfo) {
        return issuesInProject?.filter(issue => (getValueOfObjectFieldInIssue(issue, 'fix_version') === null && getValueOfNumberFieldInIssue(issue, 'issue_status') !== 4)).map(issue => {
            return {
                label: renderTemplate(issue),
                value: issue._id
            }
        })
    } else if (epicInfo) {
        return issuesInProject?.filter(issue => (getValueOfObjectFieldInIssue(issue, 'epic_link') === null && getValueOfNumberFieldInIssue(issue, 'issue_status') !== 4)).map(issue => {
            return {
                label: renderTemplate(issue),
                value: issue._id
            }
        })
    }
    return []
}
return (
    <div>
        <h4>Add issues to this {versionInfo ? 'version' : 'epic'}</h4>
        <Select
            mode="tags"
            placeholder="Search by issue key or summary"
            onChange={(values) => {
                setIssues([...values])
            }}
            style={{
                width: '100%',
            }}
            options={renderOptions()}
        />
    </div>
)
}
