import Axios from "axios"
import { getInfoIssue } from "./IssueAction"
import { showNotificationWithIcon } from "../../util/NotificationUtil"
import { USER_LOGGED_IN } from "../constants/constant"
import { delay } from "../../util/Delay"

export const createCommentAction = (props) => {
    return async dispatch => {
        try {
            const { data: result, status } = await Axios.post("https://jira.dev/api/comments/create", props)

            await delay(1000)

            await dispatch(getInfoIssue(props.issueId))

            if (status === 201) {
                showNotificationWithIcon('success', '', result.message)
            }
        } catch (error) {
            if (error.response.status === 401) {
                showNotificationWithIcon('error', '', 'Please sign in before posting comment')
                dispatch({
                    type: USER_LOGGED_IN,
                    status: false,
                    userInfo: null
                })
                window.location.reload();
            }
        }
    }
}

export const updateCommentAction = (props) => {
    return async dispatch => {
        try {
            await Axios.put(`https://jira.dev/api/comments/update/${props.commentId}`, { content: props.content, timeStamp: props.timeStamp })

            await dispatch(getInfoIssue(props.issueId))

            showNotificationWithIcon('success', 'Chỉnh sửa bình luận', 'Sửa bình luận thành công')
        } catch (error) {
            showNotificationWithIcon('error', 'Chỉnh sửa bình luận', 'Sửa bình luận thất bại')
        }
    }
}
export const deleteCommentAction = (props) => {
    return async dispatch => {
        try {
            await Axios.delete(`https://jira.dev/api/comments/delete/${props.commentId}`)

            await dispatch(getInfoIssue(props.issueId))

            showNotificationWithIcon('success', 'Xóa bình luận', 'Xóa bình luận thành công')
        } catch (error) {
            showNotificationWithIcon('error', 'Xóa bình luận', 'Xóa bình luận thất bại')
        }
    }
}