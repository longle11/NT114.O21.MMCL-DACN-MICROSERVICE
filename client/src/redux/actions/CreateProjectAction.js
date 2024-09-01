import Axios from "axios"
import { DISPLAY_LOADING, GET_PROCESSES_PROJECT, GET_SPRINT_PROJECT, HIDE_LOADING, USER_LOGGED_IN } from "../constants/constant"
import { delay } from "../../util/Delay"
import { showNotificationWithIcon } from "../../util/NotificationUtil"
import domainName from '../../util/Config'
import { GetWorkflowListAction, ListProjectAction } from "./ListProjectAction"
import { updateUserInfo } from "./UserAction"
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


            dispatch(updateUserInfo(data.creator.toString(), { project_working: result.data.data._id }))
        } catch (error) {
            console.log("Gia tri loi cua createProjectAction", error)
        }
        dispatch({
            type: HIDE_LOADING
        })
    }
}
//cập nhật lại thông tin của project
export const updateProjectAction = (project_id, props, navigate) => {
    return async dispatch => {
        try {
            const res = await Axios.put(`${domainName}/api/projectmanagement/update/${project_id}`, props)
            if (res.status === 200) {
                dispatch(ListProjectAction())
                showNotificationWithIcon('success', '', res.data.message)
                if (props.sprint_id !== null) {
                    navigate(`/projectDetail/${project_id}/board/${props.sprint_id}`)
                }
                window.location.reload()
            }
        } catch (error) {
            if (error?.response?.status === 400) {
                showNotificationWithIcon('error', '', error.response.data.message)
            }
        }
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

export const createWorkflowAction = (props, navigate) => {
    return async dispatch => {
        try {
            const res = await Axios.post(`${domainName}/api/issueprocess/workflow/create`, props)

            if (res.status === 201) {
                dispatch(GetWorkflowListAction(props.project_id))
                showNotificationWithIcon('success', 'Tao moi workflow', res.data.message)

                navigate(`/projectDetail/${props.project_id}/workflows`)

                //removing localstorage for edges and nodes is empty array
                localStorage.removeItem('nodes')
                localStorage.removeItem('edges')
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
            console.log("props truyen vao ben trong updateSprintAction", props);
            
            const res = await Axios.put(`${domainName}/api/sprint/update/${sprintId}`, props)

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

export const addUserToProject = (email, role, project_id) => {
    return async dispatch => {
        try {
            const res = await Axios.get(`${domainName}/api/users/findUser?keyword=${email}`)

            if (res.status === 200) {
                dispatch(updateProjectAction(project_id, { user_info: res.data.data._id.toString(), user_role: role }, null))

            } else {
                showNotificationWithIcon('success', 'cap nhat', "Successfully added a new user into project")
            }
        } catch (error) {

        }
    }
}