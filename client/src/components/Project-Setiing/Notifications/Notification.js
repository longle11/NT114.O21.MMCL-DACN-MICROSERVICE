import { Breadcrumb, Button, Table } from 'antd'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { NavLink, useParams } from 'react-router-dom'
import { users_notifications } from '../../../util/NotificationUtil'
import { GetProjectAction } from '../../../redux/actions/ListProjectAction'
import { displayComponentInModal } from '../../../redux/actions/ModalAction'
import AddNotificationModal from '../../Modal/AddNotificationModal/AddNotificationMoadl'

export default function Notification() {
    const { id } = useParams()
    const projectInfo = useSelector(state => state.listProject.projectInfo)
    console.log("projectInfo ", projectInfo);
    const dispatch = useDispatch()
    useEffect(() => {
        if(id) {
            dispatch(GetProjectAction(id, null, null))
        }
    }, [])
    const columns = [
        {
            title: 'Event',
            dataIndex: 'event_name',
            key: 'event_name',
        },
        {
            title: 'Recipient',
            dataIndex: 'user_types_is_received_notifications',
            key: 'user_types_is_received_notifications',
            render: (text, record, index) => {
                const textData = record?.user_types_is_received_notifications?.reduce((newStr, currentIndex) => {
                    const getIndex = users_notifications?.findIndex(value => value.id === currentIndex)
                    if(getIndex !== -1) {
                        return newStr + users_notifications[getIndex].name + ", "

                    }
                }, "")?.trim()
                return textData?.substring(0, textData.length - 1)
            }
        },
        {
            title: 'Actions',
            dataIndex: '',
            key: '',
            render: (text, record, index) => {
                return <div className='d-flex align-items-center'>
                    <Button onClick={() => {
                        dispatch(displayComponentInModal(<AddNotificationModal projectInfo={projectInfo} notificationEvent={record}/>, '500px', "Edit notification"))
                    }} type='primary' className='mr-2'>Edit</Button>
                    <Button>Delete</Button>
                </div>
            }
        },
    ];
    return (
        <div>
            <Breadcrumb
                style={{ marginBottom: 10 }}
                items={[
                    {
                        title: <a href="/manager">Projects</a>,
                    },
                    {
                        title: <a href={`/projectDetail/${id}/board`}>{projectInfo?.name_project}</a>,
                    }
                ]}
            />

            <div style={{ padding: '10px 10%' }}>
                <div className='d-flex justify-content-between'>
                    <h4>Notifications</h4>
                    <Button type='primary' onClick={() => {
                        dispatch(displayComponentInModal(<AddNotificationModal notificationEvent={null} projectInfo={projectInfo}/>, "500px", "Add notification"))
                    }}>Add notification</Button>
                </div>
                <div className='mt-2'>
                    <span>
                        TaskScheduler can send people or roles an email when events happen on an issue - for example, when someone posts comments or updates new on an issue. Settings on this page will be overridden by a user’s 
                        <NavLink> personal notification preferences.</NavLink>
                    </span>
                    <Table pagination={false} className='mt-4' dataSource={projectInfo?.notification_config?.filter(notification_config => notification_config?.is_activated)} columns={columns} />
                </div>
            </div>
        </div>
    )
}
