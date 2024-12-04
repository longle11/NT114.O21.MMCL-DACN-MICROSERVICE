import React, { useEffect, useState } from 'react'
import { Editor } from '@tinymce/tinymce-react';
import { withFormik } from 'formik';
import { connect, useDispatch } from 'react-redux';
import { getListCategories } from '../../redux/actions/CategoryAction';
import PropTypes from 'prop-types';
import { Avatar, Breadcrumb, Button, Select } from 'antd';
import * as Yup from "yup";
import { showNotificationWithIcon } from '../../util/NotificationUtil';
import { createProjectAction } from '../../redux/actions/CreateProjectAction';
import { useNavigate, useParams } from 'react-router-dom';
function Create(props) {
    const { handleSubmit, handleChange, setFieldValue, errors } = props;
    const handlEditorChange = (content, editor) => {
        setFieldValue('description', content)
    }
    const [keyName, setKeyName] = useState('')

    const { template_id } = useParams()

    const dispatch = useDispatch()
    useEffect(() => {
        dispatch(getListCategories())
        // eslint-disable-next-line
    }, [])

    useEffect(() => {
        setFieldValue('template_id', template_id)
    }, [template_id])

    const navigate = useNavigate()

    const renderTemplate = (templateId) => {
        var imgUrl = ''
        var template_name = ''
        var template_description = ''

        if (templateId === '0') { //kanban template
            imgUrl = "https://taskschedulerproject.atlassian.net/s/-oo8t1n/b/9/d0630ad8e2b33a2fc7347459a3397d94eb3a0393/_/download/resources/com.atlassian.jira.project-templates-plugin:project-templates-next-icons/icons/kanban.svg"
            template_name = "Kanban"
            template_description = "Visualize and advance your project forward using issues on a powerful board."
        } else if (templateId === '1') { //scrum template
            imgUrl = "https://taskschedulerproject.atlassian.net/s/-oo8t1n/b/9/d0630ad8e2b33a2fc7347459a3397d94eb3a0393/_/download/resources/com.atlassian.jira.project-templates-plugin:project-templates-next-icons/icons/scrum.svg"
            template_name = "Srum"
            template_description = "Sprint toward your project goals with a board, backlog, and timeline."
        }

        return <div>
            <div className='d-flex justify-content-between align-items-center'>
                <span>Template</span>
                <Button onClick={(e) => {
                    navigate('/create-project/software-project/templates')
                }}>Change template</Button>
            </div>
            <div className="card mt-3 mb-3 d-flex flex-row align-items-center" style={{ width: 'max-content' }}>
                <div>
                    <img src={imgUrl} />
                </div>
                <div className='mr-3'>
                    <h5 className="card-title">{template_name}</h5>
                    <p className="card-text">{template_description}</p>
                </div>
            </div>
        </div>
    }

    return (
        <div style={{ height: '100%', overflowY: 'auto', scrollbarWidth: 'thin' }}>
            <div>
                <div className="header">
                    <Breadcrumb
                        style={{ marginBottom: 10 }}
                        items={[
                            {
                                title: <a href="/">Projects</a>,
                            }
                        ]}
                    />
                </div>
                <h4>Create Project</h4>
            </div>
            <div className="info d-flex justify-content-center">
                <form onSubmit={handleSubmit} style={{ width: '50%' }}>
                    {
                        renderTemplate(template_id)
                    }
                    <div className='form-group'>
                        <label htmlFor='name_project'>Name <span style={{ color: 'red' }}>(*)</span></label>
                        <input onChange={handleChange} className='form-control' name='name_project' />
                        {errors.name_project ? (<div style={{ color: '#ae2e24', marginTop: 5 }}><i className="fa fa-exclamation-triangle mr-2"></i>{errors.name_project}</div>) : null}
                    </div>
                    <div className='form-group'>
                        <label htmlFor='key_name'>Key project <span style={{ color: 'red' }}>(*)</span></label>
                        <input value={keyName} onChange={(e) => {
                            setKeyName(e.target.value.toUpperCase())
                            setFieldValue('key_name', e.target.value.toUpperCase())
                        }} className='form-control' name='key_name' />
                        {errors.key_name ? (<div style={{ color: '#ae2e24', marginTop: 5 }}><i className="fa fa-exclamation-triangle mr-2"></i>{errors.key_name}</div>) : null}
                    </div>
                    <div className='form-group'>
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
                    <div className='form-group d-flex flex-column'>
                        <label htmlFor='project_leader'>Project leader</label>
                        <Select
                            name="project_leader"
                            style={{ height: 40, width: '50%' }}
                            options={[
                                {
                                    value: props.userInfo.id,
                                    label: <span><Avatar size="small" src={props.userInfo.avatar} /> {props.userInfo.username}</span>
                                }
                            ]}
                            defaultValue={props.userInfo.id} />
                    </div>
                    <button type='submit' className='btn btn-primary'>Create project</button>
                </form>
            </div>
        </div>
    )
}
Create.propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    handleChange: PropTypes.func.isRequired,
    setFieldValue: PropTypes.func.isRequired,
};

