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
    AppstoreOutlined
} from '@ant-design/icons';
import Sider from 'antd/es/layout/Sider';
export default function MenuBar() {
    const listProject = useSelector(state => state.listProject.listProject)
    const userInfo = useSelector(state => state.user.userInfo)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const projectInfo = useSelector(state => state.listProject.projectInfo)
    const absolutePath = `/projectDetail/${userInfo.project_working.toString()}`
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
            dispatch(GetProjectAction(id))
        }
    }, [])
    const [collapsed, setCollapsed] = useState(true);
    const handleOnClickItem = (e) => {
        const key = e.key
        if (key === 'sub11') {
            dispatch(GetProcessListAction(userInfo.project_working.toString()))
            return navigate(`${absolutePath}/board`)
        }
        else if (key === 'sub12') {
            dispatch(getIssuesBacklog(userInfo.project_working.toString()))
            return navigate(`${absolutePath}/backlog`)
        }
        else if (key === 'sub12') {
            return navigate(`${absolutePath}/active-sprints`)
        }
        else if (key === 'sub13') {
            return navigate(`${absolutePath}/issues`)
        }
        else if (key === 'sub15') {
            return navigate(`${absolutePath}/list`)
        }
        else if (key === 'sub16') {
            return navigate(`${absolutePath}/issues/issue-detail`)
        }
        else if (key === 'sub17') {
            return navigate(`${absolutePath}/workflows`)
        }
        else if (key === 'sub18') {
            return navigate(`${absolutePath}/calendar`)
        }
        else if (key === 'sub2') {
            return navigate(`${absolutePath}/reports`)
        }
        else if (key === 'sub3') {
            return navigate(`${absolutePath}/components`)
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
        else if (key === 'sub31') {
            return navigate(`${absolutePath}/settings/access`)
        }
        else if (key === 'sub32') {
            return navigate(`${absolutePath}/settings/issue-permissions`)
        }
    }
    const items = [
        getItem('PLANNING', '1', <i className="fa fa-tasks" aria-hidden="true"></i>, [
            getItem('WD board', 'sub1', <DashboardOutlined />, [
                getItem('Board', 'sub11'),
                getItem('Backlog', 'sub12'),
                getItem('Active sprints', 'sub13'),
                getItem('Reports', 'sub14'),
                getItem('List', 'sub15'),
                getItem('Issues', 'sub16'),
                getItem('Workflows', 'sub17'),
                getItem('Calendar', 'sub18'),
            ]),
            getItem('Issues', 'sub2', <i className="fa-solid fa-circle-exclamation"></i>),
            getItem('Components', 'sub3', <AppstoreOutlined />)
        ]),
        getItem('Development', '2', <DesktopOutlined />, [
            getItem('Code', 'sub21'),
            getItem('Releases', 'sub22'),
            getItem('Epics', 'sub23')
        ]),
        getItem('Settings', '3', <SettingOutlined />, [
            getItem('Add user', 'sub31'),
            getItem('Issue permissions', 'sub32')
        ]),
    ];
    return (
        <div>
            <Sider style={{ height: '100%' }} collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
                {!collapsed ? <div className="demo-logo-vertical bg-light">
                    <div className='d-flex align-items-center' style={{padding: '10px 20px'}}>
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
                <Menu theme="light" style={{ height: '100vh' }} defaultSelectedKeys={['1']} onClick={(e) => {
                    handleOnClickItem(e)
                }} mode="inline" items={items} />
            </Sider>

        </div>
    )
}
