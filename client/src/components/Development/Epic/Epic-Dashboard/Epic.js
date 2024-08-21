import React, { useEffect } from 'react'
import { drawer_edit_form_action } from '../../../../redux/actions/DrawerAction';
import CreateEpic from '../../../Forms/CreateEpic/CreateEpic';
import { Avatar, Table } from 'antd';
import Search from 'antd/es/input/Search';
import { useDispatch, useSelector } from 'react-redux';
import { getEpicList } from '../../../../redux/actions/CategoryAction';
import { NavLink, useParams } from 'react-router-dom';

export default function Epic() {
    const dispatch = useDispatch()
    const { id } = useParams()
    const epicList = useSelector(state => state.categories.epicList)
    const userInfo = useSelector(state => state.user.userInfo)
    useEffect(() => {
        dispatch(getEpicList(id))
    }, [])
    const columns = [
        {
            title: 'Epic',
            dataIndex: 'epic',
            width: '25%',
            render: (text, record) => {
                return <NavLink to={`/projectDetail/${id}/epics/epic-detail/${record._id.toString()}`}>{record.epic_name}</NavLink>
            }
        },
        {
            title: 'Issues',
            dataIndex: 'issue_list',
            with: '10%',
            render: (text, record) => {
                return <span>{record.issue_list.length} issues</span>
            }
        },
        {
            title: 'Creator',
            dataIndex: 'creator',
            width: '15%',
            render: (text, record) => {
                if(record.creator === null) {
                    return null
                }
                return <span><Avatar src={record.creator.avatar} className='mr-2'/>{record.creator.username}</span>
            }
        },
        {
            title: 'Summary',
            dataIndex: 'summary',
            width: '50%',
            render: (text, record) => {
                return <span>{record.summary}</span>
            }
        }
    ];
    return (
        <div >
            <p>Projects / longle project</p>
            <h5>Epic</h5>
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
                <img alt="new img" style={{ width: '200px' }} src="https://jira-frontend-bifrost.prod-east.frontend.public.atl-paas.net/assets/releases-80px.782fa98d.svg" />
                <p>Versions help you package and schedule project deliveries. <br /> Add a vision to start collecting and releasing your work</p>
                <button className='btn btn-primary' onClick={() => {
                    dispatch(drawer_edit_form_action(<CreateEpic currentEpic={{project_id: id, creator: userInfo.id, epic_name: '', summary: '' }}/>, 'Save', '500px'))
                }}>Create version</button>
            </div>
            <Table columns={columns} dataSource={epicList} />
        </div>
    )
}
