import React from 'react'
import { DatePicker, Input } from 'antd';
export default function CreateVersion() {
    const onChangeStartDate = (date, dateString) => {
        console.log(date, dateString);
    };
    const onChangeReleaseDate = (date, dateString) => {
        console.log(date, dateString);
    };
    const dateFormatList = ['DD/MM/YYYY', 'DD/MM/YY', 'DD-MM-YYYY', 'DD-MM-YY'];
    return (
        <div>
            <h5>Create version</h5>
            <div className='name-version form-group'>
                <label htmlFor='nameForm'>Name <span className='text-danger'>*</span></label>
                <Input id="nameForm" placeholder='Enter your version'/>
            </div>
            <div className='d-flex'>
                <div className='startdate-release'>
                    <p className='m-0'>Start date</p>
                    <DatePicker format={dateFormatList} onChange={onChangeStartDate()}/>
                </div>
                <div className='enddate-release ml-4'>
                    <p className='m-0'>Release date</p>
                    <DatePicker format={dateFormatList} onChange={onChangeReleaseDate()}/>
                </div>
            </div>
            <div className='description-version form-group mt-3'>
                <label htmlFor='descriptionForm'>Description</label>
                <Input id="descriptionForm" placeholder='Enter your description'/>
            </div>
        </div>
    )
}
