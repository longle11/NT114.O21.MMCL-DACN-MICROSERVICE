import Axios from "axios"
import { createIssueHistory, getInfoIssue } from "./IssueAction"
import { sendNotificationToValidUserWithSomeoneDeletesTheirComments, sendNotificationToValidUserWithSomeoneMadesComments, sendNotificationToValidUserWithSomeoneModifyTheirComments, showNotificationWithIcon } from "../../util/NotificationUtil"
import { GET_COMMENT_LIST, USER_LOGGED_IN } from "../constants/constant"
import domainName from '../../util/Config'

export const createCommentAction = (props, projectInfo, userInfo, issueInfo) => {
    return async dispatch => {
        try {
            const { data: result, status } = await Axios.post(`${domainName}/api/comments/create`, props)

            await dispatch(getInfoIssue(props.issueId))

            if (status === 201) {
                showNotificationWithIcon('success', '', result.message)
                ///update create history
                dispatch(createIssueHistory({
                    issue_id: props.issueId,
                    createBy: props.creator,
                    type_history: "added",
                    name_status: "a new comment",
                    old_status: null,
                    new_status: null
                }))
                dispatch(getCommentAction(props.issueId, -1))
            }

            sendNotificationToValidUserWithSomeoneMadesComments(projectInfo, userInfo, issueInfo, dispatch)

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

export const getCommentAction = (issue_id, sort) => {
    return async dispatch => {
        try {
            const res = await Axios.get(`${domainName}/api/comments/all/${issue_id}/${sort}`)
            if (res.status === 200) {
                dispatch({
                    type: GET_COMMENT_LIST,
                    commentList: res.data.data
                })
            }
        } catch (error) {
            console.log("error in getCommentAction comment ", error);

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

export const updateCommentAction = (props, projectInfo, userInfo, issueInfo) => {
    return async dispatch => {
        try {
            const res = await Axios.put(`${domainName}/api/comments/update/${props.commentId}`, { content: props.content, timeStamp: props.timeStamp })

            if (res.status === 200) {
                sendNotificationToValidUserWithSomeoneModifyTheirComments(projectInfo, userInfo, issueInfo, dispatch)
                dispatch(getCommentAction(props.issueId, -1))
                showNotificationWithIcon('success', '', res.data.message)
            }
        } catch (error) {
            showNotificationWithIcon('error', '', 'Sửa bình luận thất bại')
        }
    }
}
export const deleteCommentAction = (props, projectInfo, userInfo, issueInfo) => {
    return async dispatch => {
        try {
            const res = await Axios.delete(`${domainName}/api/comments/delete/${props.commentId}`)
            if (res.status === 200) {
                sendNotificationToValidUserWithSomeoneDeletesTheirComments(projectInfo, userInfo, issueInfo, dispatch)
                dispatch(getCommentAction(props.issueId, -1))
                showNotificationWithIcon('success', '', res.data.message)
            }
        } catch (error) {
            showNotificationWithIcon('error', 'Xóa bình luận', 'Xóa bình luận thất bại')
        }
    }
}