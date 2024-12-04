import Axios from "axios"
import { sendNotificationToValidUserWithAssigningToIssue, sendNotificationToValidUserWithCreatingIssues, sendNotificationToValidUserWithEditingIssues, sendNotificationToValidUserWithSomeoneWriteTheirWorklog, showNotificationWithIcon } from "../../util/NotificationUtil"
import { GET_INFO_ISSUE, GET_ISSUE_HISTORIES_LIST, GET_ISSUE_LIST, GET_ISSUES_BACKLOG, GET_ISSUES_IN_PROJECT, GET_WORKLOG_HISTORIES_LIST, USER_LOGGED_IN } from "../constants/constant"
import { GetProjectAction, GetSprintAction } from "./ListProjectAction"
import domainName from '../../util/Config'
import { delay } from "../../util/Delay"
import { updateUserInfo } from "./UserAction"
import { updateSprintAction } from "./CreateProjectAction"
import { attributesFiltering } from "../../util/IssueAttributesCreating"
export const createIssue = (props, project_id, creator_history, sprintId, issueParentId, projectInfo, userInfo) => {
    return async dispatch => {
        try {
            const res = await Axios.post(`${domainName}/api/issue/create`, props)
            if (res.status === 201) {

                //update working issues on auth service
                dispatch(updateUserInfo(creator_history, { working_issue: res.data.data._id, issue_action: "Created" }))
                //tien hanh tao history cho issue
                dispatch(createIssueHistory({
                    issue_id: res.data.data._id.toString(),
                    createBy: creator_history,
                    type_history: "created",
                    name_status: "issue",
                    old_status: null,
                    new_status: null
                }))

                //send notification to other user
                sendNotificationToValidUserWithCreatingIssues(projectInfo, userInfo, res.data.data, dispatch, creator_history)

                if (issueParentId !== null) {    //this case to insert sub-issue into sub_issue_list of issue parent
                    dispatch(updateInfoIssue(issueParentId, project_id, {
                        sub_issue_id: res.data.data._id
                    }, null, `${projectInfo.key_name}-${res.data.data.ordinal_number}`, creator_history, "added", "sub issue", projectInfo, userInfo))
                }
                if (sprintId !== null) {
                    //add this new issue to sprint
                    dispatch(updateSprintAction(sprintId, { issue_id: res.data.data._id, inserted_index: -1 }, project_id))
                } else {
                    dispatch(getIssuesBacklog(project_id, null))
                }

                // //sau khi tao thanh cong issue thi tien hanh cap nhat lai danh sach project
                // await Axios.put(`${domainName}/api/projectmanagement/insert/issue`, { project_id: props.projectId, issue_id: res.data?.data._id })

                //cap nhat lai thong tin ve project
                // dispatch(GetProjectAction(props.projectId, ""))
                showNotificationWithIcon('success', '', 'Successfully create issue')

                dispatch(getIssuesInProject(project_id, null))
            }

        } catch (error) {
            if (error.response?.status === 401) {
                showNotificationWithIcon('error', '', 'Please sign in before posting comment')
                dispatch({
                    type: USER_LOGGED_IN,
                    status: false,
                    userInfo: null
                })
                window.location.reload()
            } else {
                showNotificationWithIcon('error', '', 'Failed creation issue')
            }
        }
    }
}

export const getInfoIssue = (id) => {
    return async dispatch => {
        try {
            const res = await Axios.get(`${domainName}/api/issue/${id}`)
            dispatch({
                type: GET_INFO_ISSUE,
                issueInfo: res.data.data
            })
            await delay(1000)
        } catch (error) {
            console.log("error in getInfoIssue action", error)
        }
    }
}

export const getIssuesInProject = (projectId, props) => {
    return async dispatch => {
        try {
            const res = await Axios.post(`${domainName}/api/issue/all-issues/${projectId}`, props)
            dispatch({
                type: GET_ISSUES_IN_PROJECT,
                issuesInProject: res.data.data
            })
        } catch (error) {
            console.log(error)
        }
    }
}

