import { Editor } from '@tinymce/tinymce-react'
import { withFormik } from 'formik'
import React, { useEffect } from 'react'
import { connect, useDispatch, useSelector } from 'react-redux'
import { submit_edit_form_action } from '../../redux/actions/DrawerAction';
import { getListCategories } from '../../redux/actions/CategoryAction';
import { updateItemCategory } from '../../redux/actions/EditCategoryAction';

function FormEdit(props) {
    const handlEditorChange = (content, editor) => {
        setFieldValue('description', content)
    }
    const dispatch = useDispatch()
    const categoryList = useSelector(state => state.categories.categoryList)

    useEffect(() => {
        // //submit sự kiện để gửi lên form
        dispatch(submit_edit_form_action(handleSubmit))

        //lấy ra danh sách category
        dispatch(getListCategories())
    }, [])
    const {
        handleChange,
        handleSubmit,
        setFieldValue   //giúp set lại giá trị value mà không thông qua hàm handlechange
    } = props;

    return (
        <div className='container-fluid'>
            <form onSubmit={handleSubmit}>
                <div className='row'>
                    <div className='col-4'>
                        <div className="form-group">
                            <label>Project ID</label>
                            <input onChange={handleChange} value={props.list._id} className="form-control" name='projectId' disabled />
                        </div>
                    </div>
                    <div className='col-4'>
                        <div className="form-group">
                            <label>Project Name</label>
                            <input onChange={handleChange} defaultValue={props.list.nameProject} className="form-control" name='nameProject' />
                        </div>
                    </div>
                    <div className='col-4'>
                        <div className="form-group">
                            <label>Categories</label>
                            <select name='category' className='form-control' onChange={handleChange}>
                                {categoryList.map((value, index) => {
                                    if (props.list.category.name === value.name) {
                                        return <option selected value={value._id} key={index}>{value.name}</option>
                                    }
                                    return <option value={value._id} key={index}>{value.name}</option>
                                })}
                            </select>
                        </div>
                    </div>
                    <div className='col-12'>
                        <div className="form-group">
                            <label>Description</label>
                            <Editor name='description'
                                apiKey='golyll15gk3kpiy6p2fkqowoismjya59a44ly52bt1pf82oe'
                                initialValue={props.list.description}
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
                    </div>
                </div>
            </form>
        </div>
    )
}


const handleSubmitForm = withFormik({
    enableReinitialize: true,
    mapPropsToValues: (props) => {
        return {
            id: props.list?._id,
            nameProject: props.list?.nameProject,
            description: props.list?.description,
            category: props.list?.category?._id,
        }
    },
    handleSubmit: (values, { props, setSubmitting }) => {
        props.dispatch(updateItemCategory(values))
    },

    displayName: 'BasicForm',
})(FormEdit);

const mapStateToProps = (state) => ({
    list: state.editCategory.list
})

export default connect(mapStateToProps)(handleSubmitForm)