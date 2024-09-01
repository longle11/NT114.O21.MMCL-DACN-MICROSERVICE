import Axios from "axios"
import { GET_A_SPRINT, GET_LIST_PROJECT_API, GET_PROCESSES_PROJECT, GET_PROJECT_API, GET_SPRINT_PROJECT, GET_WORKFLOW_LIST, HIDE_LOADING } from "../constants/constant"
import domainName from '../../util/Config'
import { showNotificationWithIcon } from "../../util/NotificationUtil"
export const ListProjectAction = () => {
    return async dispatch => {
        try {
            const res = await Axios.get(`${domainName}/api/projectmanagement/list`)
            console.log("ListProjectAction ListProjectActionListProjectActionListProjectAction", res);

            dispatch({
                type: GET_LIST_PROJECT_API,
                data: res.data.data
            })
        } catch (errors) {
            console.log("something went wrong", errors);
        }
    }
}


export const GetProjectAction = (id, keyword, navigate) => {
    return async dispatch => {
        try {
            const res = await Axios.get(`${domainName}/api/projectmanagement/${id.toString()}?keyword=${keyword}`)
            if (res.status === 200) {
                console.log("thang res tra ve trong GetProjectAction", res);
                
                if (res.data.data?.sprint_id) {
                    dispatch(GetSprintAction(res.data.data.sprint_id))
                    if(navigate !== null) {
                        navigate(`/projectDetail/${id}/board/${res.data.data.sprint_id}`)
                    }
                } else {
                    if(navigate !== null) {
                        navigate(`/projectDetail/${id}/board`)
                    }
                }
                
                dispatch({
                    type: GET_PROJECT_API,
                    data: res.data.data
                })
            }

        } catch (errors) {
            console.log(errors);
            
        }
    }
}

export const GetProcessListAction = (project_id) => {
    return async dispatch => {
        try {
            const res = await Axios.get(`${domainName}/api/issueprocess/${project_id}`)

            dispatch({
                type: GET_PROCESSES_PROJECT,
                processList: res.data.data
            })
        } catch (errors) {

        }
    }
}

export const CreateProcessACtion = (props) => {
    return async dispatch => {
        try {
            const res = await Axios.post(`${domainName}/api/issueprocess/create`, props)
            console.log('CreateProcessACtion ', res);

            if (res.status === 201) {
                dispatch(GetProcessListAction(res.data.data.project_id.toString()))
                showNotificationWithIcon('success', '', res.data.message)
            }
        } catch (error) {
            if (error.response.status === 400) {
                showNotificationWithIcon('error', '', error.response.data.message)
            }
        }
    }
}

export const GetSprintListAction = (project_id, props) => {
    return async dispatch => {
        try {
            const res = await Axios.post(`${domainName}/api/sprint/${project_id}`, props)
            console.log("GetSprintListAction ", res);

            dispatch({
                type: GET_SPRINT_PROJECT,
                sprintList: res.data.data
            })
        } catch (errors) {

        }
    }
}
export const GetSprintAction = (sprint_id) => {
    return async dispatch => {
        try {
            const res = await Axios.get(`${domainName}/api/sprint/getsprint/${sprint_id}`)
            console.log("res in GetSprintAction", res);

            dispatch({
                type: GET_A_SPRINT,
                sprintInfo: res.data.data
            })
        } catch (errors) {

        }
    }
}

export const GetWorkflowListAction = (project_id) => {
    return async dispatch => {
        try {
            const res = await Axios.get(`${domainName}/api/issueprocess/workflow/${project_id}`)
            dispatch({
                type: GET_WORKFLOW_LIST,
                workflowList: res.data.data
            })
        } catch (errors) {

        }
    }
}

export const UpdateWorkflowAction = (workflow_id, props, navigate) => {
    return async dispatch => {
        try {
            const res = await Axios.put(`${domainName}/api/issueprocess/workflow/update/${workflow_id}`, props)
            if (res.status === 200) {
                showNotificationWithIcon('success', '', res.data.message)
                navigate(`/projectDetail/${props.project_id}/workflows`)
            }
        } catch (errors) {
            console.log("error UpdateWorkflowAction", errors);
        }
    }
}

export const DeleteWorkflowAction = (workflow_id) => {
    return async dispatch => {
        try {
            const res = await Axios.delete(`${domainName}/api/issueprocess/workflow/delete/${workflow_id}`)
            if (res.status === 200) {
                showNotificationWithIcon('success', '', res.data.message)
                window.location.reload()
            }
        } catch (errors) {
            console.log("error UpdateWorkflowAction", errors);
        }
    }
}