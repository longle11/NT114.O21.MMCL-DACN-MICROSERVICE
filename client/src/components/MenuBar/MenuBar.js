import { Avatar, Menu } from 'antd';
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { GetProcessListAction, GetProjectAction } from '../../redux/actions/ListProjectAction';
import { getIssuesBacklog } from '../../redux/actions/IssueAction';
import {
    DesktopOutlined,
    SettingOutlined,
    DashboardOutlined,
    AppstoreOutlined,
    CalendarOutlined,
    IssuesCloseOutlined,
    OrderedListOutlined,
    MonitorOutlined,
    LineChartOutlined,
    TagOutlined,
    UserAddOutlined,
    SafetyOutlined,
    NodeIndexOutlined,
    EditOutlined,
    NotificationOutlined
} from '@ant-design/icons';
import Sider from 'antd/es/layout/Sider';
export default function MenuBar() {
    const listProject = useSelector(state => state.listProject.listProject)
    const userInfo = useSelector(state => state.user.userInfo)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const projectInfo = useSelector(state => state.listProject.projectInfo)
    
    const absolutePath = `/projectDetail/${userInfo?.project_working.toString()}`
    const { id } = useParams()
    function getItem(label, key, icon, children, type) {
        return {
            key,
            icon,
            children,
            label,
            type,
        };
    }
    useEffect(() => {
        if (id) {
            dispatch(GetProjectAction(id, null, null))
        }
    }, [])
    const [collapsed, setCollapsed] = useState(true);
    const handleOnClickItem = (e) => {
        const key = e.key
        if (key === 'sub1.1.2') {
            return navigate(`${absolutePath}/board/${projectInfo?.sprint_id ? projectInfo?.sprint_id : ''}`)
        }
        else if (key === 'sub1.1.1') {
            dispatch(getIssuesBacklog(userInfo.project_working.toString()))
            return navigate(`${absolutePath}/backlog`)
        }
        // else if (key === 'sub1.1.2') {
        //     return navigate(`${absolutePath}/active-sprints`)
        // }
        else if (key === 'sub1.2') {
            return navigate(`${absolutePath}/issues/issue-detail`)
        }
        else if (key === 'sub1.3') {
            return navigate(`${absolutePath}/reports`)
        }
        else if (key === 'sub1.4') {
            return navigate(`${absolutePath}/list`)
        }
        else if (key === 'sub1.1.7') {
            return navigate(`${absolutePath}/kanban-board`)
        }

        else if (key === 'sub1.6') {
            return navigate(`${absolutePath}/calendar`)
        }
        else if (key === 'sub2') {
            return navigate(`${absolutePath}/reports`)
        }
        else if (key === 'sub21') {
            return navigate(`${absolutePath}/code`)
        }
        else if (key === 'sub22') {
            return navigate(`${absolutePath}/releases`)
        }
        else if (key === 'sub23') {
            return navigate(`${absolutePath}/epics`)
        }
        else if (key === 'sub24') {
            return navigate(`${absolutePath}/components`)
        }
        else if (key === 'sub31') {
            return navigate(`${absolutePath}/settings/access`)
        }
        else if (key === 'sub32') {
            return navigate(`${absolutePath}/settings/issue-permissions`)
        }
        else if (key === 'sub33') {
            return navigate(`${absolutePath}/settings/notifications`)
        }
        else if (key === 'sub34') {
            return navigate(`${absolutePath}/settings/issues`)
        }
        else if (key === 'sub35') {
            return navigate(`${absolutePath}/workflows`)
        }
    }

    const items = () => {
        if (projectInfo?.template_name?.toLowerCase() === 'kanban') {
            return [
                getItem('PLANNING', '1', <i className="fa fa-tasks" aria-hidden="true"></i>, [
                    getItem(`${projectInfo?.key_name} board`, 'sub1', <DashboardOutlined />, [
                        getItem('Board', 'sub1.1.7'),
                    ]),
                    getItem('Issues', 'sub1.2', <CalendarOutlined />),
                    getItem('Reports', 'sub1.3', <LineChartOutlined />),
                    getItem('List', 'sub1.4', <OrderedListOutlined />),
                    getItem('Calendar', 'sub1.6', <CalendarOutlined />)
                ]),
                getItem('Development', '2', <DesktopOutlined />, [
                    getItem('Code', 'sub21'),
                    getItem('Releases', 'sub22'),
                    getItem('Components', 'sub24', <AppstoreOutlined />)
                ]),
                getItem('Settings', '3', <SettingOutlined />, [
                    getItem('Add user', 'sub31'),
                    getItem('Issue permissions', 'sub32'),
                    getItem('Notifications', 'sub33'),
                    getItem('Edit issues', 'sub34'),
                    getItem('Workflows', 'sub35'),
                ]),
            ]
        } else if (projectInfo?.template_name?.toLowerCase() === 'scrum') {
            return [
                getItem('PLANNING', '1', <i className="fa fa-tasks" aria-hidden="true"></i>, [
                    getItem(`${projectInfo?.key_name} board`, 'sub1', <DashboardOutlined />, [
                        getItem('Backlog', 'sub1.1.1', <TagOutlined />),
                        getItem('Active sprints', 'sub1.1.2', <DashboardOutlined />),

                    ]),
                    getItem('Issues', 'sub1.2', <CalendarOutlined />),
                    getItem('Reports', 'sub1.3', <LineChartOutlined />),
                    getItem('List', 'sub1.4', <OrderedListOutlined />),
                    getItem('Calendar', 'sub1.6', <CalendarOutlined />)
                ]),
                getItem('Development', '2', <DesktopOutlined />, [
                    getItem('Code', 'sub21'),
                    getItem('Releases', 'sub22', <i className="fa-solid fa-folder-open"></i>),
                    getItem('Epics', 'sub23', <i className="fa fa-bolt"></i>),
                    getItem('Components', 'sub24', <AppstoreOutlined />)
                ]),
                getItem('Settings', '3', <SettingOutlined />, [
                    getItem('Add user', 'sub31', <UserAddOutlined />),
                    getItem('Issue permissions', 'sub32', <SafetyOutlined />),
                    getItem('Notifications', 'sub33', <NotificationOutlined />),
                    getItem('Edit issues', 'sub34', <EditOutlined />),
                    getItem('Workflows', 'sub35', <NodeIndexOutlined />),
                ]),
            ]
        }


        return []

    }
    return (
        <div>
            <Sider style={{ height: '100%' }} collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
                {!collapsed ? <div className="demo-logo-vertical bg-light">
                    <div className='d-flex align-items-center' style={{ padding: '10px 20px' }}>
                        <div className='project-img mr-2'>
                            <Avatar shape='square' src="https://z45letranphilong.atlassian.net/rest/api/2/universal_avatar/view/type/project/avatar/10406?size=medium" />
                        </div>
                        <div className='project-info' style={{ fontSize: '12px' }}>
                            <p className='mb-1'>{projectInfo.name_project}</p>
                            <span>Software project</span>
                        </div>
                    </div>
                </div> : <div className='bg-light d-flex justify-content-center'>
                    <Avatar shape='square' src="https://z45letranphilong.atlassian.net/rest/api/2/universal_avatar/view/type/project/avatar/10406?size=medium" />
                </div>}
                <Menu
                    theme="light"
                    style={{ height: '100vh' }}
                    defaultSelectedKeys={['1']}
                    onClick={(e) => {
                        handleOnClickItem(e)
                    }}
                    mode="inline"
                    items={items()} />
            </Sider>
        </div>
    )
}
