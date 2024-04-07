import Axios from "axios"
import { GET_CATEGORY_TO_EDIT_DRAWER, GET_ITEM_CATEGORY_DRAWER, USER_LOGGED_IN } from "../constants/constant"
import { ListProjectAction } from "./ListProjectAction"
import { drawerAction } from "./DrawerAction"
import { showNotificationWithIcon } from "../../util/NotificationUtil"

export const getCategory = (props) => {
    return dispatch => {
        dispatch({
            type: GET_CATEGORY_TO_EDIT_DRAWER,
            props: props
        })
    }
}
//lấy ra danh sách dự án hiện tại
export const getItemCategory = (props) => {
    return dispatch => {
        dispatch({
            type: GET_ITEM_CATEGORY_DRAWER,
            props: props
        })
    }
}

//cập nhật lại thông tin của project
export const updateItemCategory = (props) => {
    return async dispatch => {
        try {
            const {data: result, status} = await Axios.put(`https://jira.dev/api/projectmanagement/update/${props.id}`, { props })

            dispatch(ListProjectAction())
            dispatch(drawerAction(true))
            showNotificationWithIcon('success', '', result.message)
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
export const deleteItemCategory = (id) => {
    return async dispatch => {
        try {
            await Axios.delete(`https://jira.dev/api/projectmanagement/delete/${id}`)

            dispatch(ListProjectAction())
            showNotificationWithIcon('success', '', 'Successfully created project')
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
                showNotificationWithIcon('error', '', 'Failed creation project')
            }
        }
    }
}