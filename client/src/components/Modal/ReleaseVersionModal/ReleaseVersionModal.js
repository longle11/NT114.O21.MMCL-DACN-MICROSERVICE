import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { handleClickOk, openModal } from '../../../redux/actions/ModalAction'
import { NavLink } from 'react-router-dom'
import { DatePicker, Radio, Select, Space } from 'antd'
import dayjs from 'dayjs'
import { updateVersion } from '../../../redux/actions/CategoryAction'
import { updateInfoIssue } from '../../../redux/actions/IssueAction'
import { delay } from '../../../util/Delay'
import { showNotificationWithIcon } from '../../../util/NotificationUtil'

export default function ReleaseVersionModal(props) {
    const versionInfo = props.versionInfo
    const processList = props.processList
    const versionList = props.versionList
    const userInfo = props.userInfo
    const dispatch = useDispatch()
    const [endDate, setEndDate] = useState(versionInfo.end_date)
    const issuesUncompleted = versionInfo.issue_list.filter(issue => issue.issue_type !== processList[processList.length - 1])
    const [value, setValue] = useState(1);
    const [selectVersion, setSelectVersion] = useState(null);
    const issuesCompleted =
        useEffect(() => {
            dispatch(handleClickOk(handleClickOK))
        }, [endDate, value, selectVersion])
    const handleClickOK = async () => {
        if (endDate && dayjs(endDate).isAfter(versionInfo.start_date)) {
            dispatch(updateVersion(versionInfo._id, { end_date: dayjs(endDate).format("DD/MM/YYYY"), version_status: 1 }, versionInfo.project_id))
            if (value && issuesUncompleted.length !== 0) {
                var newVersionName = ""
                if (value === 1) {  //means move unresolved issues to other versions
                    if (selectVersion) {
                        //add all unresolved issues to new version
                        dispatch(updateVersion(value, { issue_list: issuesUncompleted.map(issue => issue._id) }, versionInfo.project_id))
                        newVersionName = versionList.filter(version => version._id === versionInfo._id)[0].version_name
                        console.log("newVersionName ", newVersionName);
                    } else {
                        showNotificationWithIcon('error', '', 'Please choose other sprints to store')
                        return
                    }
                } else {  //ignore all unresolved issues
                    newVersionName = "None"
                }
                //remove unresolved issues to current version
                dispatch(updateVersion(versionInfo._id, { remove_issue_list: issuesUncompleted.map(issue => issue._id.toString()), version_status: 1 }, versionInfo.project_id))

                //update info for issue
                for (let index = 0; index < issuesUncompleted.length; index++) {
                    //update info new version for issue 
                    dispatch(updateInfoIssue(issuesUncompleted[index]._id, issuesUncompleted[index].project_id, { fix_version: selectVersion }, versionInfo.name_version, newVersionName, userInfo.id, "updated", "version"))
                    await delay(300)
                }
            }
        } else {
            showNotificationWithIcon('error', '', 'The release day is not suitable, please choose the different days')
        }
        dispatch(openModal(false))
    }
    return (
        <div>
            <h5>{issuesCompleted?.length !== 0 ? <i className="fa fa-exclamation-triangle mr-2 text-warning"></i> : <></>} Release {versionInfo.version_name}</h5>
            {versionInfo.issue_list.length === 0 ? <div>
                <p><NavLink>0 issues</NavLink> will be released</p>
                <div className='d-flex flex-column'>
                    <label htmlFor='release_date'>Release Date</label>
                    <DatePicker style={{ width: '50%' }} name="release_date" onChange={(date, dateString) => {
                        setEndDate(dayjs(dateString, dayjs(dateString)))
                    }} defaultValue={dayjs(endDate, "DD/MM/YYYY")} value={dayjs(endDate, "DD/MM/YYYY")} />
                </div>
            </div> : <div>
                <p>This release contains {issuesUncompleted?.length === 1 ? <NavLink>1 unresolved issue</NavLink> : <NavLink>{issuesUncompleted?.length} unresolved issues</NavLink>}.</p>
                {issuesCompleted?.length !== 0 ? <div>
                    <div className='d-flex flex-column'>
                        <span className='text-bold mb-2'>Unresolved issues <span className='text-danger'>*</span></span>
                        <Radio.Group onChange={(value) => {
                            setValue(value.target.value)
                        }} defaultValue={null} value={value}>
                            <Space direction="vertical">
                                <Radio value={1}>
                                    <div className='d-flex flex-column'>
                                        <span>Move unresolved issues to</span>
                                        <Select
                                            showSearch
                                            placeholder="Select a version"
                                            onChange={(value) => {
                                                setSelectVersion(value)
                                            }}
                                            options={versionList?.filter(version => version._id !== versionInfo._id).map(version => {
                                                return {
                                                    label: version.version_name,
                                                    value: version._id
                                                }
                                            })}
                                        />
                                    </div>
                                </Radio>
                                <Radio value={2}>Ignore unresolved issues</Radio>
                            </Space>
                        </Radio.Group>
                    </div>
                    <div className='d-flex flex-column mt-2'>
                        <label htmlFor='release_date'>Release Date</label>
                        <DatePicker style={{ width: '50%' }} name="release_date" onChange={(date, dateString) => {
                            setEndDate(dayjs(dateString, dayjs(dateString)))
                        }} defaultValue={dayjs(endDate, "DD/MM/YYYY")} value={dayjs(endDate, "DD/MM/YYYY")} />
                    </div>
                </div> : <></>}
            </div>}
        </div>
    )
}
