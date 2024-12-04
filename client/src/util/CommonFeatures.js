import { Avatar } from "antd"
import { showNotificationWithIcon } from "./NotificationUtil"
import { getValueOfNumberFieldInIssue, getValueOfObjectFieldInIssue, getValueOfStringFieldInIssue } from "./IssueFilter"
import React from 'react';



export const iTagForIssueTypes = (type, marginRight, fontSize, issue_status_default) => {
    if (fontSize === null) fontSize = 18
    if (marginRight === null) marginRight = "mr-2"
    const issue_status_arrs = issue_status_default?.map(status => {
        return <i className={`fa-solid ${status.icon_type} ${marginRight}`} style={{ color: status.icon_color, fontSize: fontSize }} ></i>
    })
    if (issue_status_arrs?.length > 0) {
        return issue_status_arrs[type]
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

export const issueTypeOptions = (issue_status_default) => {
    if (issue_status_default?.length > 0) {
        return issue_status_default?.map(status => {
            return { label: <span className="align-items-center d-flex">{iTagForIssueTypes(status.icon_id, null, null, issue_status_default)} {status.icon_name}</span>, value: status.icon_id }
        })
    }
    return []
}
export const issueTypeWithoutOptions = (issue_status_default) => {
    if (issue_status_default?.length > 0) {
        return issue_status_default?.map(status => {
            return { label: <span className="align-items-center d-flex">{iTagForIssueTypes(status.icon_id, null, null, issue_status_default)}</span>, value: status.icon_id }
        })
    }
    return []
}

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

export const renderComponentList = (componentList, project_id) => {
    if (!componentList) return []
    return componentList.filter(component => component.project_id === project_id).map(component => {
        return {
            label: component.component_name,
            value: component._id
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

export const renderSubIssueOptions = (issuesInProject) => {
    console.log("issuesInProject ",issuesInProject?.filter(issue => getValueOfNumberFieldInIssue(issue, 'issue_status') === 4 && getValueOfObjectFieldInIssue(issue, 'parent') === null));
    
    return issuesInProject?.filter(issue => getValueOfNumberFieldInIssue(issue, 'issue_status') === 4 && getValueOfObjectFieldInIssue(issue, 'parent') === null).map(subIssue => {
        return {
            label: <div className='d-flex align-items-center'>
                <span className='mr-1'>{iTagForIssueTypes(getValueOfNumberFieldInIssue(subIssue, 'issue_status'), null, 20)}</span>
                <span className='mr-2'>WD-{subIssue.ordinal_number}</span>
                <span>{getValueOfStringFieldInIssue(subIssue, 'summary')}</span>
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