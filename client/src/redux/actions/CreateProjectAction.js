import Axios from "axios"
import { DISPLAY_LOADING, GET_PROCESSES_PROJECT, GET_SPRINT_PROJECT, HIDE_LOADING, USER_LOGGED_IN } from "../constants/constant"
import { delay } from "../../util/Delay"
import { showNotificationWithIcon } from "../../util/NotificationUtil"
import domainName from '../../util/Config'
import { GetSprintListAction } from "./ListProjectAction"
export const createProjectAction = (data) => {
    return async dispatch => {
        try {
            dispatch({
                type: DISPLAY_LOADING
            })

            await delay(2000)
            const result = await Axios.post(`${domainName}/api/projectmanagement/create`, data)
            showNotificationWithIcon('success', '', result.data.message)


            //sau khi tao xong thi tien hanh tao dashboard mac dinh
            const getDefaultDashBoard = await Axios.post(`${domainName}/api/issueprocess/create/default/${result.data.data._id.toString()}`)
            dispatch({
                type: GET_PROCESSES_PROJECT,
                processList: getDefaultDashBoard.data.data
            })


            //tien hanh cap nhat thong tin cho user
            const getUserUpdated = await Axios.post(`${domainName}/api/users/update/${data.creator.toString()}`, {
                project_working: result.data.data._id
            })

            dispatch({
                type: USER_LOGGED_IN,
                userInfo: getUserUpdated.data.data
            })
        } catch (error) {
            console.log(error);
            // if (error.response.status === 401) {
            //     showNotificationWithIcon('error', '', 'Please sign in before posting comment')
            //     await dispatch({
            //         type: USER_LOGGED_IN,
            //         status: false,
            //         userInfo: null
            //     })
            //     window.location.reload();
            // }
        }
        dispatch({
            type: HIDE_LOADING
        })
    }
}

export const deleteUserInProject = (userId, projectId) => {
    return async dispatch => {
        try {
            await Axios.put(`${domainName}/api/projectmanagement/delete/user/${projectId}`, { userId })
            showNotificationWithIcon('success', 'Xóa người dùng', 'Xóa thành công người dùng khỏi dự án')
        } catch (errors) {
            showNotificationWithIcon('error', 'Xóa người dùng', errors.response.data.message)
        }
    }
}

export const createSprintAction = (props) => {
    return async dispatch => {
        try {
            const res = await Axios.post(`${domainName}/api/sprint/create`, props)
            if (res.status === 201) {
                showNotificationWithIcon('success', 'Tao moi sprint', 'Tao moi thanh cong 1 sprint')
                dispatch({
                    type: GET_SPRINT_PROJECT,
                    sprintList: res.data.data
                })
            }
        } catch (error) {
            console.log(error);
        }
    }
}

export const deleteSprintAction = (sprintId, projectId) => {
    return async dispatch => {
        try {
            const res = await Axios.post(`${domainName}/api/sprint/delete/${sprintId}`, { project_id: projectId })
            if (res.status === 200) {
                showNotificationWithIcon('success', 'Xoa', res.data.message)
                dispatch({
                    type: GET_SPRINT_PROJECT,
                    sprintList: res.data.data
                })
            }
        } catch (error) {
            console.log(error);

        }
    }
} 

export const updateSprintAction = (sprintId, props) => {
    return async dispatch => {
        try {
            console.log('Gia tri prop cua updateSprintAction ', props);
            
            const res = await Axios.put(`${domainName}/api/sprint/update/${sprintId}`, props)
            console.log("res tra ve tu updateSprintAction ", res);
            
            if (res.status === 200) {
                showNotificationWithIcon('success', 'cap nhat', res.data.message)
                dispatch({
                    type: GET_SPRINT_PROJECT,
                    sprintList: res.data.data
                })
            }
        } catch (error) {
            console.log(error);

        }
    }
} 