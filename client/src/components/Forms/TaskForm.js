import { Editor } from '@tinymce/tinymce-react'
import { Button, Input, InputNumber, Select, Slider, Upload, message } from 'antd'
import React, { useEffect, useState } from 'react'
import { connect, useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { withFormik } from 'formik';
import { createIssue } from '../../redux/actions/IssueAction';
import { submit_edit_form_action } from '../../redux/actions/DrawerAction';
import { showNotificationWithIcon } from '../../util/NotificationUtil';
import { priorityTypeOptions, issueTypeOptions } from '../../util/CommonFeatures';
import { UploadOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import domainName from '../../util/Config';
import Axios from "axios";

function TaskForm(props) {
    const { handleChange, handleSubmit, setFieldValue } = props
    //theo doi thoi gian cua 1 task
    const [timeTracking, setTimeTracking] = useState({
        timeSpent: 0,
        timeRemaining: 0
    })
    const userInfo = useSelector(state => state.user.userInfo)

    const handlEditorChange = (content, editor) => {
        setFieldValue('description', content)
    }
    const { id } = useParams()

    useEffect(() => {
        //thiet lap id project cho withformik
        setFieldValue('projectId', id)
        // //submit sự kiện để gửi lên form
        dispatch(submit_edit_form_action(handleSubmit))
        // eslint-disable-next-line
    }, [])
    const dispatch = useDispatch()
    return (
        <div className='container-fluid'>
            <form onSubmit={handleSubmit}>
                <div className='row'>
                    <label htmlFor='name_project'>Project Name</label>
                    <Input value={'test'} disabled name='name_project' />
                </div>
                <div className='row mt-2'>
                    <div className='col-6 p-0 pr-5'>
                        <label htmlFor='issueType'>Issue Type</label>
                        <Select
                            defaultValue={issueTypeOptions[0]}
                            style={{ width: '100%' }}
                            options={issueTypeOptions}
                            onSelect={(value, option) => {
                                setFieldValue('issueType', value)
                            }}
                            name="issueType"
                        />
                    </div>
                    <div className='col-6 p-0'>
                        <label htmlFor='priority'>Priority</label>
                        <Select
                            defaultValue={priorityTypeOptions[0]}
                            style={{ width: '100%' }}
                            options={priorityTypeOptions}
                            onSelect={(value, option) => {
                                setFieldValue('priority', value)
                            }}
                            name="priority"
                        />
                    </div>
                </div>
                <div className='row mt-2'>
                    <div className='col-6 p-0 pr-5'>
                        <label htmlFor='issueType'>Epic Link</label>
                        <Select
                            placeholder="Select Epic"
                        />
                    </div>
                    <div className='col-6 p-0'>
                        <label htmlFor='priority'>Labels</label>
                        <Select
                            placeholder="Select label"
                        />
                        <small>Choose this epic to assign this issue to.</small>
                    </div>
                </div>
                <div className='row mt-2'>
                    <div className='col-6 p-0 pr-5'>
                        <label htmlFor='issueType'>Components</label>
                        <Select
                            placeholder="None"
                        />
                    </div>
                    <div className='col-6 p-0'>
                        <label htmlFor='priority'>Sprint</label>
                        <Select
                            placeholder="Select sprint"
                        />
                    </div>
                </div>

                <div className='row mt-2'>
                    <label htmlFor='shortSummary'>Short summary <span style={{ color: 'red' }}>(*)</span></label>
                    <Input placeholder="Input content" onChange={handleChange} name="shortSummary" />
                </div>

                <div className='row mt-2 d-flex flex-column'>
                    <label htmlFor='description'>Description</label>
                    <Editor name='description'
                        apiKey='golyll15gk3kpiy6p2fkqowoismjya59a44ly52bt1pf82oe'
                        init={{
                            plugins: 'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount linkchecker',
                            toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat',
                            tinycomments_mode: 'embedded',
                            tinycomments_author: 'Author name',
                            mergetags_list: [
                                { value: 'First.Name', title: 'First Name' },
                                { value: 'Email', title: 'Email' },
                            ],
                            ai_request: (request, respondWith) => respondWith.string(() => Promise.reject("See docs to implement AI Assistant")),
                        }}
                        onEditorChange={handlEditorChange}
                    />
                </div>
                <div className='row mt-2 d-flex flex-column w-50'>
                    <label htmlFor='fileAttachment'>File Attachment</label>
                    <Upload
                        name='file'
                        accept='.pdf, .txt'
                        beforeUpload={async (info) => {
                            console.log("info", info);
                            message.success('File uploaded successfully')
                            const formData = new FormData()
                            formData.append('updatedfile', info)
                            await Axios.post(`${domainName}/api/files/upload`, formData)
                        }}>
                        <Button icon={<UploadOutlined />}>Select File</Button>
                    </Upload>
                </div>
                <form action="/api/files/upload" method="post" enctype="multipart/form-data">
                    <input type="file" name="file" />
                    <input type="submit" value="Upload File" />
                </form>
                <div className='row mt-2'>
                    <div className='col-6 p-0 pr-4'>
                        <label htmlFor='assignees'>Assignees</label>
                        <Select mode={'multiple'}
                            style={{ width: '100%' }}
                            options={props.projectInfo?.members?.filter(value => value._id !== userInfo.id).map(value => {
                                return { label: value.username, value: value._id }
                            })}
                            placeholder={'Select Item...'}
                            maxTagCount={'responsive'}
                            onChange={(value) => {
                                setFieldValue('assignees', value)
                            }}
                            name="assignees"
                        />
                    </div>
                    <div className='col-6 p-0'>
                        <label htmlFor='totalTime'>Time Tracking</label>
                        <Slider name="totalTime" defaultValue={0} value={timeTracking.timeSpent} max={timeTracking.timeRemaining + timeTracking.timeSpent} />
                        <div className='row'>
                            <span className='col-6 text-left'>{timeTracking.timeSpent} logged</span>
                            <span className='col-6 text-right'>{timeTracking.timeRemaining} remaining</span>
                        </div>
                    </div>
                </div>

                <div className='row mt-2'>
                    <div className='col-6 p-0 pr-4'>
                        <label htmlFor='timeOriginalEstimate'>Original Estimate (Hours) <span style={{ color: 'red' }}>(*)</span></label>
                        <InputNumber min={0} defaultValue={0} style={{ width: '100%' }} onChange={(value) => {
                            setFieldValue('timeOriginalEstimate', value)
                        }} name="timeOriginalEstimate" />
                    </div>
                    <div className='col-6 p-0'>
                        <div className='row'>
                            <div className='col-6  pr-4'>
                                <label htmlFor='timeSpent'>Time spent <span style={{ color: 'red' }}>(*)</span></label>
                                <InputNumber value={timeTracking.timeSpent} name="timeSpent" min={0} onChange={(value) => {
                                    setTimeTracking({
                                        ...timeTracking,
                                        timeSpent: value
                                    })

                                    setFieldValue('timeSpent', value)
                                }} />
                            </div>
                            <div className='col-6 p-0'>
                                <label htmlFor='timeRemaining'>Time remaining <span style={{ color: 'red' }}>(*)</span></label>
                                <InputNumber value={timeTracking.timeRemaining} min={0} name="timeRemaining" onChange={(value) => {
                                    setTimeTracking({
                                        ...timeTracking,
                                        timeRemaining: value
                                    })
                                    setFieldValue('timeRemaining', value)
                                }} />
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    )
}
TaskForm.propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    handleChange: PropTypes.func.isRequired,
    setFieldValue: PropTypes.func.isRequired,
    projectInfo: PropTypes.shape({
        name_project: PropTypes.string,
        members: PropTypes.array
    })
};
const handleSubmitTaskForm = withFormik({
    enableReinitialize: true,
    mapPropsToValues: (props) => {
        const templateIssue = props.currentIssue
        return {
            projectId: templateIssue.project_id,
            creator: templateIssue !== null ? templateIssue?.creator?._id.toString() : null,
            issue_type: 0,   //khoi tao mac dinh se vao todo
            issue_priority: templateIssue !== null ? templateIssue?.issue_priority : 2,
            summary: templateIssue !== null ? templateIssue?.summary : null,
            description: templateIssue !== null ? templateIssue?.description : null,
            assignees: templateIssue !== null ? templateIssue?.assignees : [],
            timeOriginalEstimate: templateIssue !== null ? templateIssue?.timeOriginalEstimate : null,
            issue_status: templateIssue !== null ? templateIssue?.issue_status : 0,
        }
    },
    handleSubmit: (values, { props, setSubmitting }) => {
        let checkSubmit = true
        if (values.shortSummary.trim() === '' || values.timeOriginalEstimate === 0 || values.timeSpent === 0 || values.timeRemaining === 0) {
            checkSubmit = false
            showNotificationWithIcon('error', 'Create Issue', 'Fields containing (*) can\'t left blank')
        }
        if (checkSubmit) {
            props.dispatch(createIssue(values))
        }
    }
})(TaskForm);

const mapStateToProp = (state) => ({
    projectInfo: state.listProject.projectInfo,
    userInfo: state.user.userInfo
})

export default connect(mapStateToProp)(handleSubmitTaskForm)