import { DatePicker, Input, Select } from 'antd'
import React, { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import { withFormik } from 'formik'
import { showNotificationWithIcon } from '../../../util/NotificationUtil';
import { connect, useDispatch } from 'react-redux';
import { submit_edit_form_action } from '../../../redux/actions/DrawerAction';
import { updateSprintAction } from '../../../redux/actions/CreateProjectAction';
const { TextArea } = Input;
function CreateSprint(props) {
    const durationOptions = [
        {
            label: '1 week',
            value: 1
        },
        {
            label: '2 weeks',
            value: 2
        },
        {
            label: '3 weeks',
            value: 3
        },
        {
            label: '4 weeks',
            value: 4
        },
        {
            label: 'custom',
            value: 5
        }
    ]
    const dispatch = useDispatch()
    useEffect(() => {
        dispatch(submit_edit_form_action(handleSubmit))
    })

    const { handleChange, handleSubmit, setFieldValue } = props
    const [startDate, setStartDate] = useState(null)
    const [endDate, setEndDate] = useState(null)
    const [duration, setDuration] = useState(5)
    const handleDateCustom = (time, value) => {
        if (value === 1) {
            const calEndDate = dayjs(time).add(7, 'd').format("YYYY-MM-DD hh:mm:ss")
            setEndDate(calEndDate)
            setFieldValue('end_date', calEndDate)
        } else if (value === 2) {
            const calEndDate = dayjs(time).add(14, 'd').format("YYYY-MM-DD hh:mm:ss")
            setEndDate(calEndDate)
            setFieldValue('end_date', calEndDate)
        } else if (value === 3) {
            const calEndDate = dayjs(time).add(21, 'd').format("YYYY-MM-DD hh:mm:ss")
            setEndDate(calEndDate)
            setFieldValue('end_date', calEndDate)
        } else if (value === 4) {
            const calEndDate = dayjs(time).add(28, 'd').format("YYYY-MM-DD hh:mm:ss")
            setEndDate(calEndDate)
            setFieldValue('end_date', calEndDate)
        }

    }
    return (
        <form onSubmit={handleSubmit}>
            <h6>Edit sprint: {props.currentSprint.sprint_name}</h6>
            <p>Required fields are marked with an asterisk *</p>
            <div className="form-group">
                <label htmlFor="sprint_name">Sprint name <span className='text-danger'>*</span></label>
                <input onChange={handleChange} className="form-control" id="sprint_name" defaultValue={props.currentSprint.sprint_name} />
            </div>
            <div className="form-group">
                <label htmlFor="duration">Duration</label>
                <Select id="duration"
                    style={{ width: '100%' }}
                    defaultValue={durationOptions[4]}
                    options={durationOptions}
                    onChange={(value) => {
                        setDuration(value)
                        handleDateCustom(startDate, value)
                    }}
                />
            </div>
            <div className="form-group">
                <label htmlFor="start_date">Start date</label>
                <DatePicker
                    showTime
                    name="start_date"
                    defaultValue={dayjs(props.currentSprint.start_date)}
                    onChange={(value, dateString) => {
                        console.log("ngay dang chon ", dateString);
                        setStartDate(dateString)
                        setFieldValue('start_date', dateString)
                        handleDateCustom(dateString, duration)
                    }}
                />
            </div>
            <div className="form-group">
                <label htmlFor="end_date">End name</label>
                {duration === 5 ? <DatePicker
                    showTime
                    name="end_date"
                    defaultValue={dayjs(props.currentSprint.end_date)}
                    onChange={(value, dateString) => {
                        setEndDate(dateString)
                        setFieldValue('end_date', dateString)
                    }}
                /> : <DatePicker value={dayjs(endDate)} showTime disabled />}
            </div>
            <div className="form-group">
                <label htmlFor="sprint_goal">Goal sprint <span className='text-danger'>*</span></label>
                <TextArea className='form-control' id="sprint_goal" rows={4} onChange={handleChange} defaultValue={props.currentSprint.sprint_goal}/>
            </div>
        </form>
    )
}

const handleSubmitUpdateSprint = withFormik({
    enableReinitialize: true,
    mapPropsToValues: (props) => {
        const templateSprint = props.currentSprint
        return {
            project_id: templateSprint.project_id,
            sprint_name: templateSprint.sprint_name,
            start_date: templateSprint.start_date,
            end_date: templateSprint.end_date,
            sprint_goal: templateSprint.sprint_goal,
        }
    },
    handleSubmit: (values, { props }) => {
        let checkSubmit = true
        console.log(values);

        if (values.sprint_name.trim() === "") {
            checkSubmit = false
            showNotificationWithIcon('error', 'Update sprint', 'Fields containing (*) can\'t left blank')
        }

        if (values.end_date !== null && values.start_date !== null) {
            if (dayjs(values.start_date) > dayjs(values.end_date)) {
                checkSubmit = false
                showNotificationWithIcon('error', 'Update sprint', 'Start date can not greater than end date')
            }
        }

        if (checkSubmit) {
            props.dispatch(updateSprintAction(props.currentSprint._id.toString(), values))
        }
    }
})(CreateSprint)

export default connect()(handleSubmitUpdateSprint)