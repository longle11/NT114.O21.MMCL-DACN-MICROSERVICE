import { Avatar, Input, Select } from 'antd'
import React from 'react'
import { UserOutlined } from '@ant-design/icons';
export default function CreateIssue() {
    const handleChangeProjects = () => {

    }
    const handleChangeIssues = () => {

    }
    const optionProjects = [
        {
            value: 'jack',
            label: 'Jack',
        },
        {
            value: 'lucy',
            label: 'Lucy',
        },
        {
            value: 'Yiminghe',
            label: 'yiminghe',
        },
        {
            value: 'disabled',
            label: 'Disabled'
        },
    ]
    const optionIssues = [
        {
            value: 'jack',
            label: 'Jack',
        },
        {
            value: 'lucy',
            label: 'Lucy',
        },
        {
            value: 'Yiminghe',
            label: 'yiminghe',
        },
        {
            value: 'disabled',
            label: 'Disabled'
        },
    ]
    const reporterOptions = [
        { label: <>{<Avatar icon={<UserOutlined />} />} Longle</>, value: 0 },
        { label: <>{<Avatar icon={<UserOutlined />} />} Default user</>, value: 1 },
        { label: <>{<Avatar icon={<UserOutlined />} />} Hehe user</>, value: 2 }
    ]
    const nameOfTypeIssues = ['Epic', 'Story', 'Task', 'Bug']
    return (
        <div>
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
        </div>
    )
}
