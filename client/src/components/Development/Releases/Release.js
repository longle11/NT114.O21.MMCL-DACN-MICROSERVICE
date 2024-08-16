import Search from 'antd/es/input/Search'
import React from 'react'
import { Table } from 'antd';
import { useDispatch } from 'react-redux';
import { drawer_edit_form_action } from '../../../redux/actions/DrawerAction';
import CreateVersion from '../../Forms/CreateVersion/CreateVersion';
export default function Release() {
    const dispatch = useDispatch()
    const columns = [
        {
            title: 'Version',
            dataIndex: 'version',
            width: '10%',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            sorter: (a, b) => a.status - b.status,
            with: '10%'
        },
        {
            title: 'Progress',
            dataIndex: 'progress',
            width: '20%',
        },
        {
            title: 'Start date',
            dataIndex: 'startDate',
            width: '15%',
        },
        {
            title: 'Release date',
            dataIndex: 'releaseDate',
            width: '15%',
        },
        {
            title: 'Description',
            dataIndex: 'description',
            width: '30%',
        },
    ];
    const data = [
        {
            key: '1',
            name: 'John Brown',
            age: 32,
            address: 'New York No. 1 Lake Park',
        },
        {
            key: '2',
            name: 'Jim Green',
            age: 42,
            address: 'London No. 1 Lake Park',
        },
        {
            key: '3',
            name: 'Joe Black',
            age: 32,
            address: 'Sydney No. 1 Lake Park',
        },
        {
            key: '4',
            name: 'Jim Red',
            age: 32,
            address: 'London No. 2 Lake Park',
        },
    ];
    const onChange = (pagination, filters, sorter, extra) => {
        console.log('params', pagination, filters, sorter, extra);
    };
    return (
        <div >
            <p>Projects / longle project</p>
            <h5>Release</h5>
            {/* Phan chua thanh search va checkbox */}
            <div className="search-info-releases d-flex">
                <div className="search-block">
                    <Search
                        placeholder="input search text"
                        style={{ width: 300 }}
                        onSearch={value => {

                        }}
                    />
                </div>
            </div>
            <div className="d-flex flex-column align-items-center">
                <img alt="new img" style={{width: '200px'}} src="https://jira-frontend-bifrost.prod-east.frontend.public.atl-paas.net/assets/releases-80px.782fa98d.svg" />
                <p>Versions help you package and schedule project deliveries. <br /> Add a vision to start collecting and releasing your work</p>
                <button className='btn btn-primary' onClick={() => {
                    dispatch(drawer_edit_form_action(<CreateVersion />, 'Save', '500px'))
                }}>Create version</button>
            </div>
            <Table columns={columns} dataSource={data} onChange={onChange} />
        </div>
    )
}
