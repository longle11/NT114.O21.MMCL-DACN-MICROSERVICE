import React, { useRef } from 'react'
import { calculateTimeAfterSplitted, convertMinuteToFormat, validateOriginalTime } from '../../../validations/TimeValidation'
import { showNotificationWithIcon } from '../../../util/NotificationUtil'
import { updateInfoIssue } from '../../../redux/actions/IssueAction'
import { useDispatch } from 'react-redux'
import { checkConstraintPermissions } from '../../../util/CheckConstraintFields'
import { getValueOfNumberFieldInIssue } from '../../../util/IssueFilter'

export default function TimeOriginalEstimate(props) {
    const issueInfo = props.issueInfo
    const userInfo = props.userInfo
    const projectInfo = props.projectInfo


    //su dung cho debounce time original
    const inputTimeOriginal = useRef(null)

    const dispatch = useDispatch()
    return (
        <div className="estimate">
            {props.editAttributeTag === 'originalTimeEstimate' ? <div>
                <input style={{ marginBottom: '3px' }} className="estimate-hours" onChange={(e) => {
                    //kiem tra gia tri co khac null khong, khac thi xoa
                    if (inputTimeOriginal.current) {
                        clearTimeout(inputTimeOriginal.current)
                    }
                    inputTimeOriginal.current = setTimeout(() => {

                    }, 3000)
                }} disabled={issueInfo?.creator._id !== userInfo?.id}
                    defaultValue={getValueOfNumberFieldInIssue(issueInfo, "timeOriginalEstimate") ? convertMinuteToFormat(getValueOfNumberFieldInIssue(issueInfo, "timeOriginalEstimate")) : null}
                    onBlur={(e) => {
                        props.handleEditAttributeTag('')
                        if (validateOriginalTime(e.target.value)) {
                            const oldValue = calculateTimeAfterSplitted(getValueOfNumberFieldInIssue(issueInfo, "timeOriginalEstimate") ? getValueOfNumberFieldInIssue(issueInfo, "timeOriginalEstimate") : 0)
                            const newValue = calculateTimeAfterSplitted(e.target.value)
                            dispatch(updateInfoIssue(issueInfo?._id, projectInfo?._id, { timeOriginalEstimate: newValue }, oldValue, newValue, userInfo.id, "updated", "time original estimate", projectInfo, userInfo))
                            showNotificationWithIcon('success', '', "Truong du lieu hop le")
                        } else {
                            showNotificationWithIcon('error', '', "Truong du lieu nhap vao khong hop le")
                        }
                    }}
                />
                <small>Format: <span className='text-danger'>2w3d4h5m</span></small>
            </div> :
                <span onDoubleClick={() => {
                    if(checkConstraintPermissions(projectInfo, issueInfo, userInfo, 1)) {
                        props.handleEditAttributeTag('originalTimeEstimate')
                    }
                }} style={{ width: '100%', color: '#7A869A' }}>{Number.isInteger(getValueOfNumberFieldInIssue(issueInfo, "timeOriginalEstimate")) ? convertMinuteToFormat(getValueOfNumberFieldInIssue(issueInfo, "timeOriginalEstimate")) : "None"}</span>}
        </div>
    )
}
