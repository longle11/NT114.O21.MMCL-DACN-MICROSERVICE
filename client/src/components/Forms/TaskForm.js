import { Editor } from '@tinymce/tinymce-react'
import { DatePicker, Input, InputNumber, message, Select, Space } from 'antd'
import React, { useEffect } from 'react'
import { connect, useDispatch, useSelector } from 'react-redux';
import { withFormik } from 'formik';
import { createIssue } from '../../redux/actions/IssueAction';
import { submit_edit_form_action, updateTempFileDataTaskForm } from '../../redux/actions/DrawerAction';
import { showNotificationWithIcon } from '../../util/NotificationUtil';
import { priorityTypeOptions, issueTypeOptions, renderListProject, renderEpicList, renderSprintList, renderIssueType, renderAssignees, renderVersionList } from '../../util/CommonFeatures';
import { getComponentList, getEpicList, getVersionList } from '../../redux/actions/CategoryAction';
import { GetProcessListAction, GetProjectAction, GetSprintListAction } from '../../redux/actions/ListProjectAction';
import { InboxOutlined } from '@ant-design/icons';
import mongoose from 'mongoose';
import Dragger from 'antd/es/upload/Dragger';
import { attributesFiltering } from '../../util/IssueAttributesCreating';
import { calculateTimeAfterSplitted, validateOriginalTime } from '../../validations/TimeValidation';
import dayjs from 'dayjs';
function TaskForm(props) {
    const userInfo = useSelector(state => state.user.userInfo)
    const listProject = useSelector(state => state.listProject.listProject)
    const epicList = useSelector(state => state.categories.epicList)
    const versionList = useSelector(state => state.categories.versionList)
    const sprintList = useSelector(state => state.listProject.sprintList)
    const processList = useSelector(state => state.listProject.processList)
    const projectInfo = useSelector(state => state.listProject.projectInfo)
    const componentList = useSelector(state => state.categories.componentList)

    const { handleSubmit, setFieldValue } = props
    const uploadFileProps = {
        name: 'file',
        action: 'http://localhost/api/files/upload',
        headers: {
            authorization: 'authorization-text',
        },
        data: {
            creator_id: userInfo.id
        },
        onChange(info) {
            if (info.file.status !== 'uploading') {
                console.log("du lieu dang duoc uploading ", info.file);
            }
            if (info.file.status === 'done') {
                props.values.file_uploaded.push(info.file.response.data._id)
                dispatch(updateTempFileDataTaskForm(props.values.file_uploaded))
                message.success(`${info.file.name} file uploaded successfully`);
            } else if (info.file.status === 'error') {
                message.error(`${info.file.name} file upload failed.`);
            }
        },
    };

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
            dispatch(GetProjectAction(props.values.project_id))
            dispatch(GetSprintListAction(props.values.project_id, null))
            dispatch(getComponentList(props.values.project_id))
        } else {
            setFieldValue('project_id', userInfo.project_working)
        }
        // eslint-disable-next-line
    }, [props.values.project_id])


    const objectTemplate = (field, options) => {
        return <div className='d-flex flex-column'>
            <Select
                name={field.field_key_issue}
                style={{ width: '100%' }}
                onChange={(value) => {
                    setFieldValue(field.field_key_issue, value)
                }}
                options={options}
                placeholder={`Select ${field.field_name}`}
            />
            <small>Choose this {field.field_name.toLowerCase()} to assign this issue.</small>
        </div>
    }

    const renderDescriptionTemplate = () => {
        return <Editor name='description'
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
    }

    const renderDateTemplate = (field) => {
        return <DatePicker
            showTime={true}
            style={{ borderRadius: 0, width: '100%' }}
            defaultValue={dayjs()}
            onChange={(e, dateString) => {
                setFieldValue(field.field_key_issue, dateString)
            }} />
    }

    const renderNumberTemplate = () => {
        return <InputNumber
            min={1}
            max={1000}
            defaultValue={null}
            style={{ marginBottom: '3px', width: '100%' }}
            onChange={(e) => { }} />
    }

    const renderStringTemplate = (field) => {
        return <Input placeholder="Input content" onChange={(e) => {
            setFieldValue(field.field_key_issue, e.target.value)
        }} name={field.field_key_issue} />
    }

    const renderArrayObjectTemplate = (field) => {
        if (field.field_key_issue === 'assignees') {
            return <Select mode={'multiple'}
                style={{ width: '100%' }}
                options={renderAssignees(listProject, props.values?.project_id, userInfo)}
                onChange={(value) => {
                    setFieldValue(field.field_key_issue, value)
                }}
                optionRender={(option) => {
                    return <Space>
                        <div>
                            {option.data.desc}
                        </div>
                    </Space>
                }}
                name={field.field_key_issue}
            />
        } else if (field.field_key_issue === 'component') {
            return <Select mode={'multiple'}
                style={{ width: '100%' }}
                options={componentList?.map(component => {
                    return {
                        label: component.component_name,
                        value: component._id
                    }
                })}
                onChange={(value) => {
                    setFieldValue(field.field_key_issue, value)
                }}
                name={field.field_key_issue}
            />
        }
        return <></>

    }

    const renderTimeOriginalTemplate = () => {
        return <div>
            <input style={{ marginBottom: '3px' }} className="estimate-hours" defaultValue=""
                onBlur={(e) => {
                    if (validateOriginalTime(e.target.value)) {
                        setFieldValue('timeOriginalEstimate', calculateTimeAfterSplitted(e.target.value))
                        showNotificationWithIcon('success', '', "Truong du lieu hop le")
                    } else {
                        showNotificationWithIcon('error', '', "Truong du lieu nhap vao khong hop le")
                    }
                }}
            />
            <small>Format: <span className='text-danger'>2w3d4h5m</span></small>
        </div>
    }

    const renderField = () => {
        return projectInfo?.issue_fields_config?.filter(field => field.field_position_display.findIndex(status => status.issue_status === props.values.issue_status) !== -1 && !['timeSpent', 'issue_status', 'issue_type', 'issue_priority', 'old_sprint', 'parent'].includes(field.field_key_issue))
            .map((field, index) => {
                var temp = <></>
                if (field.field_type_in_issue === "object") {
                    var options = []
                    if (field.field_key_issue === 'epic_link') {
                        options = renderEpicList(epicList, props.values?.project_id)
                    } else if (field.field_key_issue === 'fix_version') {
                        options = renderVersionList(versionList, props.values?.project_id)
                    } else if (field.field_key_issue === 'current_sprint') {
                        options = renderSprintList(sprintList, props.values?.project_id)
                    }
                    temp = objectTemplate(field, options)
                } else if (field.field_type_in_issue === "number" && !['timeOriginalEstimate'].includes(field.field_key_issue)) {
                    temp = renderNumberTemplate()
                } else if (field.field_type_in_issue === 'string' && Array.isArray(field.default_value)) {
                    temp = objectTemplate(field, field.default_value.map(field => {
                        return {
                            value: field,
                            label: field
                        }
                    }))
                } else if (field.field_type_in_issue === "string" || ['timeOriginalEstimate'].includes(field.field_key_issue)) {
                    if (field.field_key_issue === 'description') {
                        temp = renderDescriptionTemplate()
                    } else if (field.field_key_issue === 'timeOriginalEstimate') {
                        temp = renderTimeOriginalTemplate()
                    } else if (field.icon_field_type.includes('calendar')) {
                        temp = renderDateTemplate(field)
                    }
                    else {
                        temp = renderStringTemplate(field)
                    }
                } else if (field.field_type_in_issue === 'array-object') {
                    temp = renderArrayObjectTemplate(field)
                }
                return <div className='row mt-2'>
                    <div className='col-12 p-0 d-flex flex-column'>
                        <label className='font-weight-bold' htmlFor={field.field_key_issue}>{field.field_name} {field.is_required ? <span className='ml-1 text-danger'>*</span> : <></>}</label>
                        {temp}
                    </div>
                </div>
            })
    }

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
                    <div className='col-12 p-0'>
                        <label className='font-weight-bold' htmlFor='issue_status'>Issue Status <span className='text-danger'>*</span></label>
                        <Select
                            style={{ width: '100%' }}
                            options={issueTypeOptions(projectInfo?.issue_types_default)}
                            onSelect={(value, option) => {
                                setFieldValue('issue_status', value)
                            }}
                            name="issue_status"
                        />
                    </div>
                    <div className='col-12 p-0'>
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
                    <div className='col-12 p-0'>
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


                {renderField()}

                <div className='row mt-2 d-flex flex-column'>
                    <label htmlFor='fileAttachment' className='font-weight-bold'>File Attachment</label>
                    <div className='col-12'>
                        <Dragger {...uploadFileProps} style={{ width: '100%' }}>
                            <p className="ant-upload-drag-icon">
                                <InboxOutlined />
                            </p>
                            <p className="ant-upload-text">Click or drag file to this area to upload</p>
                            <p className="ant-upload-hint">
                                Support for a single upload. Strictly prohibited from uploading company data or other
                                banned files.
                            </p>
                        </Dragger>
                    </div>
                </div>
            </form>
        </div>
    )
}
// TaskForm.propTypes = {
//     handleSubmit: PropTypes.func.isRequired,
//     handleChange: PropTypes.func.isRequired,
//     setFieldValue: PropTypes.func.isRequired,
//     projectInfo: PropTypes.shape({
//         name_project: PropTypes.string,
//         members: PropTypes.array
//     })
// };
const handleSubmitTaskForm = withFormik({
    enableReinitialize: true,
    mapPropsToValues: (props) => {
        if (Object.keys(props.projectInfo).length > 0) {
            return Object.assign({
                _id: new mongoose.Types.ObjectId().toString(),
                project_id: props.userInfo.project_working,
                creator: props.userInfo.id,
                file_uploaded: []
            }, ...props.projectInfo.issue_fields_config?.map(field => {
                return { [field.field_key_issue]: field.default_value };
            }));
        }
        return {}
    },
    handleSubmit: (values, { props, setSubmitting }) => {
        props.dispatch(createIssue({ ...attributesFiltering(props.projectInfo, { ...values }), file_uploaded: values.file_uploaded },
            props.projectInfo._id,
            props.userInfo.id,
            values.current_sprint,
            null,
            props.projectInfo,
            props.userInfo
        ))
    }
})(TaskForm);

const mapStateToProp = (state) => ({
    userInfo: state.user.userInfo,
    projectInfo: state.listProject.projectInfo,
    processList: state.listProject.processList,
})

export default connect(mapStateToProp)(handleSubmitTaskForm)