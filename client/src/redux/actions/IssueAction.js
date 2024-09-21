import Axios from "axios"
import { sendNotificationToValidUserWithAssigningToIssue, sendNotificationToValidUserWithCreatingIssues, sendNotificationToValidUserWithEditingIssues, sendNotificationToValidUserWithSomeoneWriteTheirWorklog, showNotificationWithIcon } from "../../util/NotificationUtil"
import { GET_INFO_ISSUE, GET_ISSUE_HISTORIES_LIST, GET_ISSUE_LIST, GET_ISSUES_BACKLOG, GET_ISSUES_IN_PROJECT, GET_WORKLOG_HISTORIES_LIST, USER_LOGGED_IN } from "../constants/constant"
import { GetProjectAction, GetSprintAction, GetSprintListAction } from "./ListProjectAction"
import domainName from '../../util/Config'
import { delay } from "../../util/Delay"
import { updateUserInfo } from "./UserAction"
import { updateSprintAction } from "./CreateProjectAction"
import { createNotificationAction } from "./NotificationAction"
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
                    }, null, `WD-${res.data.data.ordinal_number}`, creator_history, "added", "sub issue"))
                }
                if (sprintId !== null) {
                    //add this new issue to sprint
                    dispatch(updateSprintAction(sprintId, { issue_id: res.data.data._id }))
                    dispatch(GetSprintListAction(project_id))
                } else {
                    dispatch(getIssuesBacklog(project_id))
                }

                // //sau khi tao thanh cong issue thi tien hanh cap nhat lai danh sach project
                // await Axios.put(`${domainName}/api/projectmanagement/insert/issue`, { project_id: props.projectId, issue_id: res.data?.data._id })

                //cap nhat lai thong tin ve project
                // dispatch(GetProjectAction(props.projectId, ""))
                showNotificationWithIcon('success', '', 'Successfully create issue')

                dispatch(getIssuesInProject(project_id))
            }

        } catch (error) {
            console.log(error);
            if (error.response?.status === 401) {
                showNotificationWithIcon('error', '', 'Please sign in before posting comment')
                dispatch({
                    type: USER_LOGGED_IN,
                    status: false,
                    userInfo: null
                })
                window.location.reload();
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
            console.log("error in getInfoIssue action", error);
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
            console.log(error);
        }
    }
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
            console.log(error);
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
            console.log(error);
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
                // //tien hanh tao history cho issue
                dispatch(createIssueHistory({
                    issue_id: res.data.data._id.toString(),
                    createBy: creator_history,
                    type_history: type_history,
                    name_status: name_status,
                    old_status: old_status,
                    new_status: new_status
                }))

                //if this is add a assignee
                if (props?.assignees) {
                    const getUserNameIndex = projectInfo?.members?.findIndex(user => user.user_info._id.toString() === props?.assignees)
                    if (getUserNameIndex !== -1) {
                        const getUsername = projectInfo?.members[getUserNameIndex].user_info.username
                        sendNotificationToValidUserWithAssigningToIssue(projectInfo, userInfo, res.data.data, dispatch, creator_history, props?.assignees, getUsername)
                    }
                }
                const issueId = res.data.data._id
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
                dispatch(getIssuesBacklog(projectId))

                dispatch(GetSprintListAction(projectId, null))

                dispatch(getIssuesInProject(projectId, null))

                //lấy ra danh sách issue sau khi thay đổi
                dispatch(getInfoIssue(issueId))

                //cap nhat lai danh sach project
                dispatch(GetProjectAction(projectId, null, null))

                showNotificationWithIcon("success", "Cập nhật", "Successfully updated issue")
            }
        } catch (error) {
            console.log(error);

            if (error.response.status === 400) {
                showNotificationWithIcon('error', '', error.response.data.message)
            }
        }
    }
}

export const updateManyIssueAction = (sprint_id, props) => {
    return async dispatch => {
        try {
            const res = await Axios.post(`${domainName}/api/issue/update/issues/`, props)
            if (res.status === 200) {
                //lấy ra danh sách issue sau khi thay đổi
                dispatch(GetSprintAction(sprint_id))

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
                window.location.reload();
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
                window.location.reload();
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

export const getWorklogHistoriesList = (issueId, sort) => {
    return async dispatch => {
        try {
            const res = await Axios.get(`${domainName}/api/issuehistory/worklog-list/${issueId}/${sort}`)
            //lấy ra danh sách issue sau khi thay đổi
            dispatch({
                type: GET_WORKLOG_HISTORIES_LIST,
                worklogList: res.data.data
            })
        } catch (error) {
            showNotificationWithIcon("error", "", "loi")
        }
    }
}

export const createIssueHistory = (props) => {
    return async dispatch => {
        try {
            const res = await Axios.post(`${domainName}/api/issuehistory/issuehistory-create`, {
                issue_id: props.issue_id,
                createBy: props.createBy,
                type_history: props.type_history,
                name_status: props.name_status,
                old_status: props.old_status,
                new_status: props.new_status
            })
            if (res.status === 201) {
                showNotificationWithIcon("success", "", "Tao thanh cong lich su")
            }
        } catch (error) {
            console.log("error trong nay", error);

            showNotificationWithIcon("error", "", "loi tao lich su")
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
            console.log("error trong nay", error);

            showNotificationWithIcon("error", "", "loi tao work log")
        }
    }
}