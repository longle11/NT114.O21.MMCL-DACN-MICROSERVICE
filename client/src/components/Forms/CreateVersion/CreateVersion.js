import React, { useEffect, useState } from 'react'
import { DatePicker, Input } from 'antd';
import { withFormik } from 'formik';
import { connect, useDispatch } from 'react-redux';
import { submit_edit_form_action } from '../../../redux/actions/DrawerAction';
import dayjs from 'dayjs';
import { createVersion, updateVersion } from '../../../redux/actions/CategoryAction';
import { showNotificationWithIcon } from '../../../util/NotificationUtil';
function CreateVersion(props) {
    const dispatch = useDispatch()
    useEffect(() => {
        // //submit sự kiện để gửi lên form
        dispatch(submit_edit_form_action(handleSubmit))
        if (props.currentVersion?.start_date === null) {
            setFieldValue('start_date', dayjs().toISOString())
        }
        if (props.currentVersion?.end_date === null) {
            setFieldValue('end_date', dayjs().toISOString())
        }
        // eslint-disable-next-line
    }, [])

    const [startDate, setStartDate] = useState(props.currentVersion?.start_date ? dayjs(props.currentVersion?.start_date) : dayjs())
    const [endDate, setEndDate] = useState(props.currentVersion?.end_date ? dayjs(props.currentVersion?.end_date) : dayjs())

    const {
        handleChange,
        handleSubmit,
        setFieldValue   //giúp set lại giá trị value mà không thông qua hàm handlechange
    } = props;
    return (
        <form onSubmit={handleSubmit}>
            <h5>Create version</h5>
            <div className='name-version form-group'>
                <label htmlFor='version_name'>Name <span className='text-danger'>*</span></label>
                <Input defaultValue={props.currentVersion?.version_name} id="version_name" onChange={handleChange} placeholder='Enter your version' />
            </div>
            <div className='d-flex'>
                <div className='startdate-release'>
                    <p className='m-0'>Start date</p>
                    <DatePicker defaultValue={endDate} name='start_date'
                        value={startDate}
                        allowClear={false}
                        onChange={(date, dateString) => {
                            setFieldValue('start_date', dateString)
                            setStartDate(dayjs(dateString))
                        }} />
                </div>
                <div className='enddate-release ml-4'>
                    <p className='m-0'>Release date</p>
                    <DatePicker defaultValue={endDate}
                        value={endDate}
                        allowClear={false}
                        onChange={(date, dateString) => {
                            setFieldValue('end_date', dateString)
                            setEndDate(dayjs(dateString))
                        }} />
                </div>
            </div>
            <div className='description-version form-group mt-3'>
                <label htmlFor='description'>Description</label>
                <Input defaultValue={props.currentVersion?.description} id="description" onChange={handleChange} placeholder='Enter your description' />
            </div>
        </form>
    )
}

const handleSubmitForm = withFormik({
    enableReinitialize: true,
    mapPropsToValues: (props) => {
        const currentVersion = props.currentVersion

        return {
            project_id: currentVersion?.project_id,
            version_name: currentVersion?.version_name,
            description: currentVersion?.description,
            start_date: currentVersion?.start_date,
            end_date: currentVersion?.end_date
        }
    },
    handleSubmit: (values, { props }) => {
        if (props.currentVersion.id === null) {
            if (values.version_name.trim() !== "") {
                props.dispatch(createVersion({
                    project_id: values.project_id,
                    version_name: values.version_name,
                    description: values.description,
                    start_date: values.start_date,
                    end_date: values.end_date
                }))
            } else {
                showNotificationWithIcon('error', "", "Field * can not be left blank")
            }
        } else {
            if (values.version_name.trim() !== "") {
                props.dispatch(updateVersion(props.currentVersion.version_id, {
                    version_name: values.version_name,
                    description: values.description,
                    start_date: values.start_date,
                    end_date: values.end_date
                }, props.currentVersion.project_id))
            } else {
                showNotificationWithIcon('error', "", "Field * can not be left blank")
            }
        }
    }
})(CreateVersion)
export default connect()(handleSubmitForm)