import React, { useEffect, useState } from 'react'
import { Editor } from '@tinymce/tinymce-react';
import { withFormik } from 'formik';
import { connect, useDispatch } from 'react-redux';
import { getListCategories } from '../../redux/actions/CategoryAction';
import PropTypes from 'prop-types';
import { Avatar, Breadcrumb, Select } from 'antd';
import * as Yup from "yup";
import { showNotificationWithIcon } from '../../util/NotificationUtil';
import { createProjectAction } from '../../redux/actions/CreateProjectAction';
function Create(props) {
    const { handleSubmit, handleChange, setFieldValue, errors } = props;
    const handlEditorChange = (content, editor) => {
        setFieldValue('description', content)
    }
    const [keyName, setKeyName] = useState('')

    const dispatch = useDispatch()
    useEffect(() => {
        dispatch(getListCategories())
        // eslint-disable-next-line
    }, [])

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
        return { name_project: '', description: '', key_name: '', project_lead: props.userInfo.id }
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