const handleCreateProject = withFormik({
    enableReinitialize: true,
    mapPropsToValues: (props) => {
        return { 
            name_project: '', 
            description: '', 
            key_name: '', 
            template_id: '', 
            project_lead: props.userInfo.id,
            template_name: '',
            issue_types_default: [],
            workflow_default: []
        }
    },
    validationSchema: Yup.object().shape({
        name_project: Yup.string()
            .trim()
            .required("Name project is required")
            .min(2, "Name project has a minimum of 2 characters"),
        key_name: Yup.string()
            .trim()
            .required("Key name is required")
            .min(2, "Key name has a minimum of 2 characters")
            .max(10, "Key name has a maximum of 10 characters")
            .matches(/^[A-Za-z][A-Za-z0-9]*$/, "Key name must start with a letter and contain no special characters or spaces")
    }),
    handleSubmit: (values, { props, setSubmitting }) => {
        if (props.userInfo) {
            if(values.template_id === '0' || values.template_id === '1') {
                if(values.template_id === '0') {
                    values.template_name = 'Kanban'
                } else {
                      values.template_name = 'Scrum'
                }
                values.issue_types_default = [
                    {
                        icon_id: 0,
                        icon_type: 'fa-bookmark',
                        icon_color: '#65ba43',
                        icon_name: 'Story'
                    },
                    {
                        icon_id: 1,
                        icon_type: 'fa-square-check',
                        icon_color: '#4fade6',
                        icon_name: 'Task'
                    },
                    {
                        icon_id: 2,
                        icon_type: 'fa-circle-exclamation',
                        icon_color: '#cd1317',
                        icon_name: 'Bug'
                    },
                    {
                        icon_id: 3,
                        icon_type: 'fa-bolt',
                        icon_color: 'purple',
                        icon_name: 'Epic'
                    },
                    {
                        icon_id: 4,
                        icon_type: 'fa-list-check',
                        icon_color: '#e97f33',
                        icon_name: 'Subtask'
                    }
                ]
                values.workflow_default = [
                    {
                        process_name: 'To Do',
                        process_color: '#ddd',
                        type_process: 'normal'
                    },
                    {
                        process_name: 'In Progress',
                        process_color: '#1d7afc',
                        type_process: 'normal'
                    },
                    {
                        process_name: 'Done',
                        process_color: '#22a06b',
                        type_process: 'done'
                    }
                ]
            }
            values.creator = props.userInfo.id
            props.dispatch(createProjectAction({ ...values, members: [{ user_info: props.userInfo.id, user_role: 0, status: 'approved' }], sprint_id: null }))
        } else {
            showNotificationWithIcon('error', 'Tạo dự án', 'Vui lòng đăng nhập trước khi tạo dự án')
        }
    },
    displayName: 'EditForm',
})(Create);

const mapStateToProps = (state) => ({
    userInfo: state.user.userInfo,
    categoryList: state.categories.categoryList
})

export default connect(mapStateToProps)(handleCreateProject)