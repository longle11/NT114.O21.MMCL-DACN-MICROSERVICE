import { Editor } from '@tinymce/tinymce-react'
import { Input, InputNumber, Select, Space } from 'antd'
import React, { useEffect } from 'react'
import { connect, useDispatch, useSelector } from 'react-redux';
import { withFormik } from 'formik';
import { createIssue } from '../../redux/actions/IssueAction';
import { submit_edit_form_action } from '../../redux/actions/DrawerAction';
import { showNotificationWithIcon } from '../../util/NotificationUtil';
import { priorityTypeOptions, issueTypeOptions, renderListProject, renderEpicList, renderSprintList, renderIssueType, renderAssignees, renderVersionList } from '../../util/CommonFeatures';
import PropTypes from 'prop-types';
import { getEpicList, getVersionList } from '../../redux/actions/CategoryAction';
import { GetProcessListAction, GetSprintListAction } from '../../redux/actions/ListProjectAction';

function TaskForm(props) {
    const { handleChange, handleSubmit, setFieldValue } = props

    const userInfo = useSelector(state => state.user.userInfo)
    const listProject = useSelector(state => state.listProject.listProject)
    const epicList = useSelector(state => state.categories.epicList)
    const versionList = useSelector(state => state.categories.versionList)
    const sprintList = useSelector(state => state.listProject.sprintList)
    const processList = useSelector(state => state.listProject.processList)

    const handlEditorChange = (content, editor) => {
        setFieldValue('description', content)
    }
    useEffect(() => {
        // //submit sự kiện để gửi lên form
        dispatch(submit_edit_form_action(handleSubmit))
        if (props.values?.project_id) {
            dispatch(getEpicList(props.values.project_id, null))
            dispatch(getVersionList(props.values.project_id, null))
            dispatch(GetProcessListAction(props.values.project_id))
            dispatch(GetSprintListAction(props.values.project_id, null))
        } else {
            setFieldValue('project_id', userInfo.project_working)
        }
        // eslint-disable-next-line
    }, [props.values.project_id])
    const dispatch = useDispatch()
    return (
        <div className='container-fluid'>
            <form onSubmit={handleSubmit}>
                <div className='row'>
                    <label className='col-12 p-0 font-weight-bold' htmlFor='name_project'>Project Name</label>
                    <Select name="name_project"
                        options={renderListProject(listProject)}
                        defaultValue={userInfo.project_working}
                        style={{ width: '50%', height: 40 }}
                        onSelect={(value) => {
                            setFieldValue('project_id', value)
                        }}
                    />
                </div>
                <div className='row mt-2'>
                    <div className='col-6 p-0'>
                        <label className='font-weight-bold' htmlFor='issue_status'>Issue Status <span className='text-danger'>*</span></label>
                        <Select
                            style={{ width: '100%' }}
                            options={issueTypeOptions}
                            onSelect={(value, option) => {
                                setFieldValue('issue_status', value)
                            }}
                            name="issue_status"
                        />
                    </div>
                    <div className='col-6 p-0 pl-2'>
                        <label className='font-weight-bold' htmlFor='issue_priority'>Priority <span className='text-danger'>*</span></label>
                        <Select
                            style={{ width: '100%' }}
                            options={priorityTypeOptions}
                            onSelect={(value, option) => {
                                setFieldValue('issue_priority', value)
                            }}
                            name="issue_priority"
                        />
                    </div>
                </div>
                <div className='row mt-2'>
                    <div className='col-6 p-0'>
                        <label className='font-weight-bold' htmlFor='issue_type'>Type <span className='text-danger'>*</span></label>
                        <Select
                            style={{ width: '100%' }}
                            options={renderIssueType(processList, props.values?.project_id)}
                            onChange={(value) => {
                                setFieldValue('issue_type', value)
                            }}
                            name="issue_type"
                        />
                    </div>
                </div>
                <div className='row mt-2'>
                    <div className='col-12 p-0 d-flex flex-column'>
                        <label className='font-weight-bold' htmlFor='epic_link'>Epic Link</label>
                        <Select
                            name="epic_link"
                            style={{ width: '50%' }}
                            onChange={(value) => {
                                setFieldValue('epic_link', value)
                            }}
                            options={renderEpicList(epicList, props.values?.project_id)}
                            placeholder="Select Epic"
                        />
                        <small>Choose this epic to assign this issue to.</small>
                    </div>

                </div>

                <div className='row mt-2'>
                    <div className='col-12 p-0 d-flex flex-column'>
                        <label className='font-weight-bold' htmlFor='labels'>Labels</label>
                        <Select
                            name="labels"
                            style={{ width: '50%' }}
                            placeholder="Select label"
                        />
                    </div>
                </div>
                <div className='row mt-2'>
                    <div className='col-12 p-0 d-flex flex-column'>
                        <label className='font-weight-bold' htmlFor='issueType'>Components</label>
                        <Select
                            style={{ width: '50%' }}
                            placeholder="None"
                        />
                    </div>
                </div>
                <div className='row mt-2'>
                    <div className='col-12 p-0 d-flex flex-column'>
                        <label className='font-weight-bold' htmlFor='fix_version'>Fix Version</label>
                        <Select
                            name="fix_version"
                            style={{ width: '50%' }}
                            onChange={(value) => {
                                setFieldValue('fix_version', value)
                            }}
                            options={renderVersionList(versionList, props.values?.project_id)}
                            placeholder="Select sprint"
                        />
                    </div>
                </div>
                <div className='row mt-2'>
                    <div className='col-12 p-0 d-flex flex-column'>
                        <label className='font-weight-bold' htmlFor='current_sprint'>Sprint</label>
                        <Select
                            name="current_sprint"
                            style={{ width: '50%' }}
                            onChange={(value) => {
                                setFieldValue('current_sprint', value)
                            }}
                            options={renderSprintList(sprintList, props.values?.project_id)}
                            placeholder="Select sprint"
                        />
                    </div>
                </div>

                <div className='row mt-2'>
                    <div className='col-6 p-0'>
                        <label className='font-weight-bold' htmlFor='assignees'>Assignees</label>
                        <Select mode={'multiple'}
                            style={{ width: '100%' }}
                            options={renderAssignees(listProject, props.values?.project_id, userInfo)}
                            onChange={(value) => {
                                setFieldValue('assignees', value)
                            }}
                            optionRender={(option) => {
                                return <Space>
                                    <div>
                                        {option.data.desc}
                                    </div>
                                </Space>
                            }}
                            name="assignees"
                        />
                    </div>
                </div>

                <div className='row mt-2'>
                    <div className='col-12 p-0'>
                        <label className='font-weight-bold' htmlFor='timeOriginalEstimate'>Original Estimate (Hours)</label>
                        <input style={{ marginBottom: '3px' }} className="estimate-hours" onChange={(e) => {
                            // //kiem tra gia tri co khac null khong, khac thi xoa
                            // if (inputTimeOriginal.current) {
                            //     clearTimeout(inputTimeOriginal.current)
                            // }
                            // inputTimeOriginal.current = setTimeout(() => {

                            // }, 3000)
                        }}
                            defaultValue=""
                            onBlur={(e) => {
                                // if (validateOriginalTime(e.target.value)) {
                                //     const oldValue = calculateTimeAfterSplitted(issueInfo.timeOriginalEstimate ? issueInfo.timeOriginalEstimate : 0)
                                //     const newValue = calculateTimeAfterSplitted(e.target.value)
                                //     dispatch(updateInfoIssue(issueInfo?._id, projectInfo?._id, { timeOriginalEstimate: newValue }, oldValue, newValue, userInfo.id, "updated", "time original estimate"))
                                //     showNotificationWithIcon('success', '', "Truong du lieu hop le")
                                // } else {
                                //     showNotificationWithIcon('error', '', "Truong du lieu nhap vao khong hop le")
                                // }
                            }}
                        />
                        <small>Format: <span className='text-danger'>2w3d4h5m</span></small>
                    </div>
                </div>
                <div className='row mt-2'>
                    <div className='col-12 p-0'>
                        <label className='font-weight-bold' htmlFor='story_point'>Story point estimate</label>
                        <InputNumber min={1} max={1000} defaultValue={null} style={{ marginBottom: '3px', width: '100%' }} className="story_point" onChange={(e) => { }} />
                    </div>
                </div>

                <div className='row mt-2'>
                    <label htmlFor='summary' className='font-weight-bold'>Summary <span className='text-danger'>*</span></label>
                    <Input placeholder="Input content" onChange={(e) => {
                        setFieldValue('summary', e.target.value)
                    }} name="summary" />
                </div>

                <div className='row mt-2 d-flex flex-column'>
                    <label htmlFor='description' className='font-weight-bold'>Description</label>
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
                {/* <div className='row mt-2 d-flex flex-column w-50'>
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
                 */}
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
        return {
            project_id: props.userInfo.projec_working,
            creator: props.userInfo.id,
            issue_status: 0,   //khoi tao mac dinh se vao todo
            issue_priority: 2,
            summary: '',
            description: '',
            assignees: [],
            timeOriginalEstimate: null,
            issue_type: null,
            story_point: null,
            epic_link: null,
            fix_version: null,
            current_sprint: null
        }
    },
    handleSubmit: (values, { props, setSubmitting }) => {
        let checkSubmit = true
        if (!(values.project_id !== null && Number.isInteger(values.issue_priority) && Number.isInteger(values.issue_status) && values.summary.trim() !== '' && values.issue_type !== null)) {
            checkSubmit = false
            showNotificationWithIcon('error', 'Create Failed Issue', 'Fields containing (*) can\'t left blank')
        }
        if (checkSubmit) {
            props.dispatch(createIssue(values))
        }
    }
})(TaskForm);

const mapStateToProp = (state) => ({
    userInfo: state.user.userInfo
})

export default connect(mapStateToProp)(handleSubmitTaskForm)