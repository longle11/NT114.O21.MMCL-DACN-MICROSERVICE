import Axios from "axios"
import { GET_A_SPRINT, GET_LIST_PROJECT_API, GET_PROCESSES_PROJECT, GET_PROJECT_API, GET_SPRINT_PROJECT, GET_WORKFLOW_LIST } from "../constants/constant"
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


export const GetProjectAction = (id, keyword) => {
    return async dispatch => {
        try {
            const res = await Axios.get(`${domainName}/api/projectmanagement/${id.toString()}?keyword=${keyword}`)
            
            dispatch({
                type: GET_PROJECT_API,
                data: res.data.data
            })
        } catch (errors) {

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
            
            if(res.status === 201) {
                dispatch(GetProcessListAction(res.data.data.project_id.toString()))
                showNotificationWithIcon('success', '', res.data.message)
            }
        } catch (errors) {

        }
    }
}

export const GetSprintListAction = (project_id) => {
    return async dispatch => {
        try {
            const res = await Axios.get(`${domainName}/api/sprint/${project_id}`)
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