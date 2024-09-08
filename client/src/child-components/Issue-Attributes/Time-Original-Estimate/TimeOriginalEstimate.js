import React from 'react'
import { calculateTimeAfterSplitted, convertMinuteToFormat, validateOriginalTime } from '../../../validations/TimeValidation'
import { showNotificationWithIcon } from '../../../util/NotificationUtil'
import { updateInfoIssue } from '../../../redux/actions/IssueAction'
import { useDispatch } from 'react-redux'

export default function TimeOriginalEstimate(props) {
    const issueInfo = props.issueInfo
    const userInfo = props.userInfo
    const projectInfo = props.projectInfo
    const dispatch = useDispatch()
    return (
        <div className="estimate mb-3">
            <span style={{ fontSize: 14, color: '#42526e', fontWeight: '500' }}>Original Estimate (hours)</span>
            {props.editAttributeTag === 'originalTimeEstimate' ? <div>
                <input style={{ marginBottom: '3px' }} className="estimate-hours" onChange={(e) => {
                    // //kiem tra gia tri co khac null khong, khac thi xoa
                    // if (inputTimeOriginal.current) {
                    //     clearTimeout(inputTimeOriginal.current)
                    // }
                    // inputTimeOriginal.current = setTimeout(() => {

                    // }, 3000)
                }} disabled={issueInfo?.creator._id !== userInfo?.id}
                    defaultValue={convertMinuteToFormat(issueInfo?.timeOriginalEstimate)}
                    onBlur={(e) => {
                        props.handleEditAttributeTag('')
                        if (validateOriginalTime(e.target.value)) {
                            const oldValue = calculateTimeAfterSplitted(issueInfo.timeOriginalEstimate ? issueInfo.timeOriginalEstimate : 0)
                            const newValue = calculateTimeAfterSplitted(e.target.value)
                            dispatch(updateInfoIssue(issueInfo?._id, projectInfo?._id, { timeOriginalEstimate: newValue }, oldValue, newValue, userInfo.id, "updated", "time original estimate"))
                            showNotificationWithIcon('success', '', "Truong du lieu hop le")
                        } else {
                            showNotificationWithIcon('error', '', "Truong du lieu nhap vao khong hop le")
                        }
                    }}
                />
                <small>Format: <span className='text-danger'>2w3d4h5m</span></small>
            </div> :
                <span onDoubleClick={() => {
                    props.handleEditAttributeTag('originalTimeEstimate')
                }} className='items-attribute ml-2' style={{ padding: '10px 10px', width: '100%', color: '#7A869A' }}>{Number.isInteger(issueInfo?.timeOriginalEstimate) ? convertMinuteToFormat(issueInfo?.timeOriginalEstimate) : "None"}</span>}
        </div>
    )
}
