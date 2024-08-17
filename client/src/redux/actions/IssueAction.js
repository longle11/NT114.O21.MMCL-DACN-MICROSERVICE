import Axios from "axios"
import { showNotificationWithIcon } from "../../util/NotificationUtil"
import { DISPLAY_LOADING, GET_INFO_ISSUE, GET_ISSUE_HISTORIES_LIST, GET_ISSUES_BACKLOG, GET_WORKLOG_HISTORIES_LIST, HIDE_LOADING, USER_LOGGED_IN } from "../constants/constant"
import { GetProjectAction } from "./ListProjectAction"
import domainName from '../../util/Config'
import { delay } from "../../util/Delay"
export const createIssue = (props, issuesBacklog, old_status, new_status, creator_history) => {
    return async dispatch => {
        try {
            const res = await Axios.post(`${domainName}/api/issue/create`, props)

            if (res.status === 201) {
                //tien hanh tao history cho issue
                dispatch(createIssueHistory({
                    issue_id: res.data.data._id.toString(),
                    createBy: creator_history,
                    type_history: "created",
                    name_status: "Issue",
                    old_status: old_status,
                    new_status: new_status
                }))

                // //sau khi tao thanh cong issue thi tien hanh cap nhat lai danh sach project
                // await Axios.put(`${domainName}/api/projectmanagement/insert/issue`, { project_id: props.projectId, issue_id: res.data?.data._id })

                //cap nhat lai thong tin ve project
                // dispatch(GetProjectAction(props.projectId, ""))
                showNotificationWithIcon('success', '', 'Successfully create issue')

                //add new issue into backlog without calling api
                const newIssueInBacklog = [...issuesBacklog, res.data.data]

                dispatch({
                    type: GET_ISSUES_BACKLOG,
                    issuesBacklog: newIssueInBacklog
                })
            }

        } catch (error) {
            console.log(error);
            if (error.response.status === 401) {
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
            console.log("res in getInfoIssue ", res);
            
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

export const getIssuesBacklog = (projectId) => {
    return async dispatch => {
        try {
            const res = await Axios.get(`${domainName}/api/issue/backlog/${projectId}`)
            console.log("ket qua tra ve ", res.data.data);
            
            dispatch({
                type: GET_ISSUES_BACKLOG,
                issuesBacklog: res.data.data
            })
        } catch (error) {
            console.log(error);
        }
    }
}

export const updateInfoIssue = (issueId, projectId, props, old_status, new_status, creator_history, type_history, name_status) => {
    return async dispatch => {
        try {
            const res = await Axios.put(`${domainName}/api/issue/update/${issueId}`, props)
            console.log("res trong update info ", res);
            
            // //tien hanh tao history cho issue
            dispatch(createIssueHistory({
                issue_id: res.data.data._id.toString(),
                createBy: creator_history,
                type_history: type_history,
                name_status: name_status,
                old_status: old_status,
                new_status: new_status
            }))

            const backlogList = await Axios.get(`${domainName}/api/issue/backlog/${projectId}`)
            console.log("backlogList", backlogList);
            
            dispatch({
                type: GET_ISSUES_BACKLOG,
                issuesBacklog: backlogList.data.data
            })

            //lấy ra danh sách issue sau khi thay đổi
            dispatch(getInfoIssue(issueId))

            //cap nhat lai danh sach project
            dispatch(GetProjectAction(projectId, ""))

            showNotificationWithIcon("success", "Cập nhật", "Successfully updated issue")


        } catch (error) {
            console.log(error);
            
            // if (error.response.status === 401) {
            //     showNotificationWithIcon('error', '', 'Please sign in before posting comment')
            //     dispatch({
            //         type: USER_LOGGED_IN,
            //         status: false,
            //         userInfo: null
            //     })
            //     window.location.reload();
            // } else {
            //     showNotificationWithIcon('error', '', 'Update failed issue')
            // }
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

export const getIssueHistoriesList = (issueId) => {
    return async dispatch => {
        try {
            const res = await Axios.get(`${domainName}/api/issuehistory/issuehistory-list/${issueId}`)
            //lấy ra danh sách issue sau khi thay đổi
            dispatch({
                type: GET_ISSUE_HISTORIES_LIST,
                historyList: res.data.data[0].histories
            })
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

export const createWorklogHistory = (props) => {
    return async dispatch => {
        try {
            const res = await Axios.post(`${domainName}/api/issuehistory/worklog-create`, props)
            
            if (res.status === 201) {
                showNotificationWithIcon("success", "", "Tao thanh cong work log")
            }
        } catch (error) {
            console.log("error trong nay", error);
            
            showNotificationWithIcon("error", "", "loi tao work log")
        }
    }
}