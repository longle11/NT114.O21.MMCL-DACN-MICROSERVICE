import Axios from "axios"
import { showNotificationWithIcon } from "../../util/NotificationUtil"
import { GET_INFO_ISSUE, USER_LOGGED_IN } from "../constants/constant"
import { GetProjectAction } from "./ListProjectAction"

export const createIssue = (props) => {
    return async dispatch => {
        try {
            const res = await Axios.post('https://jira.dev/api/issue/create', props)

            //sau khi tao thanh cong issue thi tien hanh cap nhat lai danh sach project
            await Axios.put('https://jira.dev/api/projectmanagement/insert/issue', { project_id: props.projectId, issue_id: res.data?.data._id })

            //cap nhat lai thong tin ve project
            dispatch(GetProjectAction(props.projectId, ""))
            showNotificationWithIcon('success', '', 'Successfully create issue')
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
            }else {
                showNotificationWithIcon('error', '', 'Failed creation issue')
            }
        }
    }
}

export const getInfoIssue = (id) => {
    return async dispatch => {
        try {
            const res = await Axios.get(`https://jira.dev/api/issue/${id}`)
            dispatch({
                type: GET_INFO_ISSUE,
                issueInfo: res.data.data
            })
        } catch (error) {
            console.log("error in getInfoIssue action", error);
        }
    }
}


export const updateInfoIssue = (issueId, projectId, props) => {
    return async dispatch => {
        try {
            await Axios.put(`https://jira.dev/api/issue/update/${issueId}`, { ...props })

            //lấy ra danh sách issue sau khi thay đổi
            dispatch(getInfoIssue(issueId))

            //cap nhat lai danh sach project
            dispatch(GetProjectAction(projectId, ""))

            showNotificationWithIcon("success", "Cập nhật", "Successfully updated issue")


        } catch (error) {
            if (error.response.status === 401) {
                showNotificationWithIcon('error', '', 'Please sign in before posting comment')
                dispatch({
                    type: USER_LOGGED_IN,
                    status: false,
                    userInfo: null
                })
                window.location.reload();
            }else {
                showNotificationWithIcon('error', '', 'Update failed issue')
            }
        }
    }
}

export const deleteAssignee = (issueId, projectId, userId) => {
    return async dispatch => {
        try {
            await Axios.put(`https://jira.dev/api/issue/delete/assignee/${issueId}`, { userId })
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
            }else {
                showNotificationWithIcon('error', '', 'delete failed user from this issue')
            }
        }
    }
}

export const deleteIssue = (issueId) => {
    return async dispatch => {
        try {
            await Axios.delete(`https://jira.dev/api/issue/delete/${issueId}`)
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
            }else {
                showNotificationWithIcon('error', '', 'failed deletion this issue')
            }
        }
    }
}