import React, { useEffect, useState } from 'react'
import { handleClickOk, openModal } from '../../../redux/actions/ModalAction'
import { useDispatch } from 'react-redux'
import { Select } from 'antd'
import { iTagForIssueTypes } from '../../../util/CommonFeatures'
import { updateVersion } from '../../../redux/actions/CategoryAction'
import { updateInfoIssue } from '../../../redux/actions/IssueAction'
import { delay } from '../../../util/Delay'
import { showNotificationWithIcon } from '../../../util/NotificationUtil'

export default function SelectIssuesModal(props) {
    const issuesBacklog = props.issuesBacklog
    const versionInfo = props.versionInfo
    const userInfo = props.userInfo
    const dispatch = useDispatch()
    const [issues, setIssues] = useState([])
    useEffect(() => {
        dispatch(handleClickOk(handleSelectIssueOk))
    }, [issues])
    const handleSelectIssueOk = async () => {
        if (issues !== null && issues.length > 0 && versionInfo !== null && userInfo !== null && issuesBacklog !== null) {
            // console.log("issues ",issues);
            // console.log("versionInfo._id ", versionInfo._id);
            
            // add all issues to version
            dispatch(updateVersion(versionInfo._id, { issue_list: issues }))
            // add version id to issue
            const getIssueListInBacklog = issuesBacklog.filter(issue => issues.includes(issue._id))

            for (let index = 0; index < getIssueListInBacklog.length; index++) {
                dispatch(updateInfoIssue(getIssueListInBacklog[index]._id, getIssueListInBacklog[index].project_id._id, { fix_version: versionInfo._id }, getIssueListInBacklog[index].fix_version ? getIssueListInBacklog[index].fix_version.version_name : "None", versionInfo.version_name, userInfo.id, "updated", "version"))
                await delay(200)
            }
            dispatch(openModal(false))
            setIssues([])
        }else {
            console.log("issues ", issues);
            
            showNotificationWithIcon('error', '', 'da co loi xay ra')
        }
    }
    const renderOptions = () => {
        return issuesBacklog.map(issue => {
            return {
                label: <div className='d-flex align-items-center'>
                    <span className='mr-1'>{iTagForIssueTypes(issue.issue_status)}</span>
                    <span className='mr-1' style={{ fontWeight: 'bold' }}>WD-{issue.ordinal_number}</span>
                    <span>{issue.summary}</span>
                </div>,
                value: issue._id
            }
        })
    }
    return (
        <div>
            <h4>Add issues to this version</h4>
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
