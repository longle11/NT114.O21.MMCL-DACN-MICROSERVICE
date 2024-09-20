import { Avatar } from "antd"
import { showNotificationWithIcon } from "./NotificationUtil"


export const iTagForIssueTypes = (type, marginRight, fontSize) => {
    if (fontSize === null) fontSize = 18
    if (marginRight === null) marginRight = "mr-2"
    //0 la story
    if (type == 0) {
        return <i className={`fa-solid fa-bookmark ${marginRight}`} style={{ color: '#65ba43', fontSize: fontSize }} ></i>
    }
    //1 la task
    if (type == 1) {
        return <i className={`fa-solid fa-square-check ${marginRight}`} style={{ color: '#4fade6', fontSize: fontSize }} ></i>
    }
    //2 la bug
    if (type == 2) {
        return <i className={`fa-solid fa-circle-exclamation ${marginRight}`} style={{ color: '#cd1317', fontSize: fontSize }} ></i>
    }
    if (type == 3) {
        return <i className={`fa-solid fa-bolt ${marginRight}`} style={{ color: 'purple', fontSize: fontSize }} ></i>
    }
    if (type == 4) {
        return <i className={`fa-solid fa-list-check ${marginRight}`} style={{ color: '#e97f33', fontSize: fontSize }} ></i>
    }

    return null
}

export const iTagForPriorities = (priority, marginRight, fontSize) => {
    if (fontSize === null) fontSize = 18
    if (marginRight === null) marginRight = "mr-2"
    if (priority == 0) {
        return <i className={`fa fa-angle-double-up ${marginRight}`} style={{ color: '#cd1317', fontSize: fontSize }} />
    }
    if (priority == 1) {
        return <i className={`fa fa-chevron-up ${marginRight}`} style={{ color: '#e9494a', fontSize: fontSize }} />
    }
    if (priority == 2) {
        return <i className={`fa fa-equals ${marginRight}`} style={{ color: '#e97f33', fontSize: fontSize }} />
    }
    if (priority == 3) {

        return <i className={`fa fa-chevron-down ${marginRight}`} style={{ color: '#2d8738', fontSize: fontSize }} />
    }
    if (priority == 4) {
        return <i className={`fa fa-angle-double-down ${marginRight}`} style={{ color: '#57a55a', fontSize: fontSize }} />
    }

    return null
}
export const priorityTypeOptions = [
    { label: <span className="align-items-center d-flex">{iTagForPriorities(0, null, null)} Highest</span>, value: 0 },
    { label: <span className="align-items-center d-flex">{iTagForPriorities(1, null, null)} High</span>, value: 1 },
    { label: <span className="align-items-center d-flex">{iTagForPriorities(2, null, null)} Medium</span>, value: 2 },
    { label: <span className="align-items-center d-flex">{iTagForPriorities(3, null, null)} Low</span>, value: 3 },
    { label: <span className="align-items-center d-flex">{iTagForPriorities(4, null, null)} Lowest</span>, value: 4 }
]

export const priorityTypeWithouOptions = [
    { label: <span className="align-items-center d-flex">{iTagForPriorities(0, "m-0", 20)}</span>, value: 0 },
    { label: <span className="align-items-center d-flex">{iTagForPriorities(1, "m-0", 20)}</span>, value: 1 },
    { label: <span className="align-items-center d-flex">{iTagForPriorities(2, "m-0", 20)}</span>, value: 2 },
    { label: <span className="align-items-center d-flex">{iTagForPriorities(3, "m-0", 20)}</span>, value: 3 },
    { label: <span className="align-items-center d-flex">{iTagForPriorities(4, "m-0", 20)}</span>, value: 4 }
]

export const issueTypeOptions = [
    { label: <span className="align-items-center d-flex">{iTagForIssueTypes(0, null, null)} Story</span>, value: 0 },
    { label: <span className="align-items-center d-flex">{iTagForIssueTypes(1, null, null)} Task</span>, value: 1 },
    { label: <span className="align-items-center d-flex">{iTagForIssueTypes(2, null, null)} Bug</span>, value: 2 },
    { label: <span className="align-items-center d-flex">{iTagForIssueTypes(3, null, null)} Epic</span>, value: 3 },
    { label: <span className="align-items-center d-flex">{iTagForIssueTypes(4, null, null)} Subtask</span>, value: 4 }

]
export const issueTypeWithoutOptions = [
    { label: <span className="align-items-center d-flex">{iTagForIssueTypes(0, null, null)} </span>, value: 0 },
    { label: <span className="align-items-center d-flex">{iTagForIssueTypes(1, null, null)} </span>, value: 1 },
    { label: <span className="align-items-center d-flex">{iTagForIssueTypes(2, null, null)} </span>, value: 2 },
    { label: <span className="align-items-center d-flex">{iTagForIssueTypes(3, null, null)} </span>, value: 3 },
    { label: <span className="align-items-center d-flex">{iTagForIssueTypes(4, null, null)} </span>, value: 4 },
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

export const renderSubIssueOptions = (issuesBacklog) => {
    return issuesBacklog?.filter(issue => issue.issue_status === 4 && issue.parent === null).map(subIssue => {
        return {
            label: <div className='d-flex align-items-center'>
                <span className='mr-1'>{iTagForIssueTypes(subIssue.issue_status, null, 20)}</span>
                <span className='mr-2'>WD-{subIssue.ordinal_number}</span>
                <span>{subIssue.summary}</span>
            </div>,
            value: subIssue._id
        }
    })
}

export const CopyLinkButton = (url) => {
    const linkToCopy = url
    navigator.clipboard.writeText(linkToCopy)
        .then(() => {
            showNotificationWithIcon('success', '', 'Copy Successfully')
        })
        .catch(err => {
            console.error('Lỗi khi sao chép: ', err);
        });
};


//create default type for issue base on workflow's status
export const defaultForIssueType = (current_status, workflowList, processList) => {
    const getCurrentWorkflowsActive = workflowList?.filter(workflow => workflow.isActivated)
    if (getCurrentWorkflowsActive !== null && getCurrentWorkflowsActive.length === 0) {
        //it means that doesn't have any workflow is applied so we will get the first value in process
        return processList[0]._id
    } else {
        //proceed to get workflow contains current_status
        const getWorkflow = getCurrentWorkflowsActive?.filter(workflow => workflow.issue_statuses.includes(current_status))
        if (getWorkflow !== null && getWorkflow.length === 0) {  //although existing workflows, it doesn't contains this status
            return processList[0]._id
        } else {
            const edges = getWorkflow[0].edges
            //get the edge has souce id equal 0
            const getEdge = edges.filter(edge => edge.source === '0')
            //proceed link that destination of edges to default issue type

            return getEdge[0].target
        }
    }
}