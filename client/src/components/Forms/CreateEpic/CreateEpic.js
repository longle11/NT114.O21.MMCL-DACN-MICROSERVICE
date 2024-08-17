import { Input, Select } from 'antd'
import React, { useEffect } from 'react'
import { connect, useDispatch } from 'react-redux';
import { submit_edit_form_action } from '../../../redux/actions/DrawerAction';
import { createEpic } from '../../../redux/actions/CategoryAction';
import { withFormik } from 'formik';
import { showNotificationWithIcon } from '../../../util/NotificationUtil';
function CreateEpic(props) {
    const {handleChange, handleSubmit, setFieldValue} = props
    const dispatch = useDispatch()
    useEffect(() => {
        // //submit sự kiện để gửi lên form
        dispatch(submit_edit_form_action(handleSubmit))
        // eslint-disable-next-line
    }, [])

    return (
        <form onSubmit={handleSubmit}>
            <div className='d-flex justify-content-between'>
                <h4>Create Epic</h4>
                <div>
                    <button className='btn btn-primary'>Import issues</button>
                    <burton className='btn btn-primary'>...</burton>
                </div>
            </div>
            <div>
                <div className='form-group'>
                    <label htmlFor='projectForm' className='p-0'>Project <span className='text-danger'>*</span></label>
                    <Select id="projectForm"
                        defaultValue={props.currentEpic.project_id}
                        className='form-control p-0'
                        style={{
                            width: '40%',
                            border: 'none'
                        }}
                        disabled
                    />
                </div>
                <div className='form-group'>
                    <label htmlFor='issueTypeForm' className='p-0'>Issue type <span className='text-danger'>*</span></label>
                    <Select id="issueTypeForm"
                        defaultValue="Epic"
                        className='form-control p-0'
                        style={{
                            width: '40%',
                            border: 'none'
                        }}
                        disabled
                    />
                </div>
            </div>
            <hr className='mt-5 mb-4' />
            <div className='form-group'>
                <label htmlFor='epic_name' className='p-0'>Epic name <span className='text-danger'>*</span></label>
                <Input onChange={handleChange} id='epic_name' className='form-control' defaultValue={props.currentEpic.epic_name}/>
                <small className='mt-2 form-text text-muted'>Provide a short name to edentify this epic.</small>
            </div>
            <div className='form-group'>
                <label htmlFor='summary' className='p-0'>Summary <span className='text-danger'>*</span></label>
                <Input onChange={handleChange} id='summary' className='form-control' defaultValue={props.currentEpic.summary}/>
            </div>
            <div className='form-group'>
                <label htmlFor='reporterForm' className='p-0'>Reporter</label>
                <Select className='form-control' style={{ border: 'none', padding: '0', width: '40%' }} id="reporterForm"/>
            </div>
        </form>
    )
}

const handleSubmitForm = withFormik({
    enableReinitialize: true,
    mapPropsToValue: (props) => {
        const epic = props.currentEpic 
        return {
            project_id: epic.project_id,
            epic_name: epic.epic_name,
            creator: epic.creator,
            summary: epic.summary
        }
    },
    handleSubmit: (value, {props}) => {
        if(value.epic_name !== undefined && value.undefined !== null && (value.epic_name.trim() === "" || value.summary.trim === "")) {
            showNotificationWithIcon('error', 'Notification', 'Field (*) can\'t be left blank')
        }else {
            props.dispatch(createEpic({
                project_id: value.currentEpic.project_id,
                epic_name: value.epic_name,
                creator: value.currentEpic.creator,
                summary: value.summary
            }))
        }
    }
})(CreateEpic)

export default connect()(handleSubmitForm)