export const importIssuesIntoNewProject = (project_props, issue_props, setLoadings, navigate) => {
    return async dispatch => {
        try {
            setLoadings(true)
            const keys = Object.keys(issue_props[0])

            const project_res = await Axios.post(`${domainName}/api/projectmanagement/create`, project_props)
            if (project_res.status === 201) {
                //sau khi tao xong thi tien hanh tao dashboard mac dinh
                const workflow_res = await Axios.post(`${domainName}/api/issueprocess/create/default/${project_res.data.data._id.toString()}`, {
                    workflow_default: project_props.workflow_default
                })
                const getSprintName = [], sprint_results = []
                const getEpicName = [], epic_results = []
                const getVersionName = [], version_results = []

                console.log("ket qua sau khi tao du an ", project_res);


                //proceed to create epic link or fix version
                if (keys.includes('epic_link')) {
                    for (let issue of issue_props) {
                        if (typeof issue['epic_link'] === 'string' && !getEpicName.includes(issue['epic_link'])) {
                            getEpicName.push(issue['epic_link'])
                        }
                    }
                    for (let epic_name of getEpicName) {
                        const epic_res = await Axios.post(`${domainName}/api/category/epic-create`,
                            {
                                epic_name: epic_name,
                                project_id: project_res.data.data._id,
                                creator: project_props.creator
                            }
                        )
                        if (epic_res.status !== 201) return
                        else {
                            epic_results.push({
                                epic_name: epic_name,
                                epic_id: epic_res.data.data._id
                            })
                        }
                    }
                }

                if (keys.includes('fix_version')) {
                    for (let issue of issue_props) {
                        if (typeof issue['fix_version'] === 'string' && !getVersionName.includes(issue['fix_version'])) {
                            getVersionName.push(issue['fix_version'])
                        }
                    }
                    for (let version_name of getVersionName) {
                        const version_res = await Axios.post(`${domainName}/api/category/version-create`,
                            {
                                version_name: version_name,
                                project_id: project_res.data.data._id,
                                creator: project_props.creator
                            }
                        )
                        if (version_res.status !== 201) return
                        else {
                            version_results.push({
                                version_name: version_name,
                                version_id: version_res.data.data._id
                            })
                        }
                    }
                }

                if (keys.includes('current_sprint')) {
                    for (let issue of issue_props) {
                        if (typeof issue['current_sprint'] === 'string' && !getSprintName.includes(issue['current_sprint'])) {
                            getSprintName.push(issue['current_sprint'])
                        }
                    }
                    for (let sprint_name of getSprintName) {
                        const sprint_res = await Axios.post(`${domainName}/api/sprint/create`,
                            {
                                sprint_name: sprint_name,
                                project_id: project_res.data.data._id
                            }
                        )
                        if (sprint_res.status !== 201) return
                        else {
                            sprint_results.push({
                                sprint_name: sprint_name,
                                sprint_id: sprint_res.data.data._id
                            })
                        }
                    }
                }

                var issues_converting = issue_props?.map(issue => {
                    const copyIssue = { ...issue }
                    const epicIndex = epic_results.findIndex(field => field.epic_name === issue['epic_link'])
                    if (epicIndex !== -1) {
                        copyIssue['epic_link'] = epic_results[epicIndex].epic_id
                    }

                    const versionIndex = version_results.findIndex(field => field.version_name === issue['fix_version'])
                    if (versionIndex !== -1) {
                        copyIssue['fix_version'] = version_results[versionIndex].version_id
                    }

                    const sprintIndex = sprint_results.findIndex(field => field.sprint_name === issue['current_sprint'])
                    if (sprintIndex !== -1) {
                        copyIssue['current_sprint'] = sprint_results[sprintIndex].sprint_id
                    }

                    return copyIssue
                })
                issues_converting = [...issues_converting.map(issue => {
                    const attributes = { ...issue }
                    attributes['creator'] = project_props.creator
                    attributes['project_id'] = project_res.data.data._id
                    if (!Object.keys(attributes).includes('issue_status')) {
                        attributes['issue_status'] = 0
                    }
                    if (!Object.keys(attributes).includes('issue_type')) {
                        attributes['issue_type'] = workflow_res.data.data[0]._id
                    } else {
                        const workflow_info = workflow_res.data.data.find(field => field.name_process?.toLowerCase() === attributes['issue_type']?.toLowerCase())
                        if (workflow_info) {
                            attributes['issue_type'] = workflow_info._id
                        }
                    }
                    return attributesFiltering(project_res.data.data, { ...attributes })
                })]
                if (Array.isArray(issues_converting)) {
                    for (let index = 0; index < chunkArray(issues_converting, 5).length; index++) {
                        const props = { data: chunkArray(issues_converting, 5)[index] }
                        console.log(" inde thu ", index, " da ", chunkArray(issues_converting, 5)[index]);

                        const res = await Axios.post(`${domainName}/api/issue/import-issues`, props)
                        console.log('so lan res tra ', index, ' gia tri ', res);

                        await delay(1000)
                    }

                    showNotificationWithIcon('success', '', 'Init Successfully')
                    navigate('/manager')
                    localStorage.removeItem('content')
                    localStorage.removeItem('file_info')
                    localStorage.removeItem('key_project')
                    localStorage.removeItem('project_name')
                    localStorage.removeItem('project_template')
                    localStorage.removeItem('tab-preview')
                    setLoadings(false)
                    return

                } else {
                    showNotificationWithIcon('error', '', 'Khong phai la mang')
                }
            }
        } catch (error) {
            console.log("error ", error);
            showNotificationWithIcon('error', '', 'failed import data to new project')
            navigate('/create-project/software-project/templates')
            setLoadings(false)
        }
    }
}

