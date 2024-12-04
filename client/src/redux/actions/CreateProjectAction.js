import Axios from "axios"
import { CLOSE_DRAWER, DISPLAY_LOADING, GET_A_SPRINT, GET_PROCESSES_PROJECT, GET_PROJECT_API, GET_SPRINT_PROJECT, HIDE_LOADING } from "../constants/constant"
import { delay } from "../../util/Delay"
import { sendNotificationToValidUserWithSprintCreated, sendNotificationToValidUserWithSprintStarted, showNotificationWithIcon } from "../../util/NotificationUtil"
import domainName from '../../util/Config'
import { GetProcessListAction, GetProjectAction, GetSprintListAction, GetWorkflowListAction } from "./ListProjectAction"
import { updateUserInfo } from "./UserAction"
import { createNotificationAction } from "./NotificationAction"
export const createProjectAction = (data) => {
    return async dispatch => {
        try {
            dispatch({
                type: DISPLAY_LOADING
            })

            await delay(2000)
            const result = await Axios.post(`${domainName}/api/projectmanagement/create`, data)
            if (result.status === 201) {
                showNotificationWithIcon('success', '', result.data.message)

                //sau khi tao xong thi tien hanh tao dashboard mac dinh
                const getDefaultDashBoard = await Axios.post(`${domainName}/api/issueprocess/create/default/${result.data.data._id.toString()}`, {
                    workflow_default: data.workflow_default
                })

                dispatch({
                    type: GET_PROJECT_API,
                    projectInfo: result.data.data
                })

                dispatch({
                    type: GET_PROCESSES_PROJECT,
                    processList: getDefaultDashBoard.data.data
                })


                dispatch(updateUserInfo(data.creator.toString(), { project_working: result.data.data._id }))
            }
        } catch (error) {
            
        }
        dispatch({
            type: HIDE_LOADING
        })
    }
}
//cập nhật lại thông tin của project
export const updateProjectAction = (project_id, props, navigate, send_from) => {
    return async dispatch => {
        try {
            const res = await Axios.put(`${domainName}/api/projectmanagement/update/${project_id}`, props)

            if (res.status === 200) {
                dispatch(GetProjectAction(project_id, null, null))
                //proceed to create notification to add user into the project
                if (typeof props?.email === "string" && typeof parseInt(props?.user_role) === "number") {
                    const getUserInfo = await Axios.get(`${domainName}/api/users/findUser?keyword=${props?.email}`)
                    if (getUserInfo.status === 200) {
                        dispatch(createNotificationAction({
                            project_id: res.data.data._id,
                            send_from: send_from,
                            send_to: getUserInfo.data.data._id,
                            link_url: `/projectDetail/${project_id}/board`,
                            content: `Added you into ${res.data.data.name_project} project`,
                            action_type: "projectmanagement-user:added"
                        }))
                    }
                }


                //this case is delete user out project
                if (props?.user_info && !Object.keys(props).includes("user_role")) {
                    dispatch(createNotificationAction({
                        project_id: res.data.data._id,
                        send_from: send_from,
                        send_to: props.user_info,
                        link_url: `projectDetail/${project_id}/board`,
                        content: `Deleted you from ${res.data.data.name_project} project`,
                        action_type: "projectmanagement-user:deleted"
                    }))
                }


                if (props.sprint_id !== null) {
                    if (navigate) {
                        navigate(`/projectDetail/${project_id}/board/${props.sprint_id}`)
                    }
                }
                showNotificationWithIcon('success', '', res.data.message)
                // window.location.reload()
            }
        } catch (error) {
            if (error?.response?.status === 400) {
                showNotificationWithIcon('error', '', error.response.data.message)
            }
        }
    }
}

export const addNewIssueTagProjectAction = (project_id, props) => {
    return async dispatch => {
        try {
            const res = await Axios.put(`${domainName}/api/projectmanagement/update/add-new-issue-tags/${project_id}`, props)
            if (res.status === 200) {
                showNotificationWithIcon('success', '', res.data.message)
                dispatch({
                    type: GET_PROJECT_API,
                    projectInfo: res.data.data
                })
            }
        } catch (errors) {
            showNotificationWithIcon('error', 'Xóa người dùng', errors.response.data.message)
        }
    }
}

export const updateIssueTagProjectAction = (project_id, props) => {
    return async dispatch => {
        try {
            const res = await Axios.put(`${domainName}/api/projectmanagement/update/modify-issue-tags/${project_id}`, props)
            if (res.status === 200) {
                showNotificationWithIcon('success', '', res.data.message)
                dispatch({
                    type: GET_PROJECT_API,
                    projectInfo: res.data.data
                })
            }
        } catch (errors) {
            showNotificationWithIcon('error', 'Xóa người dùng', errors.response.data.message)
        }
    }
}

export const deleteIssueTagProjectAction = (project_id, props) => {
    return async dispatch => {
        try {
            const res = await Axios.put(`${domainName}/api/projectmanagement/update/delete-issue-tags/${project_id}`, props)
            if (res.status === 200) {
                showNotificationWithIcon('success', '', res.data.message)
                dispatch({
                    type: GET_PROJECT_API,
                    projectInfo: res.data.data
                })
            }
        } catch (errors) {
            showNotificationWithIcon('error', 'Xóa người dùng', errors.response.data.message)
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

export const createSprintAction = (props, projectInfo, userInfo) => {
    return async dispatch => {
        try {
            const res = await Axios.post(`${domainName}/api/sprint/create`, props)
            if (res.status === 201) {
                sendNotificationToValidUserWithSprintCreated(projectInfo, userInfo, dispatch, res.data.data)
                dispatch(GetSprintListAction(res.data.data.project_id, null))
                showNotificationWithIcon('success', '', res.data.message)
                //close modal if success
                dispatch({
                    type: CLOSE_DRAWER
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
            console.log("xoa ", res);

            if (res.status === 200) {
                showNotificationWithIcon('success', '', res.data.message)
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

export const deleteProcessAction = (processId, projectId) => {
    return async dispatch => {
        try {
            const res = await Axios.delete(`${domainName}/api/issueprocess/process/${processId}`)
            if (res.status === 200) {
                showNotificationWithIcon('success', '', res.data.message)
                dispatch(GetProcessListAction(projectId))
            }
        } catch (error) {
            console.log(error);

        }
    }
}

export const updateSprintAction = (sprintId, props, project_id, projectInfo, userInfo, sprintInfo) => {
    return async dispatch => {
        try {
            const res = await Axios.put(`${domainName}/api/sprint/update/${sprintId}`, props)

            if (res.status === 200) {
                if(props?.sprint_status === 'processing') {
                    sendNotificationToValidUserWithSprintStarted(projectInfo, userInfo, sprintInfo, dispatch)
                }
                showNotificationWithIcon('success', '', res.data.message)
                dispatch(GetSprintListAction(project_id, null))
                //close modal if success
                dispatch({
                    type: CLOSE_DRAWER
                })
            }

        } catch (error) {
            console.log(error);

        }
    }
}

// export const addUserToProject = (email, role, project_id) => {
//     return async dispatch => {
//         try {
//             const res = await Axios.get(`${domainName}/api/users/findUser?keyword=${email}`)

//             if (res.status === 200) {
//                 dispatch(updateProjectAction(project_id, { user_info: res.data.data._id.toString(), user_role: role }, null))

//             } else {
//                 showNotificationWithIcon('success', 'cap nhat', "Successfully added a new user into project")
//             }
//         } catch (error) {

//         }
//     }
// }