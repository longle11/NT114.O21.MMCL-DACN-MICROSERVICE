import { Select } from 'antd'
import React from 'react'
import { useDispatch } from 'react-redux'
import { updateInfoIssue } from '../../../redux/actions/IssueAction'
import { updateEpic } from '../../../redux/actions/CategoryAction'
import { renderEpicList } from '../../../util/CommonFeatures'

export default function EpicLink(props) {
    const issueInfo = props.issueInfo
    const userInfo = props.userInfo
    const id = props.id
    const epicList = props.epicList
    const dispatch = useDispatch()
    const getCurrentEpic = () => {
        if (issueInfo?.epic_link === null) {
            return null
        }
        return epicList?.findIndex(epic => epic._id.toString() === issueInfo?.epic_link?._id.toString())
    }
    return (
        <div className='row epic-version d-flex align-items-center mt-2'>
            <span className='col-4' style={{ fontSize: 14, color: '#42526e', fontWeight: '500' }}>Epic Link</span>
            {props.editAttributeTag === 'epic_link' ? <Select className="col-7" style={{ width: '100%', padding: 0 }}
                options={renderEpicList(epicList, id)}
                onBlur={() => {
                    props.handleEditAttributeTag('')
                }}
                onChange={(value, props) => {
                    //assign issue to new epic
                    dispatch(updateInfoIssue(issueInfo?._id.toString(), issueInfo?.project_id?._id.toString(), { epic_link: value }, issueInfo?.epic_link === null ? "None" : issueInfo?.epic_link.epic_name, props.label, userInfo.id, "updated", "epic link"))
                    //update new issue in epic
                    dispatch(updateEpic(value, { issue_id: issueInfo?._id.toString(), epic_id: issueInfo?.epic_link === null ? null : issueInfo?.epic_link._id.toString() }, issueInfo?.project_id?._id.toString()))
                }}
                value={issueInfo?.epic_link?.epic_name}
            /> :
                <span onDoubleClick={() => {
                    props.handleEditAttributeTag('epic_link')
                }} className='items-attribute col-7' style={{ padding: '10px 10px', width: '100%', color: '#7A869A' }}>{getCurrentEpic() !== null ? renderEpicList()[getCurrentEpic()]?.label : "None"}</span>}
        </div>
    )
}
