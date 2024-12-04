import React, { useEffect } from 'react'
import { connect, useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { GetProjectAction } from '../../../redux/actions/ListProjectAction'
import { submit_edit_form_action } from '../../../redux/actions/DrawerAction'
import { withFormik } from 'formik'
import { showNotificationWithIcon } from '../../../util/NotificationUtil'
import { createComponent, updateComponent } from '../../../redux/actions/CategoryAction'
import { Input, Select } from 'antd'
const { TextArea } = Input
function CreateComponent(props) {
    const { handleSubmit, setFieldValue } = props
    const projectInfo = useSelector(state => state.listProject.projectInfo)
    const dispatch = useDispatch()
    const { id } = useParams()


    useEffect(() => {
        if (id) {
            dispatch(GetProjectAction(id, null, null))
        }
    }, [id])

    useEffect(() => {
        // //submit sự kiện để gửi lên form
        dispatch(submit_edit_form_action(handleSubmit))
        // eslint-disable-next-line
    }, [])

    return (
        <form onSubmit={handleSubmit}>
            <div className='d-flex justify-content-between'>
                <h4>Create Component</h4>
            </div>
            <span>Required fields are marked with an asterisk <span className='text-danger'>*</span></span>
            <div className='form-group mt-2'>
                <label htmlFor='component_name' className='p-0'>Component name <span className='text-danger'>*</span></label>
                <Input
                    onChange={(e) => {
                        setFieldValue('component_name', e.target.value.trim())
                    }}
                    id='component_name'
                    className='form-control'
                    defaultValue={props.currentComponent.component_name}
                />
            </div>
            <div className='form-group'>
                <label htmlFor='summary' className='p-0'>Description</label>
                <TextArea
                    rows={4}
                    id='description'
                    onChange={(e) => {
                        setFieldValue('description', e.target.value.trim())
                    }}
                    defaultValue={props.currentComponent.description}
                    className='form-control' />
            </div>
            <div className='form-group'>
                <label htmlFor='component_lead' className='p-0'>Component lead</label>
                <Select
                    onChange={(value) => {
                        setFieldValue('component_lead', value)
                    }}
                    id='component_lead'
                    style={{ width: '100%' }}
                    options={[{
                        label: 'Unassignee',
                        value: null
                    }].concat(projectInfo ? projectInfo?.members?.map(user => {
                        return {
                            label: user.user_info.username,
                            value: user.user_info._id,
                        }
                    }) : [])}
                    defaultValue={props.currentComponent.component_lead ? props.currentComponent.component_lead?.username : "Unassignee"}
                />
            </div>
        </form>
    )
}

const handleSubmitComponentForm = withFormik({
    enableReinitialize: true,
    mapPropsToValue: (props) => {
        const component = props.currentComponent
        return {
            project_id: component.project_id,
            creator: component.creator,
            description: component.description,
            component_name: component.component_name,
            component_lead: component.component_lead
        }
    },
    handleSubmit: (value, { props }) => {
        if (value.component_name?.trim() === "") {
            showNotificationWithIcon('error', 'Notification', 'Field (*) can\'t be left blank')
        } else {
            var updateValue = Object.assign({}, ...Object.keys(value.currentComponent).map(field => {
                return { [field]: value.currentComponent[field] }
            }))
            delete value.currentComponent
            updateValue = {...updateValue, ...value}
            if (!updateValue.id) {    //create new
                props.dispatch(createComponent({
                    project_id: updateValue.project_id,
                    component_name: updateValue.component_name,
                    creator: updateValue.creator,
                    description: updateValue.description
                }))
            } else { //edit
                props.dispatch(updateComponent(updateValue.id, {
                    component_name: updateValue.component_name,
                    component_lead: updateValue.component_lead,
                    description: updateValue.description
                }, updateValue.project_id))
            }
        }
    }
})(CreateComponent)

export default connect()(handleSubmitComponentForm)