function chunkArray(array, chunkSize) {
    const result = []; // Mảng chứa các mảng nhỏ

    for (let i = 0; i < array.length; i += chunkSize) {
        const chunk = array.slice(i, i + chunkSize); // Lấy mảng con
        result.push(chunk); // Thêm mảng con vào kết quả
    }

    return result; // Trả về mảng chứa các mảng nhỏ
}

export const getIssuesBacklog = (projectId) => {
    return async dispatch => {
        try {
            const res = await Axios.get(`${domainName}/api/issue/backlog/${projectId}`)
            dispatch({
                type: GET_ISSUES_BACKLOG,
                issuesBacklog: res.data.data
            })
        } catch (error) {
            console.log(error)
        }
    }
}

export const updateIssueFromBacklog = (projectId, props) => {
    return async dispatch => {
        try {
            const res = await Axios.post(`${domainName}/api/issue/issue-backlog/${projectId}/`, props)
            if (res.status === 200) {
                dispatch(getIssuesBacklog(projectId))
                showNotificationWithIcon("success", "", res.data.message)
            }
        } catch (error) {
            console.log(error)
        }
    }
}

export const getAllIssue = () => {
    return async dispatch => {
        const getAllIssues = await Axios.get(`${domainName}/api/issue/issues/all`)
        if (getAllIssues.status === 200) {
            dispatch({
                type: GET_ISSUE_LIST,
                issueList: getAllIssues.data.data
            })
        }
    }
}

export const updateInfoIssue = (issueId, projectId, props, old_status, new_status, creator_history, type_history, name_status, projectInfo, userInfo) => {
    return async dispatch => {
        try {
            const res = await Axios.put(`${domainName}/api/issue/update/${issueId}`, { ...props, updateAt: Date.now() })
            if (res.status === 200) {
                //tien hanh tao history cho issue
                dispatch(createIssueHistory({
                    issue_id: res.data.data._id.toString(),
                    createBy: creator_history,
                    type_history: type_history,
                    name_status: name_status,
                    old_status: old_status,
                    new_status: new_status
                }))

                dispatch(updateUserInfo(creator_history, { working_issue: res.data.data._id, issue_action: "Updated" }))

                //if this is add a assignee
                if (props?.assignees) {
                    const getUserNameIndex = projectInfo?.members?.findIndex(user => user.user_info._id.toString() === props?.assignees)
                    if (getUserNameIndex !== -1) {
                        const getUsername = projectInfo?.members[getUserNameIndex].user_info.username
                        sendNotificationToValidUserWithAssigningToIssue(projectInfo, userInfo, res.data.data, dispatch, creator_history, props?.assignees, getUsername)
                    }
                }
                var typeUpdated = ""
                if (typeof props?.summary === "string") {
                    typeUpdated = "summary"
                } else if (typeof props?.current_sprint === "string") {
                    typeUpdated = "sprint"
                }
                else if (typeof props?.description === "string") {
                    typeUpdated = "description"
                }
                else if (typeof props?.fix_version === "string") {
                    typeUpdated = "fix version"
                }
                else if (typeof props?.epic_link === "string") {
                    typeUpdated = "epic link"
                }
                else if (typeof props?.story_point === "number") {
                    typeUpdated = "story point"
                }
                else if (typeof props?.issue_priority === "number") {
                    typeUpdated = "priority"
                }
                else if (typeof props?.issue_status === "number") {
                    typeUpdated = "status"
                }
                else if (typeof props?.timeOriginalEstimate === "string") {
                    typeUpdated = "time original estimate"
                }
                else if (typeof props?.timeOriginalEstimate === "string") {
                    typeUpdated = "time original estimate"
                }
                else if (typeof props?.start_date === "string") {
                    typeUpdated = "start date"
                }
                else if (typeof props?.end_date === "string") {
                    typeUpdated = "end date"
                }
                else if (typeof props?.issue_type === "string") {
                    typeUpdated = "issue type"
                }
                else if (typeof props?.uploaded_file_id === "string") {
                    typeUpdated = "a new file"
                }
                else if (typeof props?.isFlagged === "string") {
                    typeUpdated = "a flag"
                }
                else if (typeof props?.assignees === "string") {
                    typeUpdated = "an assignee"
                }

                if (typeUpdated.trim() !== "") {
                    sendNotificationToValidUserWithEditingIssues(projectInfo, userInfo, res.data.data, dispatch, creator_history, typeUpdated)
                }

                dispatch(getInfoIssue(issueId))
                dispatch(getIssuesBacklog(projectId))
                dispatch(getIssuesInProject(projectId, null))

                showNotificationWithIcon("success", "", res.data.message)
            }
        } catch (error) {
            if (error.response.status === 400) {
                showNotificationWithIcon('error', '', error.response.data.message)
            }
        }
    }
}

