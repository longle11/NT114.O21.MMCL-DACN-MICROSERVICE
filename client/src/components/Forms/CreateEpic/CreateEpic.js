import { Avatar, Input, Select } from 'antd'
import React, { useEffect } from 'react'
import { UserOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { submit_edit_form_action } from '../../../redux/actions/DrawerAction';
import { createEpic } from '../../../redux/actions/CategoryAction';
export default function CreateEpic() {
    const handleChangeProjects = () => {

    }
    const handleChangeIssues = () => {

    }
    const dispatch = useDispatch()
    useEffect(() => {
        // //submit sự kiện để gửi lên form
        dispatch(submit_edit_form_action(handleSubmit))
        // eslint-disable-next-line
    }, [])
    const userInfo = useSelector(state => state.user.userInfo)
    const {id} = useParams()
    const handleSubmit = () => {
        dispatch(createEpic({
            project_id: id,
            epic_name: "test",
            creator: null,
            summary: "1 chut test ve epic"
        }))
    }
    const optionProjects = [
        {
            value: 'new project',
            label: `${id}`,
        }
    ]
    const optionIssues = [
        {
            value: 'epic',
            label: 'Epic',
        }
    ]
    const reporterOptions = [
        { label: <>{<Avatar src={userInfo.avatar} />} {userInfo.username}</>, value: 0 },
        { label: <>{<Avatar icon={<UserOutlined />} />} Default user</>, value: 1 },
        { label: <>{<Avatar icon={<UserOutlined />} />} Hehe user</>, value: 2 }
    ]
    // const nameOfTypeIssues = ['Story', 'Task', 'Bug']
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
                        defaultValue="lucy"
                        className='form-control p-0'
                        style={{
                            width: '40%',
                            border: 'none'
                        }}
                        onChange={handleChangeProjects}
                        options={optionProjects}
                    />
                </div>
                <div className='form-group'>
                    <label htmlFor='issueTypeForm' className='p-0'>Issue type <span className='text-danger'>*</span></label>
                    <Select id="issueTypeForm"
                        defaultValue="lucy"
                        className='form-control p-0'
                        style={{
                            width: '40%',
                            border: 'none'
                        }}
                        onChange={handleChangeIssues}
                        options={optionIssues}
                    />
                </div>
            </div>
            <hr className='mt-5 mb-4' />
            <div className='form-group'>
                <label htmlFor='epicNameForm' className='p-0'>Epic name <span className='text-danger'>*</span></label>
                <Input id='epicNameForm' className='form-control' />
                <small className='mt-2 form-text text-muted'>Provide a short name to edentify this epic.</small>
            </div>
            <div className='form-group'>
                <label htmlFor='summaryNameForm' className='p-0'>Summary <span className='text-danger'>*</span></label>
                <Input id='summaryNameForm' className='form-control' />
            </div>
            <div className='form-group'>
                <label htmlFor='reporterForm' className='p-0'>Reporter <span className='text-danger'>*</span></label>
                <Select className='form-control' style={{ border: 'none', padding: '0', width: '40%' }} id="reporterForm" defaultValue={reporterOptions[0].value} options={reporterOptions}/>
            </div>
        </form>
    )
}
