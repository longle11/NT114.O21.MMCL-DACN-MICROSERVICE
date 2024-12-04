import React, { useEffect, useState } from 'react'
import { showNotificationWithIcon } from '../../../util/NotificationUtil'
import { calculateTimeAfterSplitted, convertMinuteToFormat, validateOriginalTime } from '../../../validations/TimeValidation'
import { DatePicker, Input } from 'antd'
import { useDispatch } from 'react-redux'
import { handleClickOk, openModal } from '../../../redux/actions/ModalAction'
import { createWorklogHistory, updateInfoIssue } from '../../../redux/actions/IssueAction'
import { getValueOfNumberFieldInIssue } from '../../../util/IssueFilter'

export default function TrackingTimeModal(props) {
    const issueInfo = props.issueInfo
    const userInfo = props.userInfo
    const projectInfo = props.projectInfo
    const [formData, setFormData] = useState({
        timeSpent: 0,
        dateWorking: '',
        description: '',
        timeRemaining: 0
    })
    const dispatch = useDispatch()
    useEffect(() => {
        dispatch(handleClickOk(handleClickOK))
    }, [formData])

    const handleClickOK = () => {
        if (typeof getValueOfNumberFieldInIssue(issueInfo, "timeOriginalEstimate") === "number") {
            dispatch(openModal(false))

            dispatch(updateInfoIssue(issueInfo?._id, issueInfo?.project_id?._id?.toString(), { timeSpent: formData.timeSpent }, getValueOfNumberFieldInIssue(issueInfo, "timeSpent")?.toString(), formData.timeSpent?.toString(), userInfo.id, "updated", "time spent"))
            dispatch(createWorklogHistory({
                issue_id: issueInfo._id.toString(),
                creator: userInfo.id,
                working_date: formData.dateWorking,
                description: formData.description,
                timeSpent: convertMinuteToFormat(formData.timeSpent)
            }, projectInfo, userInfo, issueInfo))
        }else {
            showNotificationWithIcon('error', "", "Please input time original estimate before tracking")
        }
    }
    const compareTimeSpentWithTimeOriginal = (timeSpent) => {
        return getValueOfNumberFieldInIssue(issueInfo, "timeOriginalEstimate") >= calculateTimeAfterSplitted(timeSpent)
    }
    const [openDatePicker, setOpenDatePicker] = useState(false)

    return (
        <div>
            <div>
                {typeof getValueOfNumberFieldInIssue(issueInfo, "timeOriginalEstimate") === 'number' ? <p className='m-0 mb-1'>Time original estimate: <span className='text-danger'>{convertMinuteToFormat(getValueOfNumberFieldInIssue(issueInfo, "timeOriginalEstimate"))}</span></p> : <></>}
                {typeof getValueOfNumberFieldInIssue(issueInfo, "timeSpent") === "number" ? <p className='m-0 mb-1'>Time spent recorded: <span className='text-danger'>{convertMinuteToFormat(getValueOfNumberFieldInIssue(issueInfo, "timeSpent"))}</span></p> : <></>}
            </div>
            <div className='d-flex'>
                <div className='p-0 pr-2'>
                    <label htmlFor='timeSpent'>Time spent</label>
                    <Input name="timeSpent" onBlur={(e) => {
                        //tien hanh so sanh gia tri hien tai voi gia tri original
                        if (validateOriginalTime(e.target.value)) {
                            const timeOri = getValueOfNumberFieldInIssue(issueInfo, "timeOriginalEstimate")
                            const currentTime = calculateTimeAfterSplitted(e.target.value)
                            const timeSpe = currentTime + getValueOfNumberFieldInIssue(issueInfo, "timeSpent")
                            if (timeSpe > timeOri) {
                                showNotificationWithIcon('error', '', 'Time spent phai nho hon time original')
                                return
                            }
                            if (compareTimeSpentWithTimeOriginal(e.target.value)) {
                                const getTimeRemaining = timeOri - timeSpe

                                setFormData({
                                    ...formData,
                                    timeSpent: currentTime,
                                    timeRemaining: getTimeRemaining
                                })
                                showNotificationWithIcon('success', '', 'hop le nhe')
                            } else {
                                showNotificationWithIcon('error', '', 'Time spent phai nho hon time original')
                                setFormData({
                                    ...formData,
                                    timeSpent: 0,
                                    timeRemaining: 0
                                })
                            }
                        } else {
                            showNotificationWithIcon('error', '', 'Gia tri nhap vao khong hop le')
                            setFormData({
                                ...formData,
                                timeSpent: 0,
                                timeRemaining: 0
                            })
                        }
                    }} />
                </div>
                <div className='p-0 pl-2'>
                    <label htmlFor='timeRemaining'>Time remaining</label>
                    <Input name="timeRemaining" disabled value={formData.timeRemaining !== 0 ? convertMinuteToFormat(formData.timeRemaining) : 'None'} />
                </div>
            </div>
            <div className='d-flex flex-column mt-2'>
                <div className='description'>
                    <p>Use the format: 2w3d4h5m</p>
                    <ul>
                        <li>w = weeks</li>
                        <li>d = days</li>
                        <li>h = hours</li>
                        <li>m = minutes</li>
                    </ul>
                </div>
                <div className='starting-date d-flex flex-column'>
                    <label htmlFor='workingDate'>Date started <span className='text-danger'>*</span></label>
                    <DatePicker name='workingDate' style={{ width: '100%' }} open={openDatePicker} onClick={() => {
                        setOpenDatePicker(true)
                    }} onOk={() => {
                        setOpenDatePicker(false)
                    }} onChange={(date, dateString) => {
                        setFormData({
                            ...formData,
                            dateWorking: dateString
                        })
                    }} showTime />
                </div>
                <div className='description'>
                    <label htmlFor='workDescription'>Work description <span className='text-danger'>*</span></label>
                    <textarea name="workDescription" style={{ width: '100%', height: '100px' }} onChange={(e) => {
                        setFormData({
                            ...formData,
                            description: e.target.value
                        })
                    }} />
                </div>
            </div>
        </div>
    )
}