export const updateManyIssueAction = (sprint_id, project_id, props, projectInfo, userInfo, issuesList) => {
    return async dispatch => {
        try {
            const res = await Axios.post(`${domainName}/api/issue/update/issues/`, props)
            if (res.status === 200) {
                issuesList?.forEach(issue => {
                    sendNotificationToValidUserWithEditingIssues(projectInfo, userInfo, issue, dispatch, userInfo.id, 'Issue Type')
                })
                //lấy ra danh sách issue sau khi thay đổi
                dispatch(GetSprintAction(sprint_id))
                dispatch(getIssuesInProject(project_id, null))
                showNotificationWithIcon("success", "", res.data.message)
            }
        } catch (error) {

        }
    }
}

export const deleteAssignee = (issueId, projectId, userId) => {
    return async dispatch => {
        try {
            await Axios.put(`${domainName}/api/issue/delete/assignee/${issueId}`, { userId })
            //lấy ra danh sách issue sau khi thay đổi
            dispatch(getInfoIssue(issueId))

            //cap nhat lai danh sach project
            dispatch(GetProjectAction(projectId, ""))

            showNotificationWithIcon("success", "", "Successfully deleted user from this issue")


        } catch (error) {
            if (error.response.status === 401) {
                showNotificationWithIcon('error', '', 'Please sign in before posting comment')
                dispatch({
                    type: USER_LOGGED_IN,
                    status: false,
                    userInfo: null
                })
                window.location.reload()
            } else {
                showNotificationWithIcon('error', '', 'delete failed user from this issue')
            }
        }
    }
}

export const deleteIssue = (issueId) => {
    return async dispatch => {
        try {
            await Axios.delete(`${domainName}/api/issue/delete/${issueId}`)
            //lấy ra danh sách issue sau khi thay đổi
            dispatch(getInfoIssue(issueId))

            showNotificationWithIcon("success", "", "Successfully deleted this issue")


        } catch (error) {
            if (error.response.status === 401) {
                showNotificationWithIcon('error', '', 'Please sign in before posting comment')
                dispatch({
                    type: USER_LOGGED_IN,
                    status: false,
                    userInfo: null
                })
                window.location.reload()
            } else {
                showNotificationWithIcon('error', '', 'failed deletion this issue')
            }
        }
    }
}

export const getIssueHistoriesList = (issueId, sort) => {
    return async dispatch => {
        try {
            const res = await Axios.get(`${domainName}/api/issuehistory/issuehistory-list/${issueId}/${sort}`)
            if (res.status === 200) {
                //lấy ra danh sách issue sau khi thay đổi
                dispatch({
                    type: GET_ISSUE_HISTORIES_LIST,
                    historyList: res.data.data.histories
                })
            }
        } catch (error) {
            showNotificationWithIcon("error", "", "loi")
        }
    }
}

export const getWorklogHistoriesList = (issueId) => {
    return async dispatch => {
        try {
            const res = await Axios.get(`${domainName}/api/issuehistory/worklog-list/${issueId}`)
            //lấy ra danh sách issue sau khi thay đổi
            if (res.status === 200) {
                dispatch({
                    type: GET_WORKLOG_HISTORIES_LIST,
                    worklogList: res.data.data
                })
            }
        } catch (error) {
            console.log("error ", error);

            showNotificationWithIcon("error", "", "loi")
        }
    }
}

export const createIssueHistory = (props) => {
    return async dispatch => {
        try {
            await Axios.post(`${domainName}/api/issuehistory/issuehistory-create`, {
                issue_id: props.issue_id,
                createBy: props.createBy,
                type_history: props.type_history,
                name_status: props.name_status,
                old_status: props.old_status,
                new_status: props.new_status
            })
        } catch (error) {
            showNotificationWithIcon("error", "", "Error for creating history")
        }
    }
}

export const createWorklogHistory = (props, projectInfo, userInfo, issueInfo) => {
    return async dispatch => {
        try {
            const res = await Axios.post(`${domainName}/api/issuehistory/worklog-create`, props)

            if (res.status === 201) {
                sendNotificationToValidUserWithSomeoneWriteTheirWorklog(projectInfo, userInfo, issueInfo, dispatch)
                showNotificationWithIcon("success", "", res.data.message)
            }
        } catch (error) {
            console.log("error trong nay", error)

            showNotificationWithIcon("error", "", "Error for creating worklog")
        }
    }
}