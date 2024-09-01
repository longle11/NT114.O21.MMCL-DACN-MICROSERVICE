import { Avatar } from "antd"

export const iTagForIssueTypes = (type) => {
    //0 la story
    if (type == 0) {
        return <i className="fa-solid fa-bookmark mr-2" style={{ color: '#65ba43', fontSize: '20px' }} ></i>
    }
    //1 la task
    if (type == 1) {
        return <i className="fa-solid fa-square-check mr-2" style={{ color: '#4fade6', fontSize: '20px' }} ></i>
    }
    //2 la bug
    if (type == 2) {
        return <i className="fa-solid fa-circle-exclamation mr-2" style={{ color: '#cd1317', fontSize: '20px' }} ></i>
    }
    if (type == 3) {
        return <i className="fa-solid fa-bolt mr-2" style={{ color: 'purple', fontSize: '20px' }} ></i>
    }
    if (type == 4) {
        return <i className="fa-solid fa-list-check mr-2" style={{ color: '#e97f33', fontSize: '20px' }} ></i>
    }

    return null
}

export const iTagForPriorities = (priority) => {
    if (priority == 0) {
        return <i className="fa fa-angle-double-up mr-2" style={{ color: '#cd1317', fontSize: '20px' }} />
    }
    if (priority == 1) {
        return <i className="fa fa-chevron-up mr-2" style={{ color: '#e9494a', fontSize: '20px' }} />
    }
    if (priority == 2) {
        return <i className="fa fa-equals mr-2" style={{ color: '#e97f33', fontSize: '20px' }} />
    }
    if (priority == 3) {

        return <i className="fa fa-chevron-down mr-2" style={{ color: '#2d8738', fontSize: '20px' }} />
    }
    if (priority == 4) {
        return <i className="fa fa-angle-double-down mr-2" style={{ color: '#57a55a', fontSize: '20px' }} />
    }

    return null
}
export const priorityTypeOptions = [
    { label: <span className="align-items-center d-flex">{iTagForPriorities(0)} Highest</span>, value: 0 },
    { label: <span className="align-items-center d-flex">{iTagForPriorities(1)} High</span>, value: 1 },
    { label: <span className="align-items-center d-flex">{iTagForPriorities(2)} Medium</span>, value: 2 },
    { label: <span className="align-items-center d-flex">{iTagForPriorities(3)} Low</span>, value: 3 },
    { label: <span className="align-items-center d-flex">{iTagForPriorities(4)} Lowest</span>, value: 4 }
]
export const issueTypeOptions = [
    { label: <span className="align-items-center d-flex">{iTagForIssueTypes(0)} Story</span>, value: 0 },
    { label: <span className="align-items-center d-flex">{iTagForIssueTypes(1)} Task</span>, value: 1 },
    { label: <span className="align-items-center d-flex">{iTagForIssueTypes(2)} Bug</span>, value: 2 },
    { label: <span className="align-items-center d-flex">{iTagForIssueTypes(3)} Epic</span>, value: 3 },
    { label: <span className="align-items-center d-flex">{iTagForIssueTypes(4)} Subtask</span>, value: 4 }

]
export const issueTypeWithoutOptions = [
    { label: <span className="align-items-center d-flex">{iTagForIssueTypes(0)} </span>, value: 0 },
    { label: <span className="align-items-center d-flex">{iTagForIssueTypes(1)} </span>, value: 1 },
    { label: <span className="align-items-center d-flex">{iTagForIssueTypes(2)} </span>, value: 2 },
    { label: <span className="align-items-center d-flex">{iTagForIssueTypes(3)} </span>, value: 3 },
    { label: <span className="align-items-center d-flex">{iTagForIssueTypes(4)} </span>, value: 4 },
]

export const userPermissions = [
    {
        label: 'Administrator',
        value: '0',
    },
    {
        label: 'Member',
        value: '1',
    },
    {
        label: 'Viewer',
        value: '2',
    },
]

export const renderListProject = (listProject) => {
    if (!listProject) return []
    return listProject?.map(project => {
        return {
            label: <div className='d-flex align-items-center' style={{ width: 'max-content' }}>
                <Avatar shape="square" size="thin" className="mr-2" src={"https://z45letranphilong.atlassian.net/rest/api/2/universal_avatar/view/type/project/avatar/10406?size=medium"} />

                <span style={{ fontSize: 13, fontWeight: "bold" }}>{project.name_project}</span>
            </div>,
            value: project._id
        }
    })
}

export const renderEpicList = (epicList, project_id) => {
    if (!epicList) return []
    return epicList.filter(epic => epic.project_id === project_id).map(epic => {
        return {
            label: epic.epic_name,
            value: epic._id
        }
    })
}

export const renderVersionList = (versionList, project_id) => {
    if (!versionList) return []
    return versionList.filter(version => version.project_id === project_id).map(version => {
        return {
            label: version.version_name,
            value: version._id
        }
    })
}
export const renderSprintList = (sprintList, project_id) => {
    if (!sprintList) return []

    return sprintList.filter(sprint => sprint.project_id === project_id && (sprint.sprint_status === "pending" || sprint.sprint_status === "processing")).map(sprint => {
        return {
            label: sprint.sprint_name,
            value: sprint._id
        }
    })
}

export const renderIssueType = (processList, project_id) => {
    if (!processList) return []
    return processList.filter(process => process.project_id === project_id).map(process => {
        return {
            label: process.name_process,
            value: process._id
        }
    })
}

export const renderAssignees = (listProject, project_id, userInfo) => {
    if (!listProject) return []
    const index = listProject.findIndex(project => project._id === project_id)
    if (index !== -1) {
        console.log("thang lay ra duoc listProject[index] ", listProject[index].members);
        
        return listProject[index].members.filter(user => user.user_info._id !== userInfo.id).map(user => {
            return {
                desc: <div className='d-flex align-items-center' style={{ width: 'fit-content' }}>
                    <Avatar src={"https://ui-avatars.com/api/?name=longle2003"} />
                    <div className='d-flex flex-column'>
                        <span style={{ fontSize: 13, fontWeight: 'bold' }}>{user.user_info.username}</span>
                        <span style={{ fontSize: 11 }}>{user.user_info.email}</span>
                    </div>
                </div>,
                label: user.user_info.username,
                value: user.user_info._id
            }
        })
    }
    return []
}