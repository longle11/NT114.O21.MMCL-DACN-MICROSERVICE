import Axios from "axios"
import { DISPLAY_LOADING, HIDE_LOADING, USER_LOGGED_IN } from "../constants/constant"
import { delay } from "../../util/Delay"
import { showNotificationWithIcon } from "../../util/NotificationUtil"

export const createProjectAction = (data) => {
    return async dispatch => {
        try {
            dispatch({
                type: DISPLAY_LOADING
            })

            await delay(2000)
            const {data: result, status} = await Axios.post("https://jira.dev/api/projectmanagement/create", data)
            showNotificationWithIcon('success', '', result.message)
        }catch(error) {
            if (error.response.status === 401) {
                showNotificationWithIcon('error', '', 'Please sign in before posting comment')
                await dispatch({
                    type: USER_LOGGED_IN,
                    status: false,
                    userInfo: null
                })
                window.location.reload();
            }
        }
        dispatch({
            type: HIDE_LOADING
        })
    }
}

export const deleteUserInProject = (userId, projectId) => {
    return async dispatch => {
        try {
            await Axios.put(`https://jira.dev/api/projectmanagement/delete/user/${projectId}`, {userId})
            showNotificationWithIcon('success', 'Xóa người dùng', 'Xóa thành công người dùng khỏi dự án')
        }catch(errors) {
            showNotificationWithIcon('error', 'Xóa người dùng', errors.response.data.message)
        }
    }
}